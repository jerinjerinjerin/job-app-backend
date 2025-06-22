// src/graphql/context.ts
import express from "express";
import jwt from "jsonwebtoken";

import { Role } from "../../generated/prisma";
import { config } from "../../lib/config";

const JWT_SECRET = config.jwt_secret || "your_jwt_secret_key";

export const createContext = (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  let user = null;

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        role: Role;
      };
      user = { id: payload.userId, role: payload.role };
    } catch (err) {
      if (err instanceof Error) {
        console.warn("Invalid token");
      }
    }
  }

  return { req, res, user };
};

export const isAuthenticated = (context: {
  user?: { id: string; role: Role };
}) => {
  if (!context.user) {
    throw new Error("Authentication required");
  }
};

export const hasRole = (
  context: { user?: { id: string; role: Role } },
  roles: Role[],
) => {
  isAuthenticated(context);

  if (!roles.includes(context.user!.role)) {
    throw new Error("Not authorized");
  }
};
