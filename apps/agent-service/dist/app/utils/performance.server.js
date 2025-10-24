/**
 * Performance monitoring and optimization utilities
 */
/**
 * Measure execution time of an async function
 */
export async function measure(name, fn) {
    const start = performance.now();
    const result = await fn();
    const durationMs = Math.round(performance.now() - start);
    console.log(`[Performance] ${name}: ${durationMs}ms`);
    return { result, durationMs };
}
/**
 * Simple memoization decorator for expensive operations
 */
export function memoize(fn, options = {}) {
    const cache = new Map();
    const ttlMs = options.ttlMs || 60000; // Default 1 minute
    const keyFn = options.keyFn || ((...args) => JSON.stringify(args));
    return ((...args) => {
        const key = keyFn(...args);
        const cached = cache.get(key);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.value;
        }
        const result = fn(...args);
        cache.set(key, {
            value: result,
            expiresAt: Date.now() + ttlMs,
        });
        return result;
    });
}
/**
 * Debounce function execution
 */
export function debounce(fn, delayMs) {
    let timeoutId = null;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delayMs);
    };
}
/**
 * Batch multiple operations to reduce overhead
 */
export async function batch(items, batchSize, processFn) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await processFn(batch);
        results.push(...batchResults);
    }
    return results;
}
/**
 * Profile a loader function for performance monitoring
 */
export function profileLoader(loaderName) {
    return async function (loaderFn) {
        const { result, durationMs } = await measure(loaderName, loaderFn);
        // Warn if loader is slow (>300ms target per direction)
        if (durationMs > 300) {
            console.warn(`[Performance] Slow loader: ${loaderName} took ${durationMs}ms (target: <300ms)`);
        }
        return result;
    };
}
//# sourceMappingURL=performance.server.js.map