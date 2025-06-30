import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  website: z.string().url("Invalid URL").optional(),
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Phone number must be in valid E.164 format (10 to 15 digits)",
    ),
  userId: z.string().uuid("Invalid user ID"),
});

export const verifyCompanyOtpSchema = z.object({
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Phone number must be in valid E.164 format (10 to 15 digits)",
    ),
  otp: z.string().min(1, "OTP is required"),
});

export const JobTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
]);

export const JobStatusEnum = z.enum(["OPEN", "CLOSED", "PAUSED"]);

export const createJobSchema = z
  .object({
    title: z.string().min(1, "Job title is required"),
    description: z.string().optional(),
    companyId: z.string().min(1, "Company ID is required"),
    createdById: z.string().min(1, "Created by ID is required"),
    type: JobTypeEnum,
    experienceMin: z
      .number()
      .int()
      .nonnegative("Minimum experience must be ≥ 0"),
    experienceMax: z
      .number()
      .int()
      .nonnegative("Maximum experience must be ≥ 0"),
    location: z.string().min(1, "Location is required"),
    isRemote: z.boolean(),
    salaryMin: z.number().int().nonnegative("Minimum salary must be ≥ 0"),
    salaryMax: z.number().int().nonnegative("Maximum salary must be ≥ 0"),
    skills: z.array(z.string().min(1)).min(1, "At least one skill is required"),
    applyUrl: z.string().url("Invalid URL format").optional(),
    expiryJob: z
      .preprocess(
        (arg) =>
          typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg,
        z.date(),
      )
      .refine(
        (date) => {
          const oneWeekFromNow = new Date();
          oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
          return date >= oneWeekFromNow;
        },
        {
          message: "Expiry date must be at least 1 week from now",
        },
      ),

    status: JobStatusEnum,
    images: z.any().optional(), // Defer validation until you upload
  })
  .refine((data) => data.experienceMax >= data.experienceMin, {
    path: ["experienceMax"],
    message: "experienceMax must be greater than or equal to experienceMin",
  })
  .refine((data) => data.salaryMax >= data.salaryMin, {
    path: ["salaryMax"],
    message: "salaryMax must be greater than or equal to salaryMin",
  });

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export type VerifyCompanyOtpInput = z.infer<typeof verifyCompanyOtpSchema>;

export type CreateJobInput = z.infer<typeof createJobSchema>;
