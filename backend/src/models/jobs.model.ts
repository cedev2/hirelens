import { Schema, model } from "mongoose";
import { IJob } from "../types/job.types";

const jobsSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: [String], required: true },
    weights: {
      skills: { type: Number, required: true },
      experience: { type: Number, required: true },
      education: { type: Number, required: true },
    },
    deadline: { type: Date, required: true },
    jobType: { type: String, enum: ["full-time", "part-time"], required: true },
    locationType: {
      type: String,
      enum: ["on-site", "hybrid", "remote"],
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",
      required: true,
    },
    salary: {
      amount: { type: Number, required: true },
      currency: { type: String, enum: ["USD", "RWF"], required: true },
    },
    benefits: { type: [String], default: [] },
    applicationFields: {
      type: [String],
      enum: [
        "cvUpload",
        "coverLetter",
        "skills",
        "experience",
        "education",
        "certifications",
        "phoneNumber",
        "location",
      ],
      default: [
        "cvUpload",
        "coverLetter",
        "skills",
        "experience",
        "education",
        "certifications",
        "phoneNumber",
        "location",
      ],
    },
  },
  {
    timestamps: true,
  },
);

const Jobs = model<IJob>("Job", jobsSchema);

export default Jobs;
