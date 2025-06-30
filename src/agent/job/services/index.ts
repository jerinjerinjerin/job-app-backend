import { PrismaClient } from "../../../generated/prisma";
import log from "../../../lib/logger";
import { AuthError } from "../../../utils/error-handler/error";
import { CreateJobServiceI } from "../../types";

const prisma = new PrismaClient();

const createJob = async (input: CreateJobServiceI) => {
  const {
    companyId,
    createdById,
    description = "",
    experienceMax,
    experienceMin,
    expiryJob,
    images,
    isRemote,
    location,
    salaryMax,
    salaryMin,
    skills,
    status,
    title,
    type,
    applyUrl,
  } = input;

  try {
    const validCompany = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!validCompany) {
      log.error(
        "Company not found or you are not authorized to create a job for this company",
      );
      throw new AuthError(
        "Company not found or you are not authorized to create a job for this company",
      );
    }

    const existingJob = await prisma.job.findFirst({
      where: { title, companyId },
    });

    if (existingJob) {
      log.error("Job with this title already exists for this company");
      throw new AuthError(
        "Job with this title already exists for this company",
      );
    }

    const validUser = await prisma.user.findUnique({
      where: { id: createdById },
    });

    if (!validUser) {
      log.error("User not found or you are not authorized to create a job");
      throw new AuthError(
        "User not found or you are not authorized to create a job",
      );
    }

    const validRole = validUser.role === "AGENT" || validUser.role === "ADMIN";

    if (!validRole) {
      log.error("You are not authorized to create a job");
      throw new AuthError("You are not authorized to create a job");
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        companyId,
        createdById,
        type,
        experienceMin,
        experienceMax,
        location,
        isRemote,
        salaryMin,
        salaryMax,
        skills: { set: skills },
        applyUrl,
        expiryJob,
        status,
        images: images?.map((img) => img.toString()) ?? [],
      },
    });

    return {
      success: true,
      message: "Job created successfully",
      data: job,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    log.error(`Failed to create job: ${error}`);
    throw new Error("Internal server error");
  }
};

export const jobServices = {
  createJob,
};
