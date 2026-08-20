import express, { type Router } from "express";
import { jobsController } from "../controllers/jobs.controller";

const jobsRouter: Router = express.Router();

jobsRouter.get("/", jobsController.getAll);
jobsRouter.get("/:jobId", jobsController.getOne);
jobsRouter.post("/", jobsController.createJob);
jobsRouter.put("/:jobId", jobsController.updateJob);
jobsRouter.delete("/:jobId", jobsController.deleteJob);

export default jobsRouter;
