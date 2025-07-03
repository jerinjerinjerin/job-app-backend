import { z } from "zod";

// Education Entry Schema
export const educationEntrySchema = z.object({
  institution: z
    .string()
    .min(2, "Institution name must be at least 2 characters"),
  degree: z.string().min(2, "Degree must be at least 2 characters"),
  fieldOfStudy: z
    .string()
    .min(2, "Field of study must be at least 2 characters"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
    .optional(),
  grade: z.string().max(10, "Grade must be 10 characters or less").optional(),
  description: z.string().max(1000).optional(),
});

// Experience Entry Schema
export const experienceEntrySchema = z.object({
  company: z.string().min(2, "Company name must be at least 2 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
    .optional(),
  responsibilities: z
    .array(z.string().min(2, "Responsibility must be at least 2 characters"))
    .min(1, "At least one responsibility is required"),
  location: z.string().optional(),
  description: z.string().max(1000).optional(),
});

// Certification Entry Schema
export const certificationEntrySchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  issuer: z.string().min(2, "Issuer must be at least 2 characters"),
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be in YYYY-MM-DD format"),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date must be in YYYY-MM-DD format")
    .optional(),
  credentialUrl: z
    .string()
    .url("Credential URL must be a valid URL")
    .optional(),
});

// Final Resume Schema with stricter validation
export const createResumeSchema = z.object({
  userId: z.string().uuid("Invalid UUID for userId"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  summary: z
    .string()
    .max(2000, "Summary must be less than 2000 characters")
    .optional(),
  skills: z
    .array(z.string().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required"),
  education: z
    .array(educationEntrySchema)
    .max(10, "Max 10 education entries")
    .optional(),
  experience: z
    .array(experienceEntrySchema)
    .max(20, "Max 20 experience entries")
    .optional(),
  certifications: z
    .array(certificationEntrySchema)
    .max(20, "Max 20 certifications")
    .optional(),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
