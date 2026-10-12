import { Router } from "express";

import {
    register,
    login,
    me,
    google,
    googleComplete,
    verifyEmail,
    resendVerificationEmail,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", google);
router.post("/google/complete", googleComplete);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Protected route
router.get("/me", authenticate, me);

export default router;