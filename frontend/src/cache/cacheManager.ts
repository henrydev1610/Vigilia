import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEnvelope<T> {
  value: T;
  updatedAt: number;
  ttlMs: number;
}

export async function setCacheValue<T>(key: string, value: T, ttlMs: number) {
  const payload: CacheEnvelope<T> = {
    value,
    updatedAt: Date.now(),
    ttlMs,
  };
  await AsyncStorage.setItem(key, JSON.stringify(payload));
}

export async function getCacheValue<T>(key: string) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const ageMs = Date.now() - Number(parsed.updatedAt || 0);
    const ttlMs = Number(parsed.ttlMs || 0);
    const isExpired = ttlMs > 0 && ageMs > ttlMs;
    return {
      value: parsed.value,
      ageMs,
      isExpired,
      updatedAt: parsed.updatedAt,
      ttlMs,
    };
  } catch {
    return null;
  }
}

export async function removeCacheValue(key: string) {
  await AsyncStorage.removeItem(key);
}
