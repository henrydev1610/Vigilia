import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3334),
  DATABASE_URL: z.string().min(1),
  ENABLE_REDIS: z.preprocess(toBoolean, z.boolean().default(true)),
  REDIS_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().int().positive().default(30),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:8081,http://localhost:19006,http://127.0.0.1:8081,http://127.0.0.1:19006,http://192.168.*:*,http://10.0.*:*,exp://*"),
  CAMARA_BASE_URL: z.string().url().default("https://dadosabertos.camara.leg.br/api/v2"),
  AGGREGATES_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(1800)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

if (parsed.data.ENABLE_REDIS && !parsed.data.REDIS_URL?.trim()) {
  console.error("Invalid environment variables", {
    REDIS_URL: "ENABLE_REDIS=true exige REDIS_URL"
  });
  process.exit(1);
}

export const env = parsed.data;
