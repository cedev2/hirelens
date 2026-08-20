import { Schema, model } from "mongoose";
import { IExternalScreening } from "../types/external-screening.types";

const externalScreeningResultSchema = new Schema({
  applicantId: { type: String, required: true },
  matchScore: { type: Number, required: true },
  skillsMatch: { type: Number, required: true },
  experienceMatch: { type: Number, required: true },
  educationMatch: { type: Number, required: true },
  reasoning: { type: String, required: true },
  strengths: { type: [String], default: [] },
  gaps: { type: [String], default: [] },
  recommendation: {
    type: String,
    enum: ["highly_recommended", "recommended", "consider", "not_suitable"],
    required: true,
  },
}, { _id: false });

const externalScreeningSchema = new Schema<IExternalScreening>(
  {
    jobId: { type: String, required: true, index: true },
    totalApplicants: { type: Number, required: true },
    processedApplicants: { type: Number, default: 0 },
    topCandidates: { type: [externalScreeningResultSchema], default: [] },
    allResults: { type: [externalScreeningResultSchema], default: [] },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    sourceFile: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const ExternalScreening = model<IExternalScreening>("ExternalScreening", externalScreeningSchema);

export default ExternalScreening;
