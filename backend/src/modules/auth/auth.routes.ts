import { FastifyInstance } from "fastify";
import { SafeParseReturnType } from "zod";
import { AuthService } from "./auth.service";
import { googleLoginSchema, loginSchema, refreshSchema, registerSchema } from "./auth.schemas";
import { AppError } from "../../shared/errors/app-error";
import { classifyPrismaError } from "../../shared/errors/prisma-error";
import type { LoginPayload } from "./auth.types";

function parseOrThrow<T>(result: SafeParseReturnType<unknown, T>, message = "Dados invalidos"): T {
  if (result.success && result.data) return result.data;
  throw new AppError(message, 400, "VALIDATION_ERROR", result.error?.flatten().fieldErrors ?? {});
}

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app);

  app.post("/auth/register", async (request, reply) => {
    try {
      const body = parseOrThrow(registerSchema.safeParse(request.body));
      const data = await authService.register(body);
      return reply.status(201).send({ success: true, data });
    } catch (error) {
      const prismaKind = classifyPrismaError(error);
      if (prismaKind === "unique") {
        throw new AppError("Email ja cadastrado", 409, "EMAIL_IN_USE");
      }
      if (prismaKind === "connectivity") {
        throw new AppError("Banco de dados indisponivel no momento", 503, "DATABASE_UNAVAILABLE");
      }
      if (prismaKind === "schema") {
        throw new AppError(
          "Banco de dados ainda nao esta pronto (migrations pendentes)",
          503,
          "DATABASE_SCHEMA_UNAVAILABLE"
        );
      }
      app.log.error(
        {
          route: "/auth/register",
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : "UnknownError",
          stack: error instanceof Error ? error.stack : undefined
        },
        "register failed"
      );
      throw error;
    }
  });

  app.post("/auth/login", async (request) => {
    const body = parseOrThrow<LoginPayload>(
      loginSchema.safeParse(request.body),
      "Email ou senha invalidos"
    );
    const data = await authService.login(body);
    return { success: true, data };
  });

  app.post("/auth/google", async (request) => {
    const body = parseOrThrow(googleLoginSchema.safeParse(request.body), "Token Google invalido");
    const data = await authService.loginWithGoogle(body);
    return { success: true, data };
  });

  app.post("/auth/refresh", async (request) => {
    const body = parseOrThrow(refreshSchema.safeParse(request.body));
    const data = await authService.refresh(body.refreshToken);
    return { success: true, data };
  });

  app.get("/auth/me", { preHandler: [app.authenticate] }, async (request) => {
    const data = await authService.me(request.user.sub);
    return { success: true, data };
  });

  app.post("/auth/logout", { preHandler: [app.authenticate] }, async (request) => {
    const body = parseOrThrow(refreshSchema.safeParse(request.body));
    const data = await authService.logout(body.refreshToken);
    return { success: true, data };
  });
}
