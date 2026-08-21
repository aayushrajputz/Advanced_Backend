import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/app-errors.js";
import { redis } from "../config/redis.js";

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.headers["x-idempotency-key"] as string;

    if (!idempotencyKey) {
        throw new BadRequestError("X-idempotency-key header is required")
    }


    const cacheKey = `idempotency:${idempotencyKey}`;
    const existing = await redis.get(cacheKey)

    if (existing) {
        const { status, body } = JSON.parse(existing);
        return res.status(status).json(body);


    }
    const originalJson = res.json;
    res.json = function (body: any) {
        redis.set(cacheKey, JSON.stringify({ status: res.statusCode, body }), "EX", 86400);
        return originalJson.call(res, body);
    } as any;
    next();

}





