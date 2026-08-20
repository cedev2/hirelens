import express, { type Router } from "express";
import { hirelensController } from "../controllers/hirelens.controller";

const hirelensRouter: Router = express.Router();

hirelensRouter.get("/talents/dummy", hirelensController.getDummyTalents);

export default hirelensRouter;
