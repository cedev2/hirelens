import express from "express";
import path from "path";
// @ts-ignore
import cors from "cors";
import helmet from "helmet";
// @ts-ignore
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
// @ts-ignore
import swaggerDocument from "./swagger-output.json";

import dbConnect from "./config/dbConnect";
import router from "./routers";
import uploadRouter from "./routers/upload.route";

const app = express();
dbConnect();

// middlewares
app.use(express.json());
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan("dev"));

// routers
app.use("/api/v1", router);
app.use("/api/v1/upload", uploadRouter);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export { app };
