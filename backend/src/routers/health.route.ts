import express, { type Router } from "express";
import { healthControllers } from "../controllers/health.controller";

const healthRouter: Router = express.Router();

healthRouter.get("/", healthControllers.checkHealth);

export default healthRouter;
