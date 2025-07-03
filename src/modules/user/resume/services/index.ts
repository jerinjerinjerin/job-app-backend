import { Prisma, PrismaClient } from "../../../../generated/prisma";
import { generateResumeFromGemini } from "../../../../lib/gemini/index";
import resumePrompt from "../../../../lib/gemini/promt";
import log from "../../../../lib/logger";
import { AuthError } from "../../../../utils/error-handler/error";
import { createResumeServiceI } from "../types";

const prisma = new PrismaClient();

const createResumeServices = async (args: createResumeServiceI) => {
  const {
    skills,
    title,
    userId,
    certifications,
    education,
    experience,
    profilePic,
    summary,
  } = args;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      log.error(`User not found`);
      throw new AuthError("User not found");
    }

    const createdResume = await prisma.resume.create({
      data: {
        userId,
        title,
        summary,
        skills,
        education: education as unknown as Prisma.InputJsonValue,
        experience: experience as unknown as Prisma.InputJsonValue,
        certifications: certifications as unknown as Prisma.InputJsonValue,
        profilePic,
      },
    });

    const prompt = resumePrompt(createdResume);
    log.debug(`promt: ${prompt}`);

    const html = await generateResumeFromGemini(prompt);

    log.debug(`html: ${html}`);

    const fileUrl = `data:text/html;base64,${Buffer.from(html).toString("base64")}`;

    const finalResume = await prisma.resume.update({
      where: { id: createdResume.id },
      data: { resumeUrl: fileUrl },
    });

    return finalResume;
  } catch (error) {
    log.error(`Failed to create resume", ${error}`);
    throw error;
  }
};

export const resumeServices = {
  createResumeServices,
};
