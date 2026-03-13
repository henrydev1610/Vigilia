import dotenv from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const LEGACY_REDIS_ENV_KEYS = ["REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD"] as const;

function assertValidServiceUrl(urlRaw: string, label: string, nodeEnv: string) {
  let parsed: URL;
  try {
    parsed = new URL(urlRaw);
  } catch {
    throw new Error(`${label} invalida: formato de URL incorreto`);
  }

  const host = (parsed.hostname || "").trim().toLowerCase();
  if (!host) {
    throw new Error(`${label} invalida: host ausente`);
  }

  const isPlaceholder = host === "host" || host === "<host>" || host === "db_host";
  if (isPlaceholder) {
    throw new Error(`${label} invalida: placeholder HOST nao substituido`);
  }

  const isLocalHost = host === "localhost" || host === "127.0.0.1" || host === "::1";
  if (nodeEnv === "production" && isLocalHost) {
    throw new Error(`${label} invalida em producao: use hostname interno do servico no Dokploy`);
  }
}

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
  DB_CONNECT_MAX_RETRIES: z.coerce.number().int().min(1).max(30).default(8),
  DB_CONNECT_RETRY_DELAY_MS: z.coerce.number().int().min(250).max(60000).default(2000),
  DB_REQUIRED_ON_START: z.preprocess(toBoolean, z.boolean().default(true)),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().int().positive().default(30),
  GOOGLE_WEB_CLIENT_ID: z.string().min(1).optional(),
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

try {
  assertValidServiceUrl(parsed.data.DATABASE_URL, "DATABASE_URL", parsed.data.NODE_ENV);
  const legacyRedisEnvInUse = LEGACY_REDIS_ENV_KEYS.filter((key) => Boolean(process.env[key]?.trim()));
  if (legacyRedisEnvInUse.length > 0) {
    throw new Error(`Variaveis legadas de Redis nao sao suportadas: ${legacyRedisEnvInUse.join(", ")}`);
  }
  if (parsed.data.ENABLE_REDIS) {
    const hasRedisUrl = Boolean(parsed.data.REDIS_URL?.trim());
    if (!hasRedisUrl) throw new Error("ENABLE_REDIS=true exige REDIS_URL");
    if (hasRedisUrl) {
      assertValidServiceUrl(parsed.data.REDIS_URL as string, "REDIS_URL", parsed.data.NODE_ENV);
    }
  }
} catch (error) {
  console.error("Invalid environment variables", {
    connection: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
}

export const env = parsed.data;
