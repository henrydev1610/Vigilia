import { buildApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./infra/db/prisma";
import { redis } from "./infra/redis/client";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function warmDatabaseConnection() {
  let attempt = 0;
  const totalAttempts = env.DB_CONNECT_MAX_RETRIES;

  while (attempt < totalAttempts) {
    attempt += 1;
    try {
      await prisma.$queryRaw`SELECT 1`;
      // Prime db connection pool for first real requests.
      console.info(`[startup] database connected on attempt ${attempt}`);
      return true;
    } catch (error) {
      if (attempt >= totalAttempts) {
        console.error("[startup] database still unavailable after retries", {
          attempts: totalAttempts,
          reason: error instanceof Error ? error.message : String(error),
        });
        return false;
      }
      const jitter = Math.floor(Math.random() * 300);
      const delayMs = Math.min(env.DB_CONNECT_RETRY_DELAY_MS * attempt + jitter, 15000);
      console.warn("[startup] waiting database connection retry", {
        attempt,
        delayMs,
      });
      await sleep(delayMs);
    }
  }

  return false;
}

async function bootstrap() {
  const dbConnected = await warmDatabaseConnection();
  if (!dbConnected && env.DB_REQUIRED_ON_START) {
    console.error("[startup] aborting process because DB is required on startup");
    process.exit(1);
  }

  const app = await buildApp();

  try {
    await app.listen({
      port: env.PORT,
      host: "0.0.0.0"
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  const close = async () => {
    await app.close();
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

void bootstrap();
