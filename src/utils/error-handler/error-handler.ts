// middleware/errorHandler.ts
import express from "express";

import { AppError } from "./error";

export function errorHandler(
  err: Error | AppError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const isKnown = err instanceof AppError;

  const statusCode = isKnown ? err.statusCode : 500;
  const message = isKnown ? err.message : "Internal Server Error";

  console.error(`[Error] ${req.method} ${req.url}`, err);

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
}
