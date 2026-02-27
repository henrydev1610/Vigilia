import { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "./app-error";

type ZodLikeError = Error & {
  name?: string;
  issues?: Array<{ path?: Array<string | number>; message?: string }>;
};

function isZodLikeError(error: unknown): error is ZodLikeError {
  if (!(error instanceof Error)) return false;
  if (error instanceof ZodError) return true;
  const maybe = error as ZodLikeError;
  return maybe.name === "ZodError" && Array.isArray(maybe.issues);
}

export function errorHandler(error: Error, _request: FastifyRequest, reply: FastifyReply): void {
  _request.log.error({
    message: error.message,
    name: error.name,
    stack: error.stack,
  }, "request failed");

  if (isZodLikeError(error)) {
    const details =
      error instanceof ZodError
        ? error.flatten().fieldErrors
        : (error.issues ?? []).reduce<Record<string, string[]>>((acc, issue) => {
            const key = issue.path?.length ? String(issue.path[0]) : "root";
            const message = issue.message ?? "Valor invalido";
            if (!acc[key]) acc[key] = [];
            acc[key].push(message);
            return acc;
          }, {});

    reply.status(400).send({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados invalidos",
        details
      }
    });
    return;
  }

  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  reply.status(500).send({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro interno do servidor"
    }
  });
}
