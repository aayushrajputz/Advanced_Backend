import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";
import { UnauthorizedError } from "../errors/app-errors.js";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1] : req.cookies?.accessToken;


    if (!token) {
        return next(new UnauthorizedError("Authentication token missing"));
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
        (req as any).user = { id: payload.userId, email: payload.email };
        next();
    } catch (error) {
        return next(new UnauthorizedError("Invalid or expired authentication token"));
    }
};
