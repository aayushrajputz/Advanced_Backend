import { z } from "zod"
import dotenv from "dotenv"

dotenv.config();

export const envSchema = z.object({
    PORT: z.string().default("3000").transform((val) => parseInt(val, 10)),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at least 32 char long for security" }),
    JWT_REFRESH_SECRET: z.string().min(32, { message: "JWT_REFRESH_SECRET must be at least 32 char long for security" }),

    DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid connection URL" })
})


const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.log("invalid env variables :", parsedEnv.error.format());
    process.exit(1);



}
export const env = parsedEnv.data;