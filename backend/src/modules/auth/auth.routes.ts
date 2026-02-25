import { FastifyInstance } from "fastify";
import { SafeParseReturnType } from "zod";
import { AuthService } from "./auth.service";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas";
import { AppError } from "../../shared/errors/app-error";
import type { LoginPayload } from "./auth.types";

function parseOrThrow<T>(result: SafeParseReturnType<unknown, T>, message = "Dados invalidos"): T {
  if (result.success && result.data) return result.data;
  throw new AppError(message, 400, "VALIDATION_ERROR", result.error?.flatten().fieldErrors ?? {});
}

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app);

  app.post("/auth/register", async (request, reply) => {
    const body = parseOrThrow(registerSchema.safeParse(request.body));
    const data = await authService.register(body);
    return reply.status(201).send({ success: true, data });
  });

  app.post("/auth/login", async (request) => {
    const body = parseOrThrow<LoginPayload>(
      loginSchema.safeParse(request.body),
      "Email ou senha invalidos"
    );
    const data = await authService.login(body);
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
