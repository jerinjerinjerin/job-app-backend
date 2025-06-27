import { sendOtpToPhone } from "../../../aws/sendPhoneOtp/sendOtpPhone";
import { PrismaClient } from "../../../generated/prisma";
import { redis } from "../../../lib/radis";
import { AuthError, ValidationError } from "../../../utils/error-handler/error";
import { generateOtp } from "../../../utils/otp";
import { CompanyServiceI } from "../../types";

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

    const otpKey = `otp:${input.phone}`;
    const attemptsKey = `otp_attempts:${input.phone}`;

    await redis.del(otpKey);
    await redis.del(attemptsKey);

    await redis.set(otpKey, otp, { ex: 300 });
    await redis.set(attemptsKey, "0", { ex: 300 });

    try {
      await sendOtpToPhone(input.phone, otp);
    } catch (err) {
      console.error("🔴 Failed to send OTP via SNS:", err);
      throw new Error("OTP delivery failed");
    }

    const company = await prisma.company.create({
      data: {
        name,
        description,
        logo,
        website,
        otp,
        phone,
        createdBy: {
          connect: { id: userId },
        },
        verify: false,
        updatedAt: new Date(),
      },
    });

    return { company };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof AuthError) {
      throw error;
    }

    throw new Error("Unexpected error during company creation");
  }
};

export const companyService = {
  createCompanyService,
};
