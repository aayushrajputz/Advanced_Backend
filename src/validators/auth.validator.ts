
import { z } from "zod";

export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters long "),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "password must be at least 8 characters long")
    })
})

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "password is required")
    })
})

