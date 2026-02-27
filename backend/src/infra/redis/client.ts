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
  return env.REDIS_URL?.trim() || null;
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
  private wasEverReady = false;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: null,
      enableAutoPipelining: true,
      connectTimeout: 5000,
      retryStrategy: (times) => {
        this.retryAttempts = times;
        const backoffMs = Math.min(250 * Math.max(1, times), 5000);
        this.degradedMode = true;
        return backoffMs;
      },
    });

    this.client.on("connect", () => {
      this.logInfoOncePerWindow("connecting");
    });
    this.client.on("ready", () => {
      this.wasEverReady = true;
      this.degradedMode = false;
      this.retryAttempts = 0;
      this.logInfoOncePerWindow("ready");
    });
    this.client.on("reconnecting", () => {
      this.degradedMode = true;
      this.logInfoOncePerWindow("reconnecting");
    });
    this.client.on("end", () => {
      this.degradedMode = true;
      this.logInfoOncePerWindow("connection ended");
    });
    this.client.on("error", (error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.degradedMode = true;
      this.logErrorOncePerWindow(message);
    });

    this.client.connect().catch((error) => {
      this.degradedMode = true;
      this.logErrorOncePerWindow(error instanceof Error ? error.message : String(error));
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
      wasEverReady: this.wasEverReady,
    });
  }

  private logInfoOncePerWindow(message: string) {
    const now = Date.now();
    if (now - this.lastErrorLogAt < 15000) {
      return;
    }
    this.lastErrorLogAt = now;
    console.info("[redis] state", {
      message,
      retryAttempts: this.retryAttempts,
      degradedMode: this.degradedMode,
      wasEverReady: this.wasEverReady,
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
    console.warn("[redis] no REDIS_URL provided, using disabled mode");
    return new DisabledRedisClient();
  }
  return new RedisClientAdapter(redisUrl);
}

export const redis = createRedisClient();

