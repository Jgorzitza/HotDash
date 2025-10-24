/**
 * Growth Engine Performance Optimizer
 *
 * ENG-026: Advanced performance optimization for Growth Engine infrastructure
 * Provides intelligent caching, state management, and performance monitoring
 */
export interface CacheStrategy {
    ttl: number;
    maxSize: number;
    compression: boolean;
    invalidation: 'time' | 'manual' | 'smart';
}
export interface PerformanceMetrics {
    route: string;
    loadTime: number;
    renderTime: number;
    apiCalls: number;
    cacheHits: number;
    cacheMisses: number;
    errors: number;
    memoryUsage: number;
    timestamp: string;
}
export interface OptimizationRecommendation {
    type: 'caching' | 'routing' | 'state' | 'api' | 'rendering';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: number;
    effort: number;
    implementation: string;
}
/**
 * Advanced Cache Manager
 */
export declare class GrowthEngineCacheManager {
    private cache;
    private strategies;
    private metrics;
    private maxCacheSize;
    constructor();
    private initializeStrategies;
    /**
     * Set cache with strategy
     */
    set(key: string, data: any, strategy?: string): void;
    /**
     * Get from cache
     */
    get(key: string): any | null;
    /**
     * Check if key exists in cache
     */
    has(key: string): boolean;
    /**
     * Delete from cache
     */
    delete(key: string): boolean;
    /**
     * Clear cache with pattern
     */
    clear(pattern?: string): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        hitRate: number;
        averageAccessTime: number;
        memoryUsage: number;
        topKeys: Array<{
            key: string;
            accessCount: number;
            size: number;
        }>;
    };
    /**
     * Compress data
     */
    private compress;
    /**
     * Decompress data
     */
    private decompress;
    /**
     * Calculate data size
     */
    private calculateSize;
    /**
     * Enforce maximum cache size
     */
    private enforceMaxSize;
    /**
     * Start cleanup interval
     */
    private startCleanupInterval;
    /**
     * Cleanup expired cache entries
     */
    private cleanupExpired;
}
/**
 * State Management Optimizer
 */
export declare class GrowthEngineStateOptimizer {
    private state;
    private listeners;
    private persistence;
    private changeHistory;
    /**
     * Set state with optimization
     */
    setState(key: string, value: any, options?: {
        persist?: boolean;
        debounce?: number;
        validate?: (value: any) => boolean;
    }): void;
    /**
     * Get state
     */
    getState(key: string): any;
    /**
     * Subscribe to state changes
     */
    subscribe(key: string, callback: Function): () => void;
    /**
     * Notify listeners
     */
    private notifyListeners;
    /**
     * Persist state to storage
     */
    private persistState;
    /**
     * Restore state from storage
     */
    restoreState(key: string): Promise<any>;
    /**
     * Get state history
     */
    getStateHistory(key?: string): Array<{
        key: string;
        oldValue: any;
        newValue: any;
        timestamp: number;
    }>;
    /**
     * Clear state history
     */
    clearStateHistory(key?: string): void;
}
/**
 * Performance Monitor
 */
export declare class GrowthEnginePerformanceMonitor {
    private metrics;
    private cacheManager;
    private stateOptimizer;
    constructor(cacheManager: GrowthEngineCacheManager, stateOptimizer: GrowthEngineStateOptimizer);
    /**
     * Record performance metrics
     */
    recordMetrics(metrics: Partial<PerformanceMetrics>): void;
    /**
     * Get performance insights
     */
    getPerformanceInsights(): {
        averageLoadTime: number;
        averageRenderTime: number;
        cacheHitRate: number;
        errorRate: number;
        memoryUsage: number;
        slowestRoutes: string[];
        recommendations: OptimizationRecommendation[];
    };
    /**
     * Generate optimization recommendations
     */
    private generateRecommendations;
    /**
     * Start performance monitoring
     */
    private startMonitoring;
    /**
     * Cleanup old metrics
     */
    private cleanupOldMetrics;
}
export declare const growthEngineCacheManager: GrowthEngineCacheManager;
export declare const growthEngineStateOptimizer: GrowthEngineStateOptimizer;
export declare const growthEnginePerformanceMonitor: GrowthEnginePerformanceMonitor;
//# sourceMappingURL=performance-optimizer.d.ts.map