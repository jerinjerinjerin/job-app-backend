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

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export type VerifyCompanyOtpInput = z.infer<typeof verifyCompanyOtpSchema>;
