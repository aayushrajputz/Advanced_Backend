import { prisma } from "../config/db.js";
import { OrderCreateInput } from "../generated/prisma/models.js";


export const createOrder = async (data: OrderCreateInput) => {
    return await prisma.order.create({
        data
    })
}

export const getPendingOrders = async (symbol: string) => {
    return await prisma.order.findMany({
        where: {
            symbol,
            status: "PENDING"
        },
        orderBy: {
            createdAt: "asc"
        }
    })
}
