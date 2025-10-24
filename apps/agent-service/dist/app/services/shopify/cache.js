import { clearCache as clearSharedCache, getCached as getSharedCached, setCached as setSharedCache, } from "../cache.server";
const DEFAULT_TTL_MS = Number(process.env.SHOPIFY_CACHE_TTL_MS ?? 5 * 60 * 1000);
export function getCached(key) {
    return getSharedCached(key);
}
export function setCached(key, value, ttlMs = DEFAULT_TTL_MS) {
    setSharedCache(key, value, ttlMs);
}
export function clearCache(key) {
    clearSharedCache(key);
}
//# sourceMappingURL=cache.js.map