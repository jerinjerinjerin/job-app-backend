import { sendOtpToPhone } from "../../../aws/sendPhoneOtp/sendOtpPhone";
import { PrismaClient } from "../../../generated/prisma";
import { redis } from "../../../lib/radis";
import { companyOtpService } from "../../../lib/radis/agent";
import { AuthError, ValidationError } from "../../../utils/error-handler/error";
import { generateOtp } from "../../../utils/otp";
import { CompanyServiceI, CompanyVerifyI } from "../../types";

const prisma = new PrismaClient();

const createCompanyService = async (input: CompanyServiceI) => {
  console.log("Creating company service with input:", input);

  try {
    const { name, phone, userId, website, description, logo } = input;

    if (!input.userId) {
      throw new ValidationError("User ID is required.");
    }

    if (!input.name || !input.phone) {
      throw new ValidationError("Name and phone are required fields.");
    }

    const validAgent = await prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!validAgent) {
      throw new ValidationError("Invalid user ID provided.");
    }

    if (validAgent.role !== "AGENT") {
      throw new AuthError("User is not an agent.");
    }

    const existingCompany = await prisma.company.findUnique({
      where: { phone: input.phone },
    });

    if (existingCompany) {
      throw new AuthError("Company with this phone number already exists.");
    }

    const otp = generateOtp();

    await companyOtpService.createCompany(input.phone, otp, input);

    try {
      await sendOtpToPhone(input.phone, otp);
    } catch (err) {
      console.error("🔴 Failed to send OTP via SNS:", err);
      throw new Error("OTP delivery failed");
    }

    return { message: "send otp phone ", success: true };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof AuthError) {
      throw error;
    }

    throw new Error("Unexpected error during company creation");
  }
};

const verifyCompanyOtp = async (input: CompanyVerifyI) => {
  const { phone, otp } = input;

  await companyOtpService.otpVerify(phone, otp);

  const draftRaw = await redis.get(`company_draft:${phone}`);

  if (!draftRaw) {
    throw new AuthError("Invalid or expired company session");
  }

  let draft: Record<string, any>;

  if (typeof draftRaw === "string") {
    try {
      draft = JSON.parse(draftRaw);
    } catch {
      throw new AuthError("Corrupted company data in session");
    }
  } else if (typeof draftRaw === "object") {
    draft = draftRaw as Record<string, any>;
  } else {
    throw new AuthError("Unexpected data type from Redis");
  }

  const company = await prisma.company.create({
    data: {
      ...draft,
      phone: input.phone,
      otp: null,
      verify: true,
      name: draft.name,
      description: draft.description || "",
      website: draft.website || "",
      logo: draft.logo,
      createdBy: {
        connect: { id: draft.userId },
      },
      userId: draft.userId,
    },
  });

  await redis.del(`company_draft:${phone}`);

  return {
    success: true,
    message: "company creating success fully!",
    company,
  };
};

export const companyService = {
  createCompanyService,
  verifyCompanyOtp,
};
