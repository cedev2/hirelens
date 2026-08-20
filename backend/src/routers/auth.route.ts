import express, { type Router, RequestHandler } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const authRouter: Router = express.Router();

const auth = requireAuth as RequestHandler;

// Registration
authRouter.post("/register/local", authController.registerLocal);
authRouter.post("/register/applicant", authController.registerApplicant);

// Login
authRouter.post("/login/local", authController.loginLocal);

// Current user
authRouter.get("/me", auth, authController.getMe);

// Refresh token
authRouter.post("/refresh", auth, authController.refreshToken);

// Logout
authRouter.post("/logout", auth, authController.logout);

// Update profile
authRouter.put("/profile", auth, authController.updateProfile);

// Update password
authRouter.put("/password", auth, authController.updatePassword);

export default authRouter;
