import { Document } from "mongoose";

export interface IApplicationSkill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  yearsOfExperience: number;
}

export interface IApplicationExperience {
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

export interface IApplicationEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: Date;
  endYear: Date;
}

export interface IApplicationCertification {
  name: string;
  issuer: string;
  issueDate: Date;
}

export interface IApplication extends Document {
  jobId: string;
  talentId: string;
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired";
  coverLetter?: string;
  cvUrl?: string;
  resumeUrl?: string;
  phoneNumber?: string;
  location?: string;
  skills: IApplicationSkill[];
  experience: IApplicationExperience[];
  education: IApplicationEducation[];
  certifications: IApplicationCertification[];
  appliedAt: Date;
  updatedAt: Date;
  notes?: string;
  screeningId?: string;
}
