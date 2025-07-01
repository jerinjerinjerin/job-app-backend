import { FileUpload } from "graphql-upload";

export interface ApplicationServiceI {
  userId: string;
  jobId: string;
  resumeUrl: string;
  coverNote?: string;
}

export interface ApplicationResolverI {
  userId: string;
  jobId: string;
  resumeUrl: Promise<FileUpload>;
  coverNote?: string;
}
