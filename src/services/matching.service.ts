
import { prisma } from "../config/db.js"

export const matchOrder = async (newOrder: any) => {
    let oppositeOrders: any[] = [];

    if (newOrder.side === "BUY") {
        oppositeOrders = await prisma.order.findMany({
            where: {
                side: "SELL",
                symbol: newOrder.symbol,
                status: "PENDING",
                price: { lte: newOrder.price }
            },
            orderBy: [
                { price: "asc" },
                { createdAt: "asc" }
            ]
        });
    }

    if (newOrder.side === "SELL") {
        oppositeOrders = await prisma.order.findMany({
            where: {
                side: "BUY",
                symbol: newOrder.symbol,
                status: "PENDING",
                price: { gte: newOrder.price }
            },
            orderBy: [
                { price: "desc" },
                { createdAt: "asc" }
            ]
        });
    }
    if (oppositeOrders.length === 0) {
        return null;
    }
    const matchedOrder = oppositeOrders[0];

    const isNewOrderBuy = newOrder.side === "BUY";
    const buyOrder = isNewOrderBuy ? newOrder : matchedOrder;
    const sellOrder = isNewOrderBuy ? matchedOrder : newOrder;

    const tradeQuantity = Number(newOrder.quantity);
    const tradePrice = Number(matchedOrder.price);
    const tradeCost = tradeQuantity * tradePrice;

    return await prisma.$transaction(async (tx) => {
        const [firstUser, secondUser] = buyOrder.userId < sellOrder.userId ? [buyOrder.userId, sellOrder.userId] : [sellOrder.userId, buyOrder.userId];
        await tx.$queryRaw`SELECT *FROM "Wallet" WHERE "userId" = ${firstUser} FOR UPDATE`;
        await tx.$queryRaw`SELECT * FROM "Wallet" WHERE "userId" = ${secondUser} FOR UPDATE`;

        const trade = await tx.trade.create({
            data: {
                buyOrderId: buyOrder.id,
                sellOrderId: sellOrder.id,
                price: tradePrice,
                quantity: tradeQuantity,
            }
        })
        await tx.order.update({
            where: { id: sellOrder.id },
            data: {
                status: "FILLED"
            }
        })
        await tx.order.update({
            where: { id: buyOrder.id },
            data: { status: "FILLED" }
        });
        const updatedBuyWallet = await tx.wallet.update({
            where: {
                userId: buyOrder.userId
            },
            data: {
                locked: {
                    decrement: tradeCost
                }
            }
        })
        const updatedSellWallet = await tx.wallet.update({
            where: { userId: sellOrder.userId },
            data: {
                balance: {
                    increment: tradeCost
                }
            }
        })
        await tx.ledgerEntry.create({
            data: {
                walletId: updatedBuyWallet.id,
                amount: tradeCost,
                type: "DEBIT",
                description: `Trade Executed : Bought ${newOrder.symbol}`,
                balance: updatedBuyWallet.balance
            }

        })

        await tx.ledgerEntry.create({
            data: {
                walletId: updatedSellWallet.id,
                amount: tradeCost,
                type: "CREDIT",
                description: `Trade Executed: Sold ${newOrder.symbol}`,
                balance: updatedSellWallet.balance
            }
        })
        return trade;

    })




}



