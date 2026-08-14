import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env } from "../config/env.config.js";
import * as userRepo from "../repositories/user.repository.js";
import { BadRequestError, UnauthorizedError } from "../errors/app-errors.js";


export const signUp = async (name: string, email: string, password: string) => {
    const existingUser = userRepo.findByEmail(email);
    if (existingUser) {
        throw new BadRequestError("Email already exists")
    }
    const hashedPassword = await argon2.hash(password);

    const user = userRepo.createUser({
        id: randomUUID(),
        name,
        email,
        password: hashedPassword
    })

    const accessToken = jwt.sign({
        userId: user.id,
        userEmail: user.email
    }, env.JWT_SECRET, {
        expiresIn: "15m"
    })
    const refreshToken = jwt.sign({
        userId: user.id
    }, env.JWT_REFRESH_SECRET, {
        expiresIn: "7d"
    })

    return { user: { id: user.id, email: user.email }, accessToken, refreshToken }

}

export const login = async (email: string, password: string) => {
    const user = userRepo.findByEmail(email);
    if (!user) {
        throw new UnauthorizedError("Invalid credentials")
    }
    const userVerify = await argon2.verify(user.password, password);
    if (!userVerify) {
        throw new UnauthorizedError(" Invalid credentials")
    }

    const accessToken = jwt.sign({
        userId: user.id,
        userEmail: user.email
    }, env.JWT_SECRET, {
        expiresIn: "15m"
    })
    const refreshToken = jwt.sign({
        userId: user.id
    }, env.JWT_REFRESH_SECRET, {
        expiresIn: "7d"
    })
    return {
        user: {
            id: user.id,
            email: user.email
        },
        accessToken,
        refreshToken
    }

}

export const refresh = async (refreshToken: string) => {
    let payload: { userId: string };

    try {
        payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
    } catch (err) {
        throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = userRepo.findById(payload.userId);
    if (!user) {
        throw new UnauthorizedError("User not found");
    }

    const accessToken = jwt.sign({
        userId: user.id,
        userEmail: user.email
    }, env.JWT_SECRET, {
        expiresIn: "15m"
    });

    return {
        user: { id: user.id, email: user.email },
        accessToken,
    };
};
