import { Request, Response, NextFunction } from "express";
import * as orderService from "../services/order.service.js"

export const placeOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id
        const { symbol, type, side, quantity, price } = req.body;
        const result = await orderService.placeOrder(userId, symbol, type, side, quantity, price)
        res.status(201).json({
            success: true,
            message: "order placed",
            result
        })
    } catch (error) {
        next(error)
    }
}
