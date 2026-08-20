import express, { type Router } from "express";
import { chatController } from "../controllers/chat.controller";

const chatRouter: Router = express.Router();

chatRouter.post("/", chatController.sendMessage);

export default chatRouter;
