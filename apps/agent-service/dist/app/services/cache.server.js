const store = new Map();
export function getCached(key) {
    const entry = store.get(key);
    if (!entry)
        return undefined;
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
    }
    return entry.value;
}
export function setCached(key, value, ttlMs) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
}
export function clearCache(key) {
    if (key) {
        store.delete(key);
    }
    else {
        store.clear();
    }
}
//# sourceMappingURL=cache.server.js.map