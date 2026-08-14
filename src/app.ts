import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/error.middlewares.js";

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

// Error Handler (LAST!)
app.use(globalErrorHandler);

export default app;
