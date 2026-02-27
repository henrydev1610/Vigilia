import Redis from "ioredis";
import { env } from "../../config/env";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableAutoPipelining: true
});

redis.on("error", (error) => {
  // Keep process alive and surface infra issues in container logs.
  console.error("[redis] connection error", {
    message: error instanceof Error ? error.message : String(error),
  });
});
