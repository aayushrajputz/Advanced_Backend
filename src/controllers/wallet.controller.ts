import { Request, Response, NextFunction } from "express";
import * as walletService from "../services/wallet.service.js"

export const deposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id
        const { amount } = req.body;
        const result = await walletService.deposit(userId, Number(amount));
        res.status(200).json({
            success: true,
            message: "Deposit successful",
            result
        })
    } catch (error) {
        next(error)
    }
}

export const withdraw = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { amount } = req.body;
        const result = await walletService.withdraw(userId, Number(amount));
        res.status(200).json({
            success: true,
            message: "Withdrawal successful",
            result
        })
    } catch (error) {
        next(error)
    }
}

export const transfer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { toUserId, amount } = req.body;
        const result = await walletService.transfer(userId, toUserId, Number(amount));
        res.status(200).json({
            success: true,
            message: "Transfer successful",
            result
        })
    } catch (error) {
        next(error)
    }
} 