import bcrypt from "bcryptjs";
import { add } from "date-fns";
import express from "express";
import { OAuth2Client } from "google-auth-library";

import { PrismaClient, Role } from "../../generated/prisma";
import { config } from "../../lib/config";
import { AuthError, ValidationError } from "../../utils/error-handler/error";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/token";

const prisma = new PrismaClient();
const client = new OAuth2Client(config.google_client_id);

const signupService = async (
  input: { email: string; password: string; name: string; role?: string },
  context: { req: express.Request; res: express.Response }
) => {
  const { res } = context;

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

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashed,
      name: input.name,
      provider: "local",
      role,
    },
  });

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  res.cookie("access-token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:"/",
    maxAge: 15 * 60 * 1000, 
  })

  res.cookie("refresh-token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { user, accessToken, refreshToken };
};

const loginService = async (input: { email: string; password: string }, context: { req: express.Request; res: express.Response }) => {
  const { res } = context;
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.password) throw new AuthError("Invalid credentials");

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  await prisma.session.create({
  data: {
    userId: user.id,
    token: refreshToken,
    expiresAt: add(new Date(), { days: 7 }), 
  },
});

  res.cookie("access-token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:"/",
    maxAge: 15 * 60 * 1000, 
  })

  res.cookie("refresh-token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { user, accessToken, refreshToken };
};

const refreshTokenService = async (context: { req: express.Request; res: express.Response }) => {
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

    res.cookie("access-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return { user, accessToken, refreshToken };
  } catch (error) {
    if(error instanceof Error){

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

const logoutService = async (context: { req: express.Request; res: express.Response }) => {
  const { req, res } = context;
  const token = req.cookies['refresh-token'];
  if (!token) return false;

  try {
    await prisma.session.delete({
      where: { token },
    });
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
};
