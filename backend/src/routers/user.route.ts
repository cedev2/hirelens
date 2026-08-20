import { Router } from "express";
import userController from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const userRouter = Router();

// Sessions
userRouter.get("/sessions", authenticateToken, userController.getSessions);
userRouter.post(
  "/sessions/:sessionId/revoke",
  authenticateToken,
  userController.revokeSession,
);

// Settings
userRouter.put("/password", authenticateToken, userController.updatePassword);
userRouter.put(
  "/notifications",
  authenticateToken,
  userController.updateNotifications,
);
userRouter.put("/2fa", authenticateToken, userController.toggle2FA);
userRouter.delete("/", authenticateToken, userController.deleteAccount);

export default userRouter;
