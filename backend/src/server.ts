import { buildApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./infra/db/prisma";
import { redis } from "./infra/redis/client";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDatabaseConnection() {
  let attempt = 0;
  const totalAttempts = env.DB_CONNECT_MAX_RETRIES;

  while (attempt < totalAttempts) {
    attempt += 1;
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (error) {
      if (attempt >= totalAttempts) {
        throw error;
      }
      const jitter = Math.floor(Math.random() * 300);
      const delayMs = Math.min(env.DB_CONNECT_RETRY_DELAY_MS * attempt + jitter, 15000);
      await sleep(delayMs);
    }
  }
}

async function bootstrap() {
  await waitForDatabaseConnection();
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
