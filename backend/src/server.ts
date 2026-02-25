import { buildApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./infra/db/prisma";
import { redis } from "./infra/redis/client";

async function bootstrap() {
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
