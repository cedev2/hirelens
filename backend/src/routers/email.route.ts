import express, { type Router } from "express";
import { emailController } from "../controllers/email.controller";

const emailRouter: Router = express.Router();

emailRouter.post("/send/:screeningId", emailController.sendScreeningResults);
emailRouter.post("/preview", emailController.previewEmail);

export default emailRouter;
