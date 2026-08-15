import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-errors.js'; // local dev me .ts/.js imports follow structural config
import { ZodError } from 'zod';

export const globalErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    // If it is our custom operational error
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                statusCode: err.statusCode
            }
        });
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: {
                message: "Validation Error",
                statusCode: 400,
                details: err.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message
                }))
            }
        });
    }

    // If it is an unexpected system/programming bug (500)
    console.error("🔥 SYSTEM ERROR:", err.stack || err);
    console.error("🔥 ERROR KEYS:", Object.getOwnPropertyNames(err));
    console.error("🔥 ERROR DETAIL:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    return res.status(500).json({
        success: false,
        error: {
            message: "Something went wrong on our end",
            statusCode: 500
        }
    });
};


