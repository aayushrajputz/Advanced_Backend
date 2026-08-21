import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js"
import { placeOrder } from "../controllers/order.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createOrderSchema } from "../validators/order.validator.js";
import { idempotencyMiddleware } from "../middlewares/idempotency.middleware.js";


const router = Router()

router.post("/place", authenticateJWT, idempotencyMiddleware, validateRequest(createOrderSchema), placeOrder)


export default router 