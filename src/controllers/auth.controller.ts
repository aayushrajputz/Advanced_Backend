import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { env } from '../config/env.config.js';
import { UnauthorizedError } from '../errors/app-errors.js';


export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const { user, accessToken, refreshToken } = await authService.signUp(name, email, password);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(201).json({ success: true, data: { user, accessToken } })

    } catch (error) {
        next(error);
    }

}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await authService.login(email, password);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({ success: true, data: { user, accessToken } })

    } catch (error) {
        next(error);
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("refreshToken");
        return res.status(200).json({ success: true, message: "Logout successful" });
    } catch (err) {
        next(err);
    }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new UnauthorizedError("Refresh token missing")

        }
        const { user, accessToken } = await authService.refresh(refreshToken);
        return res.status(200).json({ success: true, data: { user, accessToken } })
    }
    catch (err) {
        next(err)
    }
} 