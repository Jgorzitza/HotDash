import {
  clearCache as clearSharedCache,
  getCached as getSharedCached,
  setCached as setSharedCache,
} from "../cache.server";

const DEFAULT_TTL_MS = Number(
  process.env.SHOPIFY_CACHE_TTL_MS ?? 5 * 60 * 1000,
);

export function getCached<T>(key: string) {
  return getSharedCached<T>(key);
}

export function setCached<T>(
  key: string,
  value: T,
  ttlMs: number = DEFAULT_TTL_MS,
) {
  setSharedCache(key, value, ttlMs);
}

export function clearCache(key?: string) {
  clearSharedCache(key);
}
