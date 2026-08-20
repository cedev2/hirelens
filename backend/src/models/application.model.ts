import { Schema, model } from "mongoose";
import { IApplication } from "../types/application.types";

const applicationSchema = new Schema<IApplication>(
  {
    jobId: { type: String, required: true, index: true, ref: "Job" },
    talentId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
      default: "pending",
      required: true,
    },
    coverLetter: { type: String },
    cvUrl: { type: String },
    resumeUrl: { type: String },
    phoneNumber: { type: String },
    location: { type: String },
    skills: {
      type: [
        {
          name: { type: String, required: true },
          level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
            required: true,
          },
          yearsOfExperience: { type: Number, required: true },
        },
      ],
      default: [],
    },
    experience: {
      type: [
        {
          company: { type: String, required: true },
          role: { type: String, required: true },
          startDate: { type: Date, required: true },
          endDate: { type: Date },
          description: { type: String },
          technologies: { type: [String], default: [] },
          isCurrent: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    education: {
      type: [
        {
          institution: { type: String, required: true },
          degree: { type: String, required: true },
          fieldOfStudy: { type: String, required: true },
          startYear: { type: Date, required: true },
          endYear: { type: Date, required: true },
        },
      ],
      default: [],
    },
    certifications: {
      type: [
        {
          name: { type: String, required: true },
          issuer: { type: String, required: true },
          issueDate: { type: Date, required: true },
        },
      ],
      default: [],
    },
    notes: { type: String },
    screeningId: { type: String },
  },
  { timestamps: true },
);

applicationSchema.index({ jobId: 1, talentId: 1 }, { unique: true });

const Application = model<IApplication>("Application", applicationSchema);

export default Application;
