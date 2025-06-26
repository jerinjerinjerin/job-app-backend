import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  website: z.string().url("Invalid URL").optional(),
  phone: z
    .string()
    .regex(/^\d{10,15}$/, "Phone number must be between 10 to 15 digits"),
  userId: z.string().uuid("Invalid user ID"),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
