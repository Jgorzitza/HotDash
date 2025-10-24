/**
 * Dashboard Performance Optimization Service
 *
 * Provides performance optimizations for Growth Engine phases 9-12
 * including lazy loading, caching, and efficient data fetching.
 */
export interface PerformanceMetrics {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    cacheHitRate: number;
    apiResponseTime: number;
}
export interface OptimizationConfig {
    enableLazyLoading: boolean;
    enableCaching: boolean;
    enableVirtualization: boolean;
    maxConcurrentRequests: number;
    cacheTimeout: number;
    debounceDelay: number;
}
export declare class DashboardOptimizer {
    private config;
    private cache;
    private performanceMetrics;
    constructor(config?: Partial<OptimizationConfig>);
    /**
     * Optimized data fetching with caching and request deduplication
     */
    fetchWithOptimization<T>(key: string, fetcher: () => Promise<T>, options?: {
        ttl?: number;
        forceRefresh?: boolean;
    }): Promise<T>;
    /**
     * Debounced function execution for performance
     */
    debounce<T extends (...args: any[]) => any>(func: T, delay?: number): (...args: Parameters<T>) => void;
    /**
     * Throttled function execution for performance
     */
    throttle<T extends (...args: any[]) => any>(func: T, limit?: number): (...args: Parameters<T>) => void;
    /**
     * Lazy loading utility for components
     */
    createLazyComponent<T extends React.ComponentType<any>>(importFunc: () => Promise<{
        default: T;
    }>): React.LazyExoticComponent<T>;
    /**
     * Virtual scrolling configuration for large lists
     */
    getVirtualizationConfig(itemCount: number, itemHeight?: number): {
        itemCount: number;
        itemHeight: number;
        overscan: number;
        threshold: number;
    };
    /**
     * Batch API requests for efficiency
     */
    batchRequests<T>(requests: Array<{
        key: string;
        fetcher: () => Promise<T>;
    }>, batchSize?: number): Promise<Record<string, T>>;
    /**
     * Memory usage monitoring
     */
    private getMemoryUsage;
    /**
     * Cache hit rate calculation
     */
    private calculateCacheHitRate;
    /**
     * Record performance metrics
     */
    private recordMetrics;
    /**
     * Get performance summary
     */
    getPerformanceSummary(): {
        averageLoadTime: number;
        averageRenderTime: number;
        averageMemoryUsage: number;
        averageCacheHitRate: number;
        averageApiResponseTime: number;
    };
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<OptimizationConfig>): void;
}
export declare const dashboardOptimizer: DashboardOptimizer;
export declare function usePerformanceMonitoring(): {
    metrics: PerformanceMetrics[];
    summary: {
        averageLoadTime: number;
        averageRenderTime: number;
        averageMemoryUsage: number;
        averageCacheHitRate: number;
        averageApiResponseTime: number;
    };
    clearCache: () => void;
};
//# sourceMappingURL=dashboardOptimization.d.ts.map