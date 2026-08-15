import { prisma } from "../config/db.js";

export interface User {
    id: string,
    name: string,
    email: string,
    password: string,
}

export const createUser = async (user: User) => {
    return await prisma.user.create({
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            wallet: {
                create: {
                    currency: "INR",
                    balance: 0
                }
            }
        }

    })
}
export const findById = async (id: string) => {
    return await prisma.user.findUnique({
        where: { id }
    })
}
export const findByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where: { email }
    })
} 