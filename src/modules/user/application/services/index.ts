import { PrismaClient } from "../../../../generated/prisma";
import log from "../../../../lib/logger";
import { AuthError } from "../../../../utils/error-handler/error";
import { ApplicationServiceI } from "../types";

const prisma = new PrismaClient();

const createApplication = async (input: ApplicationServiceI) => {
  const { jobId, resumeUrl, userId, coverNote } = input;

  try {
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existingJob) {
      log.error("Job not found.");
      throw new Error("Job not found.");
    }

    const isValidUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isValidUser) {
      log.error("User not found.");
      throw new AuthError("User not found.");
    }

    // Check for existing application by same user to same job
    const alreadyApplied = await prisma.application.findFirst({
      where: {
        jobId,
        userId,
      },
    });

    if (alreadyApplied) {
      log.warn(`User ${userId} has already applied to job ${jobId}.`);

      return {
        success: false,
        message: "You have already applied to this job.",
      };
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        resumeUrl,
        userId,
        coverNote,
      },
    });

    return {
      success: true,
      message: "Job application created successfully.",
      data: application,
    };
  } catch (error: any) {
    if (error instanceof AuthError) {
      log.error(`Application creation failed: ${error.message}`);
      throw new AuthError(`Application creation failed: ${error.message}`);
    }

    log.error(`Error creating application: ${error.message || error}`);
    throw new Error("Internal server error while creating application.");
  }
};

export const applicationService = {
  createApplication,
};
