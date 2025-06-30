import { FileUpload } from "graphql-upload";

import { JobStatus, JobType } from "../../generated/prisma"; // This must match the actual generated Prisma enums

export interface CompanyServiceI {
  name: string;
  description: string;
  logo?: string;
  website?: string;
  phone: string;
  userId: string;
}

export interface CompanyResolverI {
  name: string;
  description: string;
  logo?: Promise<FileUpload>;
  website?: string;
  phone: string;
  userId: string;
}

export interface CompanyVerifyI {
  phone: string;
  otp: string;
}

export interface CreateJobServiceI {
  title: string;
  description?: string;
  companyId: string;
  createdById: string;
  type: JobType;
  experienceMin: number;
  experienceMax: number;
  location: string;
  isRemote: boolean;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  applyUrl?: string;
  expiryJob: Date;
  status: JobStatus;
  images: string[];
}

export interface CreateJobResolverI {
  title: string;
  description?: string;
  companyId: string;
  createdById: string;
  type: JobType;
  experienceMin: number;
  experienceMax: number;
  location: string;
  isRemote: boolean;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  applyUrl?: string;
  expiryJob: Date;
  status: JobStatus;
  images: Promise<FileUpload>[];
}
