import { Document, Schema } from "mongoose";

interface ISkills {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  yearsOfExperience: number;
}

interface ILanguage {
  name: string;
  proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
}

interface IExperience {
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  technologies: string[];
  IsCurrent: boolean;
}

interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: Date;
  endYear: Date;
}
interface ICertifications {
  name: string;
  issuer: string;
  issueDate: Date;
}

interface IProjects {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  startDate: Date;
  endDate?: Date;
}

interface IAvailability {
  status: "Available" | "Open" | "Not Available";
  type: "Full-time" | "Part-time" | "Contract";
  startDate?: Date;
}

export interface ITalent extends Document {
  userId: Schema.Types.ObjectId;
  headline: string;
  bio?: string;
  location: string;
  skills: ISkills[];
  languages?: ILanguage[];
  experience: IExperience[];
  education: IEducation[];
  certifications?: ICertifications[];
  projects: IProjects[];
  availability: IAvailability;
  socialLinks: string[];
  rawCv?: any;
  cvUrl?: string;
}
