import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/error.middlewares.js";
import authRoutes from "./routes/auth.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import orderRoutes from "./routes/order.routes.js"
import "./config/redis.js";

const app = express();

// Middleware Chain (Guards)
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(cookieParser());

// Health Check Route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/order", orderRoutes);


// Error Handler (LAST!)
app.use(globalErrorHandler);

export default app;
