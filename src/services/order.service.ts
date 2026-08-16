import { BadRequestError } from "../errors/app-errors.js";
import { prisma } from "../config/db.js";

export const placeOrder = async (
    userId: string,
    symbol: string,
    type: "LIMIT" | "MARKET",
    side: "BUY" | "SELL",
    quantity: number,
    price?: number
) => {
    const orderPrice = price || 0;
    const totalCost = quantity * orderPrice;

    return await prisma.$transaction(async (tx) => {
        // 1. Fetch wallet inside transaction and lock the row
        const [wallet]: any[] = await tx.$queryRaw`
            SELECT * FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
        `;

        if (!wallet) {
            throw new BadRequestError("Wallet not found");
        }

        // 2. If BUY order, lock/block the required fiat balance
        if (side === "BUY") {
            if (Number(wallet.balance) < totalCost) {
                throw new BadRequestError("Insufficient available balance");
            }

            // Deduct available balance and move it to locked balance
            await tx.wallet.update({
                where: { userId },
                data: {
                    balance: { decrement: totalCost },
                    locked: { increment: totalCost }
                }
            });
        }

        // 3. Create the Order entry
        const order = await tx.order.create({
            data: {
                userId,
                symbol,
                type,
                side,
                quantity,
                price: orderPrice,
                status: "PENDING"
            }
        });

        return order;
    });
};
