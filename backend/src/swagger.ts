import swaggerAutogen from "swagger-autogen";
import ENV from "./config/env";

const doc = {
  info: {
    version: "v1.0.0",
    title: "HireLens API",
    description:
      "An AI Recruiter system that explains, compares, and guides hiring decisions",
  },
  host: `localhost:${ENV.port}`,
  basePath: "/api/v1/",
  schemes: ["http", "https"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["src/routers/index.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
