import { z } from "zod"
import dotenv from "dotenv"
import { log } from "node:console";

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default("3000").transform((val) => parseInt(val, 10)),

    JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at least 32 char long for security" }),
    JWT_REFRESH_SECRET: z.string().min(32, { message: "JWT_REFRESH_SECRET must be at least 32 char long for security" })
})

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.log("invalid env variables :", parsedEnv.error.format());
    process.exit(1);



}
export const env = parsedEnv.data;