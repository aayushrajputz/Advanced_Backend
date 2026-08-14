import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { env } from '../config/env.config.js';


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