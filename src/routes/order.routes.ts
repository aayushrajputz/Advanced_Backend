import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js"
import { placeOrder } from "../controllers/order.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createOrderSchema } from "../validators/order.validator.js";


const router = Router()

router.post("/place", authenticateJWT, validateRequest(createOrderSchema), placeOrder)


export default router 