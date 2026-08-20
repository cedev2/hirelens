import { Document } from "mongoose";

export type JobType = "full-time" | "part-time";
export type LocationType = "on-site" | "hybrid" | "remote";
export type Currency = "USD" | "RWF";
export type JobStatus = "open" | "closed" | "draft";

export type ApplicationFieldKey =
  | "cvUpload"
  | "coverLetter"
  | "skills"
  | "experience"
  | "education"
  | "certifications"
  | "phoneNumber"
  | "location";

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string[];
  weights: {
    skills: number;
    experience: number;
    education: number;
  };
  deadline: Date;
  jobType: JobType;
  locationType: LocationType;
  status: JobStatus;
  salary: {
    amount: number;
    currency: Currency;
  };
  benefits: string[];
  applicationFields: ApplicationFieldKey[];
}
