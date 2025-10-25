/**
 * Growth Engine Performance Optimization Service
 *
 * Advanced performance optimization for Growth Engine support operations.
 * Provides caching, resource management, and performance monitoring.
 */
export interface PerformanceConfig {
    caching: {
        enabled: boolean;
        ttl: number;
        maxSize: number;
        strategy: 'lru' | 'lfu' | 'fifo';
    };
    resourceManagement: {
        maxConcurrentRequests: number;
        requestTimeout: number;
        memoryLimit: number;
        cpuLimit: number;
    };
    monitoring: {
        enabled: boolean;
        interval: number;
        thresholds: {
            cpu: number;
            memory: number;
            responseTime: number;
            errorRate: number;
        };
    };
    optimization: {
        autoOptimize: boolean;
        optimizationInterval: number;
        performanceTargets: {
            responseTime: number;
            throughput: number;
            errorRate: number;
        };
    };
}
export interface PerformanceMetrics {
    system: {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
        networkLatency: number;
    };
    application: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        successRate: number;
    };
    cache: {
        hitRate: number;
        missRate: number;
        evictionRate: number;
        size: number;
    };
    database: {
        queryTime: number;
        connectionPool: number;
        slowQueries: number;
        deadlocks: number;
    };
}
export interface OptimizationResult {
    success: boolean;
    optimizations: string[];
    performanceGains: {
        responseTime: number;
        throughput: number;
        memoryUsage: number;
        cpuUsage: number;
    };
    recommendations: string[];
    metrics: PerformanceMetrics;
}
export declare class GrowthEnginePerformance {
    private config;
    private cache;
    private metrics;
    private monitoringInterval?;
    private optimizationInterval?;
    constructor(config: PerformanceConfig);
    /**
     * Initialize performance optimization
     */
    initialize(): Promise<void>;
    /**
     * Optimize performance
     */
    optimize(): Promise<OptimizationResult>;
    /**
     * Get cached value
     */
    getCache(key: string): any;
    /**
     * Set cached value
     */
    setCache(key: string, value: any, ttl?: number): void;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Get performance metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Check if performance targets are met
     */
    checkPerformanceTargets(): {
        met: boolean;
        targets: {
            responseTime: boolean;
            throughput: boolean;
            errorRate: boolean;
        };
        recommendations: string[];
    };
    /**
     * Start monitoring
     */
    private startMonitoring;
    /**
     * Start auto-optimization
     */
    private startAutoOptimization;
    /**
     * Collect performance metrics
     */
    private collectMetrics;
    /**
     * Check performance thresholds
     */
    private checkThresholds;
    /**
     * Optimize cache
     */
    private optimizeCache;
    /**
     * Optimize resources
     */
    private optimizeResources;
    /**
     * Optimize database
     */
    private optimizeDatabase;
    /**
     * Optimize application
     */
    private optimizeApplication;
    /**
     * Evict cache entries
     */
    private evictCache;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
/**
 * Factory function to create Growth Engine Performance service
 */
export declare function createGrowthEnginePerformance(config: PerformanceConfig): GrowthEnginePerformance;
/**
 * Default performance configuration
 */
export declare const defaultPerformanceConfig: PerformanceConfig;
//# sourceMappingURL=growth-engine-performance.d.ts.map