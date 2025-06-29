import bcrypt from "bcryptjs";
import { add } from "date-fns";
import express from "express";
import { OAuth2Client } from "google-auth-library";

import { sendOtpEmail } from "../../aws/sendEmail/auth/verifyOtp";
import { PrismaClient, Role } from "../../generated/prisma";
import { config } from "../../lib/config";
import { identityOtpService } from "../../lib/radis/identity";
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

    await identityOtpService.signUp(input.email, otp, {
      email: input.email,
      password: hashed,
      name: input.name,
      provider: "local",
      role,
      profilePic: input.profilePic,
    });

    return { success: true, message: "OTP sent to your email" };
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthError(error.message);
    }
  }
};

export const verifyOtpService = async (input: {
  email: string;
  otp: string;
}) => {
  try {
    const { email, otp } = input;

    await identityOtpService.otpVerify(email, otp);

    const draftRaw = await redis.get(`user_draft:${email}`);

    if (!draftRaw) {
      throw new AuthError("Invalid or expired signup session");
    }

    let draft: Record<string, any>;

    if (typeof draftRaw === "string") {
      try {
        draft = JSON.parse(draftRaw);
      } catch {
        throw new AuthError("Corrupted signup data in session");
      }
    } else if (typeof draftRaw === "object") {
      draft = draftRaw as Record<string, any>;
    } else {
      throw new AuthError("Unexpected data type from Redis");
    }

    const user = await prisma.user.create({
      data: {
        ...draft,
        isValidUser: true,
        otp: null,
        email: draft.email,
        name: draft.name,
        provider: draft.provider,
      },
    });

    await redis.del(`user_draft:${email}`);

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);

    return { user, accessToken, refreshToken };
  } catch (error) {
    throw new AuthError(
      error instanceof Error ? error.message : "OTP verification failed",
    );
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
