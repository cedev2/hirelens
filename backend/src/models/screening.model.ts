import { Schema, model } from "mongoose";
import { IScreening, ICandidates } from "../types/screening.types";

const screeningSchema = new Schema<IScreening>(
  {
    jobId: { type: String, required: true },
    candidates: {
      type: [
        {
          candidateId: { type: String, required: true },
          rank: { type: Number, required: true },
          matchScore: { type: Number, required: true, min: 0, max: 100 },
          confidence: {
            type: String,
            enum: ["high", "medium", "low"],
            required: true,
          },
          strengths: { type: [String], default: [] },
          gaps: { type: [String], default: [] },
          reasoning: { type: String, required: true },
          finalRecommendation: { type: String, required: true },
          comparisonNotes: { type: String },
        },
      ],
      required: true,
    },
    comparisonSummary: { type: String },
    pipelineState: {
      type: {
        currentStep: {
          type: String,
          enum: [
            "results",
            "shortlist",
            "interview_email",
            "interview_manage",
            "contract_generate",
            "contract_email",
            "complete",
          ],
          default: "results",
        },
        shortlistedIds: { type: [String], default: [] },
        interviewCandidates: {
          type: [
            {
              candidateId: String,
              name: String,
              email: String,
              rank: Number,
              matchScore: Number,
              status: {
                type: String,
                enum: [
                  "invited",
                  "confirmed",
                  "completed",
                  "no-show",
                  "rejected",
                ],
              },
              scheduledDate: String,
              scheduledTime: String,
              notes: String,
              rating: Number,
            },
          ],
          default: [],
        },
        contractCandidates: {
          type: [
            {
              candidateId: String,
              name: String,
              email: String,
              position: String,
              contractText: String,
              status: {
                type: String,
                enum: ["pending", "sent", "signed", "declined"],
                default: "pending",
              },
            },
          ],
          default: [],
        },
        completedHires: { type: [String], default: [] },
      },
      default: null,
    },
  },
  { timestamps: true },
);

const Screening = model<IScreening>("Screening", screeningSchema);

export default Screening;
