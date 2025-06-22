import jwt from "jsonwebtoken";

import { Role } from "../../generated/prisma";
import { config } from "../../lib/config";

const JWT_SECRET = config.jwt_secret || "your_jwt_secret_key";
const JWT_REFRESH_SECRET =
  config.jwt_refresh_secret || "your_refresh_secret_key";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export const signAccessToken = (userId: string, role: Role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const signRefreshToken = (userId: string, role: Role) => {
  return jwt.sign({ userId, role }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as {
    userId: string;
    role: Role;
  };
};
