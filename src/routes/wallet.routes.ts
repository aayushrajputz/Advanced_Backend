import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import * as WalletController from "../controllers/wallet.controller.js"

const router = Router()

router.post("/deposit", authenticateJWT, WalletController.deposit)

router.post("/withdraw", authenticateJWT, WalletController.withdraw)

router.post("/transfer", authenticateJWT, WalletController.transfer)

router.get("/history", authenticateJWT, WalletController.getHistory)

export default router 