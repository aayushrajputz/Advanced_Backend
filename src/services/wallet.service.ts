import { BadRequestError } from "../errors/app-errors.js";
import * as walletRepo from "../repositories/wallet.repository.js";


export const deposit = async (userId: string, amount: number) => {
    if (amount <= 0) {
        throw new BadRequestError("Deposit amount must be greater than 0");
    }

    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) {
        throw new BadRequestError("Wallet not found");
    }

    return walletRepo.depositFunds(wallet.id, amount, "Wallet Deposit");
};

export const withdraw = async (userId: string, amount: number) => {
    if (amount <= 0) {
        throw new BadRequestError("Withdraw amount must be greater than 0");
    }

    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) {
        throw new BadRequestError("Wallet not found");
    }

    if (Number(wallet.balance) < amount) {
        throw new BadRequestError("Insufficient wallet balance");
    }

    return walletRepo.withdrawFunds(wallet.id, amount, "Wallet Withdraw");
};

export const transfer = async (senderUserId: string, reciverUserId: string, amount: number) => {
    if (amount <= 0) {
        throw new BadRequestError(" Transfer amount must be greater than 0")
    }
    if (senderUserId === reciverUserId) {
        throw new BadRequestError("Cannot transfer fund yourself")
    }
    const senderWallet = await walletRepo.findByUserId(senderUserId)
    if (!senderWallet) {
        throw new BadRequestError("Sender wallet is not found ")
    }
    const reciverWallet = await walletRepo.findByUserId(reciverUserId)
    if (!reciverWallet) {
        throw new BadRequestError("Reciver wallet is not found ")
    }
    if (Number(senderWallet.balance) < amount) {
        throw new BadRequestError("Insufficient wallet balance to Transfer ")
    }
    return walletRepo.transferFunds(senderWallet.id, reciverWallet.id, amount)
}