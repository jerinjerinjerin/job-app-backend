// lib/redis.ts
import { Redis } from "@upstash/redis";

import { config } from "../config";

export const redis = new Redis({
  url: config.redis_url,
  token: config.redis_token,
});
