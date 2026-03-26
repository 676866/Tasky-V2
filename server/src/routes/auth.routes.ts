import { Router } from "express";
import { signup, login, getMe, neonSession, checkEmail, sendOtp, completeOnboarding } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

export const authRouter = Router();

authRouter.post("/check-email", checkEmail);
authRouter.post("/send-otp", sendOtp);
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/neon-session", neonSession);
authRouter.get("/me", authenticate, getMe);
authRouter.post("/onboarding-complete", authenticate, completeOnboarding);
