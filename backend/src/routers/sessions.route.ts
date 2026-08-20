import { Router, RequestHandler } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  getSessions,
  terminateSession,
} from "../controllers/sessions.controller";

const sessionsRouter = Router();

sessionsRouter.get("/", authenticateToken, getSessions as RequestHandler);
sessionsRouter.delete(
  "/:sessionId",
  authenticateToken,
  terminateSession as RequestHandler,
);

export default sessionsRouter;
