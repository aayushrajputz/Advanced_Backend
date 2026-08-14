import { Router } from "express";
import { signUp, login } from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { signupSchema } from "../validators/auth.validator.js";
import { loginSchema } from "../validators/auth.validator.js";
import { logout } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signUp", validateRequest(signupSchema), signUp);
router.post("/login", validateRequest(loginSchema), login);

router.post("/logout", logout);



export default router;

