import { Schema, model } from "mongoose";
import { ITalent } from "../types/talents.types";

const talentSchema = new Schema<ITalent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    headline: { type: String, required: true },
    bio: { type: String },
    location: { type: String },
    skills: [
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
    languages: [
      {
        name: { type: String },
        proficiency: {
          type: String,
          enum: ["Basic", "Conversational", "Fluent", "Native"],
        },
      },
    ],
    experience: [
      {
        company: { type: String },
        role: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String },
        technologies: [String],
        IsCurrent: { type: Boolean, default: false },
      },
    ],
    education: [
      {
        institution: { type: String },
        degree: { type: String },
        fieldOfStudy: { type: String },
        startYear: { type: Date },
        endYear: { type: Date },
      },
    ],
    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        issueDate: { type: Date },
      },
    ],
    projects: [
      {
        name: { type: String },
        description: { type: String },
        technologies: [String],
        role: { type: String },
        link: String,
        startDate: { type: Date },
        endDate: Date,
      },
    ],
    availability: {
      status: {
        type: String,
        enum: ["Available", "Open", "Not Available"],
      },
      type: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract"],
      },
      startDate: Date,
    },
    socialLinks: [String],
    rawCv: Schema.Types.Mixed,
    cvUrl: { type: String },
  },
  { timestamps: true },
);

const Talent = model<ITalent>("Talent", talentSchema);

export default Talent;
