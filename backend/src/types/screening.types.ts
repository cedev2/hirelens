import { Document, Schema } from "mongoose";

export interface ICandidates {
  candidateId: string;
  rank: number;
  matchScore: number;
  confidence: "high" | "medium" | "low";
  strengths: string[];
  gaps: string[];
  reasoning: string;
  finalRecommendation: string;
  comparisonNotes?: string;
}

export type PipelineStep =
  | "results"
  | "shortlist"
  | "interview_email"
  | "interview_manage"
  | "contract_generate"
  | "contract_email"
  | "complete";

export type InterviewStatus =
  | "invited"
  | "confirmed"
  | "completed"
  | "no-show"
  | "rejected";

export interface IInterviewCandidate {
  candidateId: string;
  name: string;
  email: string;
  rank: number;
  matchScore: number;
  status: InterviewStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
  rating?: number;
}

export interface IContractCandidate {
  candidateId: string;
  name: string;
  email: string;
  position: string;
  contractText: string;
  status: "pending" | "sent" | "signed" | "declined";
}

export interface IPipelineState {
  currentStep: PipelineStep;
  shortlistedIds: string[];
  interviewCandidates: IInterviewCandidate[];
  contractCandidates: IContractCandidate[];
  completedHires: string[];
}

export interface IScreening extends Document {
  jobId: string;
  candidates: ICandidates[];
  comparisonSummary?: string;
  pipelineState?: IPipelineState;
  createdAt?: Date;
  updatedAt?: Date;
}

// export default IScreening;
