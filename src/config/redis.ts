import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
})

redis.on("connect", () => {
    console.log("Redis connected sucessfully");

})

redis.on("error", () => {
    console.error("Redis connection error ")
})  