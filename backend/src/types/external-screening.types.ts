import { Document } from "mongoose";

export interface IExternalApplicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  headline?: string;
  resumeUrl?: string;
  resumeText?: string;
  source: string;
  rawData: Record<string, any>;
}

export interface IExternalScreeningResult {
  applicantId: string;
  matchScore: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  reasoning: string;
  strengths: string[];
  gaps: string[];
  recommendation: "highly_recommended" | "recommended" | "consider" | "not_suitable";
}

export interface IExternalScreening extends Document {
  jobId: string;
  totalApplicants: number;
  processedApplicants: number;
  topCandidates: IExternalScreeningResult[];
  allResults: IExternalScreeningResult[];
  status: "pending" | "processing" | "completed" | "failed";
  sourceFile: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedResume {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  headline?: string;
  summary?: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    description: string;
    startDate?: string;
    endDate?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
  }>;
  certifications?: string[];
}

export interface UploadScreeningRequest {
  jobId: string;
  topN?: number;
}
