import express, { type Router } from "express";
import { screeningController } from "../controllers/screening.controller";

const screeningRouter: Router = express.Router();

screeningRouter.get("/", screeningController.getAll);
screeningRouter.get("/job/:jobId", screeningController.getByJobId);
screeningRouter.get("/:screeningId", screeningController.getOne);
screeningRouter.post("/ai/:jobId", screeningController.runAiScreening);
screeningRouter.post("/ai-groq/:jobId", screeningController.runAiScreeningGroq);
screeningRouter.post(
  "/import/hirelens",
  screeningController.runAiScreeningFromHirelens,
);
screeningRouter.post(
  "/import/hirelens-groq",
  screeningController.runAiScreeningFromHirelensGroq,
);
screeningRouter.put("/:screeningId", screeningController.updateScreening);
screeningRouter.delete("/:screeningId", screeningController.deleteScreening);
screeningRouter.post(
  "/:screeningId/interview-email",
  screeningController.sendInterviewEmails,
);
screeningRouter.post(
  "/:screeningId/contract-email",
  screeningController.sendContractEmails,
);

export default screeningRouter;
