import bcrypt from "bcryptjs";
import { add } from "date-fns";
import express from "express";
import { OAuth2Client } from "google-auth-library";

import { sendOtpEmail } from "../../aws/sendEmail/auth/verifyOtp";
import { PrismaClient, Role } from "../../generated/prisma";
import { config } from "../../lib/config";
import { redis } from "../../lib/radis/index";
import { AuthError, ValidationError } from "../../utils/error-handler/error";
import { generateOtp } from "../../utils/otp";
import { SignServiceInput } from "../types";
import { setAuthCookies } from "../utils/sendCookie";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/token";

const prisma = new PrismaClient();
const client = new OAuth2Client(config.google_client_id);

const signupService = async (input: SignServiceInput) => {
  try {
    if (!input.email) {
      throw new ValidationError("Email is missing in input");
    }

    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) throw new AuthError("Email already exists");

    const hashed = await bcrypt.hash(input.password, 10);

    const role =
      input.role && Object.values(Role).includes(input.role as Role)
        ? (input.role as Role)
        : Role.USER;

    const otp = generateOtp();

    await sendOtpEmail(input.email, otp);

    const otpKey = `otp:${input.email}`;
    const attemptsKey = `otp_attempts:${input.email}`;

    await redis.del(otpKey);
    await redis.del(attemptsKey);

    await redis.set(otpKey, otp, { ex: 300 });
    await redis.set(attemptsKey, "0", { ex: 300 });

    const profilePicUrl =
      input.profilePic || "https://your-default-image-url.com/default.png";

    console.log("Profile picture URL:", profilePicUrl); // Debug log

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashed,
        name: input.name,
        provider: "local",
        role,
        otp,
        profilePic: profilePicUrl,
      },
    });

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);

    return { user, accessToken, refreshToken };
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthError(error.message);
    }
  }
};

const verifyOtpService = async (input: { email: string; otp: string }) => {
  try {
    const { email, otp } = input;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthError("User not found");
    }

    const otpKey = `otp:${email}`;
    const attemptsKey = `otp_attempts:${email}`;

    const [storedOtpRaw, attemptStr] = await Promise.all([
      redis.get(otpKey),
      redis.get(attemptsKey),
    ]);

    const storedOtp = storedOtpRaw?.toString().trim();

    const attempts = parseInt(attemptStr?.toString() || "0");

    if (!storedOtp) {
      throw new AuthError("OTP not found or expired");
    }

    if (attempts >= 3) {
      throw new AuthError("Too many incorrect attempts. OTP locked.");
    }

    if (otp.trim() !== storedOtp) {
      await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, 300);
      throw new AuthError(`Incorrect OTP. Attempt ${attempts + 1} of 3`);
    }

    await redis.del(otpKey);
    await redis.del(attemptsKey);

    await prisma.user.update({
      where: { email },
      data: {
        isValidUser: true,
        otp: null,
      },
    });

    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthError(error.message);
    }

    throw new AuthError("OTP verification failed");
  }
};

const loginService = async (
  input: { email: string; password: string },
  context: { req: express.Request; res: express.Response },
) => {
  const { res } = context;

  try {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.password) throw new AuthError("Invalid credentials");

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    if (!user.isValidUser) {
      throw new AuthError("User is not verified. Please verify your email.");
    }

    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: add(new Date(), { days: 7 }),
      },
    });

    setAuthCookies(res, accessToken, refreshToken);

    return { user, accessToken, refreshToken };
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthError(error.message);
    }
  }
};

const refreshTokenService = async (context: {
  req: express.Request;
  res: express.Response;
}) => {
  const { req, res } = context;
  const token = req.cookies["refresh-token"];

  if (!token) {
    throw new AuthError("Refresh token not found");
  }

  try {
    const payload = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AuthError("User no longer exists");
    }

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);

    setAuthCookies(res, accessToken, refreshToken);

    return { user, accessToken, refreshToken };
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthError("Invalid or expired refresh token");
    }
  }
};

const googleLoginService = async ({ token }: { token: string }) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: config.google_client_id,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload.name) throw new Error("Invalid Google token");

  let user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        provider: "google",
        role: Role.USER,
      },
    });
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  return { user, accessToken, refreshToken };
};

const logoutService = async (context: {
  req: express.Request;
  res: express.Response;
}) => {
  const { req, res } = context;
  const token = req.cookies["refresh-token"];
  if (!token) return false;

  try {
    await prisma.session
      .delete({
        where: { token },
      })
      .catch(() => {});
  } catch (err) {
    if (err instanceof Error) {
      throw new AuthError("Failed to logout");
    }
  }

  res.clearCookie("access-token", { path: "/" });
  res.clearCookie("refresh-token", { path: "/" });

  return true;
};

export const authServices = {
  loginService,
  signupService,
  refreshTokenService,
  googleLoginService,
  logoutService,
  verifyOtpService,
};
