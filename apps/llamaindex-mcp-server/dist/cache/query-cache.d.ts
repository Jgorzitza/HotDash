/**
 * Query Result Cache
 *
 * LRU cache implementation for LlamaIndex query results
 * Target: >75% cache hit rate for <500ms P95 latency
 */
interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
}
export declare class QueryCache {
    private cache;
    private hits;
    private misses;
    constructor(options?: {
        maxSize?: number;
        ttlMs?: number;
    });
    /**
     * Generate cache key from query parameters
     */
    private generateKey;
    /**
     * Get cached result if available
     */
    get(query: string, topK: number): any | null;
    /**
     * Store result in cache
     */
    set(query: string, topK: number, result: any): void;
    /**
     * Get stale cache entry (even if expired)
     * Useful for fallback when CLI fails
     */
    getStale(query: string, topK: number): any | null;
    /**
     * Clear all cached entries
     */
    clear(): void;
    /**
     * Clear cache for specific query pattern
     */
    clearPattern(pattern: string): number;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Check if cache hit rate is healthy
     */
    isHealthy(): boolean;
    /**
     * Reset statistics (keeps cache entries)
     */
    resetStats(): void;
}
export declare const queryCache: QueryCache;
export {};
//# sourceMappingURL=query-cache.d.ts.map