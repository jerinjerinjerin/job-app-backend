import { FileUpload } from "graphql-upload";

export interface createResumeServiceI {
  userId: string;
  title: string;
  summary?: string;
  skills: string[];
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  certifications?: CertificationEntry[];
  profilePic?: string;
}

export interface createResumeResolversI {
  userId: string;
  title: string;
  summary?: string;
  skills: string[];
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  certifications?: CertificationEntry[];
  profilePic?: Promise<FileUpload>;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  responsibilities: string[];
  location?: string;
  description?: string;
}

export interface CertificationEntry {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}
