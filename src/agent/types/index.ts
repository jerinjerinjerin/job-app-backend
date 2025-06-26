import { FileUpload } from "graphql-upload";

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
