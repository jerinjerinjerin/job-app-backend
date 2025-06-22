import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    status: 429,
    error: "Too many requests, please try again after 1 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
