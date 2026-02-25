import { z } from "zod";
import { sanitizeText } from "../../shared/sanitize";
import type { LoginPayload } from "./auth.types";

const emailSchema = z
  .string()
  .email()
  .transform((value) => sanitizeText(value.toLowerCase()));

export const registerSchema = z.object({
  name: z.string().min(2).max(120).transform(sanitizeText),
  email: emailSchema,
  password: z.string().min(3).max(120)
});

export const loginSchema: z.ZodType<LoginPayload> = z.object({
  email: emailSchema,
  password: z.string().min(3).max(120)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});
