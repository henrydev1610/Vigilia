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
  setTimeout(() => emitter.emit("end"), 0);
  return emitter;
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
  private lastErrorAt = 0;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: null,
      connectTimeout: 5000,
      retryStrategy: (times) => Math.min(times * 250, 5000),
    });

    this.client.on("error", (error) => {
      const now = Date.now();
      if (now - this.lastErrorAt < 15000) return;
      this.lastErrorAt = now;
      console.warn("[redis] connection issue", {
        message: error instanceof Error ? error.message : String(error),
      });
    });

    this.client.connect().catch(() => undefined);
  }

  private async safe<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await operation();
    } catch {
      return fallback;
    }
  }

  async get(key: string) {
    return this.safe(() => this.client.get(key), null);
  }

  async set(...args: RedisSetArgs) {
    return this.safe(() => this.client.set(...args), null);
  }

  async del(...keys: string[]) {
    if (!keys.length) return 0;
    return this.safe(() => this.client.del(...keys), 0);
  }

  scanStream(options: { match?: string; count?: number }) {
    return this.client.scanStream(options);
  }

  async quit() {
    await this.safe(() => this.client.quit().then(() => undefined), undefined);
  }

  async ping() {
    return this.safe(() => this.client.ping(), "DEGRADED");
  }
}

function createRedisClient(): RedisLikeClient {
  if (!env.ENABLE_REDIS) {
    return new DisabledRedisClient();
  }

  const redisUrl = env.REDIS_URL?.trim();
  if (!redisUrl) {
    return new DisabledRedisClient();
  }

  return new RedisClientAdapter(redisUrl);
}

export const redis = createRedisClient();
