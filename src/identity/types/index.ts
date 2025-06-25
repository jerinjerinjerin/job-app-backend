import { FileUpload } from "graphql-upload";

export interface SignI {
  name: string;
  email: string;
  password: string;
  role?: string;
  profilePic?: Promise<FileUpload>;
}

// Input to service (after upload is complete)
export interface SignServiceInput {
  name: string;
  email: string;
  password: string;
  role?: string;
  profilePic?: string; // S3 URL
}

export interface OtpI {
  email: string;
  otp: string;
}

export interface LoginI {
  email: string;
  password: string;
}
