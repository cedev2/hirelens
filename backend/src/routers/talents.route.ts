import express, { type Router } from "express";
import { talentController, resumeUpload } from "../controllers/talents.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const talentRouter: Router = express.Router();

talentRouter.get("/me", authenticateToken, talentController.getMe);
talentRouter.get("/check-completion", authenticateToken, talentController.checkProfileCompletion);
talentRouter.post("/parse-resume", authenticateToken, resumeUpload, talentController.parseResume);
talentRouter.get("/", talentController.getAll);
talentRouter.get("/:talentId", talentController.getById);
talentRouter.post("/", talentController.createTalent);
talentRouter.put("/:talentId", authenticateToken, talentController.updateTalent);
talentRouter.delete("/:talentId", talentController.deleteTalent);

export default talentRouter;
