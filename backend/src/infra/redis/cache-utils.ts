import { redis } from "./client";

export async function deleteByPattern(pattern: string): Promise<void> {
  const stream = redis.scanStream({ match: pattern, count: 200 });
  const keys: string[] = [];

  await new Promise<void>((resolve, reject) => {
    stream.on("data", (resultKeys: string[]) => {
      keys.push(...resultKeys);
    });
    stream.on("end", () => resolve());
    stream.on("error", (error: Error) => reject(error));
  });

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
