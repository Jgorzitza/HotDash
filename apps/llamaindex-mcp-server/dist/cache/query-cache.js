/**
 * Query Result Cache
 *
 * LRU cache implementation for LlamaIndex query results
 * Target: >75% cache hit rate for <500ms P95 latency
 */
import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';
export class QueryCache {
    cache;
    hits = 0;
    misses = 0;
    constructor(options) {
        const { maxSize = 1000, ttlMs = 5 * 60 * 1000, // 5 minutes default
         } = options || {};
        this.cache = new LRUCache({
            max: maxSize,
            ttl: ttlMs,
            updateAgeOnGet: true,
            updateAgeOnHas: false,
        });
    }
    /**
     * Generate cache key from query parameters
     */
    generateKey(query, topK) {
        const normalized = query.toLowerCase().trim();
        return createHash('md5').update(`${normalized}:${topK}`).digest('hex');
    }
    /**
     * Get cached result if available
     */
    get(query, topK) {
        const key = this.generateKey(query, topK);
        const cached = this.cache.get(key);
        if (cached) {
            this.hits++;
            console.log(`[Cache] HIT for query: "${query.slice(0, 50)}..." (age: ${Date.now() - cached.timestamp}ms)`);
            return {
                ...cached.result,
                _cached: true,
                _cache_age_ms: Date.now() - cached.timestamp,
            };
        }
        this.misses++;
        console.log(`[Cache] MISS for query: "${query.slice(0, 50)}..."`);
        return null;
    }
    /**
     * Store result in cache
     */
    set(query, topK, result) {
        const key = this.generateKey(query, topK);
        this.cache.set(key, {
            query,
            topK,
            result,
            timestamp: Date.now(),
        });
    }
    /**
     * Get stale cache entry (even if expired)
     * Useful for fallback when CLI fails
     */
    getStale(query, topK) {
        const key = this.generateKey(query, topK);
        const cached = this.cache.peek(key); // peek doesn't update age
        if (cached) {
            console.log(`[Cache] STALE HIT for fallback: "${query.slice(0, 50)}..."`);
            return {
                ...cached.result,
                _cached: true,
                _stale: true,
                _cache_age_ms: Date.now() - cached.timestamp,
            };
        }
        return null;
    }
    /**
     * Clear all cached entries
     */
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
        console.log('[Cache] Cleared all entries');
    }
    /**
     * Clear cache for specific query pattern
     */
    clearPattern(pattern) {
        let cleared = 0;
        const regex = new RegExp(pattern, 'i');
        for (const [key, value] of this.cache.entries()) {
            if (regex.test(value.query)) {
                this.cache.delete(key);
                cleared++;
            }
        }
        console.log(`[Cache] Cleared ${cleared} entries matching pattern: ${pattern}`);
        return cleared;
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            size: this.cache.size,
            hitRate: total > 0 ? this.hits / total : 0,
        };
    }
    /**
     * Check if cache hit rate is healthy
     */
    isHealthy() {
        const stats = this.getStats();
        const total = stats.hits + stats.misses;
        // Need at least 20 requests to determine health
        if (total < 20) {
            return true; // Not enough data yet
        }
        // Target: >70% hit rate (warning threshold)
        return stats.hitRate >= 0.70;
    }
    /**
     * Reset statistics (keeps cache entries)
     */
    resetStats() {
        this.hits = 0;
        this.misses = 0;
    }
}
// Export singleton instance
export const queryCache = new QueryCache({
    maxSize: 1000,
    ttlMs: 5 * 60 * 1000, // 5 minutes
});
//# sourceMappingURL=query-cache.js.map