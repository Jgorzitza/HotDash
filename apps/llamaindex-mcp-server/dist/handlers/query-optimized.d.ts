/**
 * Optimized Query Handler - WITH CACHING
 *
 * This is the recommended implementation with:
 * - LRU caching for >75% hit rate
 * - Non-blocking spawn (not execSync)
 * - Timeout protection (10s)
 * - .env file handling
 * - Performance metrics
 * - Stale cache fallback
 *
 * Engineer: Replace handlers/query.ts with this implementation
 */
/**
 * Query Handler - Optimized with caching
 */
export declare function queryHandler(args: {
    q: string;
    topK?: number;
}): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
}>;
/**
 * Get cache statistics (for health check)
 */
export declare function getCacheStats(): any;
/**
 * Clear cache (admin endpoint)
 */
export declare function clearCache(): void;
//# sourceMappingURL=query-optimized.d.ts.map