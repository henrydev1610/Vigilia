import Redis from "ioredis";
import { EventEmitter } from "node:events";
import { env } from "../../config/env";

type RedisSetArgs = [key: string, value: string, mode: "EX", ttlSeconds: number] | [key: string, value: string];

interface RedisLikeClient {
  readonly enabled: boolean;
  get(key: string): Promise<string | null>;
  set(...args: RedisSetArgs): Promise<string | null>;
  del(...keys: string[]): Promise<number>;
  scanStream(options: { match?: string; count?: number }): EventEmitter;
  quit(): Promise<void>;
  ping(): Promise<string>;
}

function createEmptyScanStream() {
  const emitter = new EventEmitter();
  setTimeout(() => {
    emitter.emit("end");
  }, 0);
  return emitter;
}

function resolveRedisUrl() {
  if (env.REDIS_URL?.trim()) {
    return env.REDIS_URL.trim();
  }
  const host = env.REDIS_HOST?.trim();
  if (!host) {
    return null;
  }
  const passwordPart = env.REDIS_PASSWORD?.trim() ? `:${encodeURIComponent(env.REDIS_PASSWORD.trim())}@` : "";
  return `redis://${passwordPart}${host}:${env.REDIS_PORT}`;
}

class DisabledRedisClient implements RedisLikeClient {
  readonly enabled = false;

  async get(_key: string) {
    return null;
  }

  async set(..._args: RedisSetArgs) {
    return null;
  }

  async del(..._keys: string[]) {
    return 0;
  }

  scanStream(_options: { match?: string; count?: number }) {
    return createEmptyScanStream();
  }

  async quit() {
    return;
  }

  async ping() {
    return "DISABLED";
  }
}

class RedisClientAdapter implements RedisLikeClient {
  readonly enabled = true;
  private readonly client: Redis;
  private retryAttempts = 0;
  private degradedMode = false;
  private lastErrorLogAt = 0;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      enableAutoPipelining: true,
      connectTimeout: 5000,
      retryStrategy: (times) => {
        this.retryAttempts = times;
        if (times >= 8) {
          this.degradedMode = true;
          this.logErrorOncePerWindow("retry limit reached, entering degraded mode");
          return null;
        }
        const backoffMs = Math.min(500 * times, 5000);
        return backoffMs;
      },
    });

    this.client.on("error", (error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logErrorOncePerWindow(message);
    });
  }

  private logErrorOncePerWindow(message: string) {
    const now = Date.now();
    if (now - this.lastErrorLogAt < 15000) {
      return;
    }
    this.lastErrorLogAt = now;
    console.error("[redis] connection issue", {
      message,
      retryAttempts: this.retryAttempts,
      degradedMode: this.degradedMode,
    });
  }

  private async runOrFallback<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    if (this.degradedMode) {
      return fallback;
    }
    try {
      return await operation();
    } catch (error) {
      this.logErrorOncePerWindow(error instanceof Error ? error.message : String(error));
      return fallback;
    }
  }

  async get(key: string) {
    return this.runOrFallback(() => this.client.get(key), null);
  }

  async set(...args: RedisSetArgs) {
    return this.runOrFallback(() => this.client.set(...args), null);
  }

  async del(...keys: string[]) {
    if (!keys.length) return 0;
    return this.runOrFallback(() => this.client.del(...keys), 0);
  }

  scanStream(options: { match?: string; count?: number }) {
    if (this.degradedMode) {
      return createEmptyScanStream();
    }
    return this.client.scanStream(options);
  }

  async quit() {
    if (this.degradedMode) return;
    await this.runOrFallback(() => this.client.quit().then(() => undefined), undefined);
  }

  async ping() {
    return this.runOrFallback(() => this.client.ping(), "DEGRADED");
  }
}

function createRedisClient(): RedisLikeClient {
  if (!env.ENABLE_REDIS) {
    console.info("[redis] disabled by ENABLE_REDIS=false");
    return new DisabledRedisClient();
  }

  const redisUrl = resolveRedisUrl();
  if (!redisUrl) {
    console.warn("[redis] no REDIS_URL or REDIS_HOST provided, using disabled mode");
    return new DisabledRedisClient();
  }
  return new RedisClientAdapter(redisUrl);
}

export const redis = createRedisClient();

