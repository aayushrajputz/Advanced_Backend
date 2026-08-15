import pg from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"
import { env } from "./env.config"

const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: 20,// max no of connections in pool
    idleTimeoutMillis: 30000, // 30 sec connection close time
    connectionTimeoutMillis: 2000// fail fast if db connection takes time more than 2 sec 

})

export const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });