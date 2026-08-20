import express, { type Router } from "express";
import { applicationController } from "../controllers/application.controller";

const applicationRouter: Router = express.Router();

applicationRouter.get("/", applicationController.getAll);
applicationRouter.get("/job/:jobId", applicationController.getByJobId);
applicationRouter.get("/talent/:talentId", applicationController.getByTalentId);
applicationRouter.get("/:id", applicationController.getById);
applicationRouter.post("/", applicationController.create);
applicationRouter.put("/:id/status", applicationController.updateStatus);
applicationRouter.delete("/:id", applicationController.delete);

export default applicationRouter;
