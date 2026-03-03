import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env";
import { prisma } from "./infra/db/prisma";
import { redis } from "./infra/redis/client";
import { errorHandler } from "./shared/errors/error-handler";
import { AppError } from "./shared/errors/app-error";
import { authRoutes } from "./modules/auth/auth.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { deputadosRoutes } from "./modules/deputados/deputados.routes";
import { despesasRoutes } from "./modules/despesas/despesas.routes";
import { rankingRoutes } from "./modules/ranking/ranking.routes";
import { favoritosRoutes } from "./modules/favoritos/favoritos.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesOriginPattern(origin: string, pattern: string): boolean {
  const regexSource = `^${escapeRegex(pattern).replace(/\\\*/g, ".*")}$`;
  return new RegExp(regexSource).test(origin);
}

export async function buildApp() {
  const bootStartedAt = Date.now();
  const apiVersion = process.env.APP_VERSION || process.env.npm_package_version || "1.0.0";

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug"
    }
  });

  await app.register(helmet);
  const allowedOrigins = env.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowAllOrigins = allowedOrigins.includes("*");
  const exactOrigins = allowedOrigins.filter((origin) => !origin.includes("*"));
  const wildcardOrigins = allowedOrigins.filter((origin) => origin.includes("*"));

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }

      if (allowAllOrigins || exactOrigins.includes(origin)) {
        cb(null, true);
        return;
      }

      if (wildcardOrigins.some((pattern) => matchesOriginPattern(origin, pattern))) {
        cb(null, true);
        return;
      }

      cb(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: false
  });
  await app.register(jwt, { secret: env.JWT_ACCESS_SECRET });
  await app.register(rateLimit, {
    global: true,
    max: 240,
    timeWindow: "1 minute"
  });

  app.decorate("authenticate", async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      throw new AppError("Nao autenticado", 401, "UNAUTHORIZED");
    }
  });

  app.get("/health", async () => ({
    status: "ok",
    uptime: process.uptime(),
    version: apiVersion,
    timestamp: new Date().toISOString(),
    startedAt: new Date(bootStartedAt).toISOString(),
  }));

  app.get("/health/db", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: "ok",
        db: "reachable",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      app.log.error({
        message: error instanceof Error ? error.message : String(error),
      }, "database healthcheck failed");
      return reply.status(503).send({
        status: "degraded",
        db: "unreachable",
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.get("/health/redis", async (_request, reply) => {
    if (!redis.enabled) {
      return {
        status: "degraded",
        redis: "disabled",
        timestamp: new Date().toISOString(),
      };
    }

    const pong = await redis.ping();
    if (pong === "PONG") {
      return {
        status: "ok",
        redis: "reachable",
        timestamp: new Date().toISOString(),
      };
    }
    return reply.status(503).send({
      status: "degraded",
      redis: "unreachable",
      timestamp: new Date().toISOString(),
    });
  });

  await app.register(authRoutes);
  await app.register(usersRoutes);
  await app.register(deputadosRoutes);
  await app.register(despesasRoutes);
  await app.register(rankingRoutes);
  await app.register(favoritosRoutes);
  await app.register(dashboardRoutes);

  app.setErrorHandler(errorHandler);
  return app;
}
