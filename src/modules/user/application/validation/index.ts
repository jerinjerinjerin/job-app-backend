import { z } from "zod";

export const createApplicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required."),
  userId: z.string().min(1, "User ID is required."),
  coverNote: z.string().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
