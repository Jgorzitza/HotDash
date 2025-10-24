/**
 * Performance monitoring and optimization utilities
 */
/**
 * Measure execution time of an async function
 */
export declare function measure<T>(name: string, fn: () => Promise<T>): Promise<{
    result: T;
    durationMs: number;
}>;
/**
 * Simple memoization decorator for expensive operations
 */
export declare function memoize<T extends (...args: any[]) => any>(fn: T, options?: {
    ttlMs?: number;
    keyFn?: (...args: Parameters<T>) => string;
}): T;
/**
 * Debounce function execution
 */
export declare function debounce<T extends (...args: any[]) => any>(fn: T, delayMs: number): (...args: Parameters<T>) => void;
/**
 * Batch multiple operations to reduce overhead
 */
export declare function batch<T, R>(items: T[], batchSize: number, processFn: (batch: T[]) => Promise<R[]>): Promise<R[]>;
/**
 * Profile a loader function for performance monitoring
 */
export declare function profileLoader<T>(loaderName: string): (loaderFn: () => Promise<T>) => Promise<T>;
//# sourceMappingURL=performance.server.d.ts.map