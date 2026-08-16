import { BadRequestError } from "../errors/app-errors.js";
import { prisma } from "../config/db.js";

export const findByUserId = async (userId: string) => {
    return await prisma.wallet.findUnique({
        where: { userId }
    });
};

export const depositFunds = async (walletId: string, amount: number, description: string) => {
    return await prisma.$transaction(async (tx: any) => {
        // 1. Update Wallet Balance
        const updatedWallet = await tx.wallet.update({
            where: { id: walletId },
            data: {
                balance: { increment: amount },
                version: { increment: 1 } // Optimistic Locking
            }
        });

        // 2. Log Credit Ledger Entry
        const ledgerEntry = await tx.ledgerEntry.create({
            data: {
                walletId,
                amount,
                type: "CREDIT",
                description,
                balance: updatedWallet.balance
            }
        });

        return { wallet: updatedWallet, ledgerEntry };
    });
};

export const withdrawFunds = async (walletId: string, amount: number, description: string) => {
    return await prisma.$transaction(async (tx: any) => {
        // 1. Deduct Wallet Balance
        // 1. Acquire exclusive Pessimistic lock on the wallet row
        const [wallet] = await tx.$queryRaw<any[]>`
            SELECT * FROM "Wallet" WHERE id = ${walletId} FOR UPDATE
        `;
        if (!wallet) {
            throw new BadRequestError("Wallet not found");
        }
        // Double-check balance inside the lock boundary!
        if (Number(wallet.balance) < amount) {
            throw new BadRequestError("Insufficient wallet balance");
        }
        // 2. Safe update within lock transaction
        const updatedWallet = await tx.wallet.update({
            where: { id: walletId },
            data: {
                balance: { decrement: amount }
            }
        });
        // 2. Log Debit Ledger Entry
        // 3. Log ledger entry
        const ledgerEntry = await tx.ledgerEntry.create({
            data: {
                walletId,
                amount,
                type: "DEBIT",
                description,
                balance: updatedWallet.balance
            }
        });
        return { wallet: updatedWallet, ledgerEntry };
    });
};
export const transferFunds = async (senderWalletId: string, recepientWalletId: string, amount: number) => {
    return await prisma.$transaction(async (tx: any) => {
        // 1. Sort IDs to prevent Deadlocks (Crucial Interview Step!)
        const [firstId, secondId] = senderWalletId < recepientWalletId ? [senderWalletId, recepientWalletId] : [recepientWalletId, senderWalletId];

        // 2. Lock rows in sorted order
        await tx.$queryRaw`SELECT * FROM "Wallet" WHERE id = ${firstId} FOR UPDATE`;
        await tx.$queryRaw`SELECT * FROM "Wallet" WHERE id = ${secondId} FOR UPDATE`;

        // 3. Fetch sender's current balance inside lock
        const senderWallet = await tx.wallet.findUnique({ where: { id: senderWalletId } });
        if (!senderWallet || Number(senderWallet.balance) < amount) {
            throw new BadRequestError("Insufficient wallet balance for transfer");
        }

        // 4. Update balances
        const updatedSenderWallet = await tx.wallet.update({
            where: { id: senderWalletId },
            data: {
                balance:
                    { decrement: amount }
            }
        });

        const updatedReceiverWallet = await tx.wallet.update({
            where: { id: recepientWalletId },
            data: {
                balance:
                    { increment: amount }
            }
        });

        // 5. Create Ledger entries for audit trail
        await tx.ledgerEntry.create({
            data: {
                walletId: senderWalletId,
                amount,
                type: "DEBIT",
                description: "Transfer to wallet",
                balance: updatedSenderWallet.balance
            }
        });

        await tx.ledgerEntry.create({
            data: {
                walletId: recepientWalletId,
                amount,
                type: "CREDIT",
                description: "Transfer from wallet",
                balance: updatedReceiverWallet.balance
            }
        });

        return { senderWallet: updatedSenderWallet, recepientWallet: updatedReceiverWallet };
    });
};
