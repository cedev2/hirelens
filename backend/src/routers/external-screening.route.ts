import { Router } from "express";
import externalScreeningController, {
  upload,
} from "../controllers/external-screening.controller";

const router = Router();

// Upload CSV/Excel and start screening
router.post(
  "/upload",
  upload.single("file"),
  externalScreeningController.uploadAndScreen,
);

router.post(
  "/upload-groq",
  upload.single("file"),
  externalScreeningController.uploadAndScreenGroq,
);

// Get screening results (top candidates)
router.get("/results/:screeningId", externalScreeningController.getResults);

// Get detailed results with all candidates
router.get(
  "/results/:screeningId/detailed",
  externalScreeningController.getDetailedResults,
);

// Get all screenings for a job
router.get("/job/:jobId", externalScreeningController.getScreeningsByJob);

export default router;
