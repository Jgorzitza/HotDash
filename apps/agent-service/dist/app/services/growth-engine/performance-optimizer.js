/**
 * Growth Engine Performance Optimizer
 *
 * ENG-026: Advanced performance optimization for Growth Engine infrastructure
 * Provides intelligent caching, state management, and performance monitoring
 */
import { createClient } from "@supabase/supabase-js";
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials are not set.");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);
/**
 * Advanced Cache Manager
 */
export class GrowthEngineCacheManager {
    cache = new Map();
    strategies = new Map();
    metrics = [];
    maxCacheSize = 1000; // Maximum number of cached items
    constructor() {
        this.initializeStrategies();
        this.startCleanupInterval();
    }
    initializeStrategies() {
        const strategies = {
            'none': { ttl: 0, maxSize: 0, compression: false, invalidation: 'manual' },
            'short': { ttl: 60000, maxSize: 100, compression: false, invalidation: 'time' },
            'medium': { ttl: 300000, maxSize: 500, compression: true, invalidation: 'smart' },
            'long': { ttl: 1800000, maxSize: 1000, compression: true, invalidation: 'smart' }
        };
        Object.entries(strategies).forEach(([name, strategy]) => {
            this.strategies.set(name, strategy);
        });
    }
    /**
     * Set cache with strategy
     */
    set(key, data, strategy = 'medium') {
        const cacheStrategy = this.strategies.get(strategy);
        if (!cacheStrategy) {
            console.warn(`Unknown cache strategy: ${strategy}`);
            return;
        }
        // Compress data if strategy requires it
        const processedData = cacheStrategy.compression ? this.compress(data) : data;
        const metadata = {
            strategy,
            createdAt: Date.now(),
            ttl: cacheStrategy.ttl,
            accessCount: 0,
            lastAccessed: Date.now(),
            size: this.calculateSize(processedData)
        };
        this.cache.set(key, { data: processedData, metadata });
        this.enforceMaxSize();
    }
    /**
     * Get from cache
     */
    get(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return null;
        const now = Date.now();
        const { data, metadata } = cached;
        // Check TTL
        if (metadata.ttl > 0 && now - metadata.createdAt > metadata.ttl) {
            this.cache.delete(key);
            return null;
        }
        // Update access metadata
        metadata.accessCount++;
        metadata.lastAccessed = now;
        // Decompress if needed
        return metadata.strategy === 'medium' || metadata.strategy === 'long'
            ? this.decompress(data)
            : data;
    }
    /**
     * Check if key exists in cache
     */
    has(key) {
        return this.cache.has(key) && this.get(key) !== null;
    }
    /**
     * Delete from cache
     */
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * Clear cache with pattern
     */
    clear(pattern) {
        if (pattern) {
            for (const [key] of this.cache) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        }
        else {
            this.cache.clear();
        }
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const totalAccesses = Array.from(this.cache.values())
            .reduce((sum, { metadata }) => sum + metadata.accessCount, 0);
        const totalHits = Array.from(this.cache.values())
            .reduce((sum, { metadata }) => sum + metadata.accessCount, 0);
        const hitRate = totalAccesses > 0 ? (totalHits / totalAccesses) * 100 : 0;
        const averageAccessTime = Array.from(this.cache.values())
            .reduce((sum, { metadata }) => sum + (Date.now() - metadata.lastAccessed), 0) / this.cache.size;
        const memoryUsage = Array.from(this.cache.values())
            .reduce((sum, { data, metadata }) => sum + metadata.size, 0);
        const topKeys = Array.from(this.cache.entries())
            .map(([key, { metadata }]) => ({
            key,
            accessCount: metadata.accessCount,
            size: metadata.size
        }))
            .sort((a, b) => b.accessCount - a.accessCount)
            .slice(0, 10);
        return {
            size: this.cache.size,
            hitRate,
            averageAccessTime,
            memoryUsage,
            topKeys
        };
    }
    /**
     * Compress data
     */
    compress(data) {
        try {
            return JSON.stringify(data);
        }
        catch (error) {
            console.error('Compression failed:', error);
            return JSON.stringify({ error: 'Compression failed' });
        }
    }
    /**
     * Decompress data
     */
    decompress(data) {
        try {
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Decompression failed:', error);
            return null;
        }
    }
    /**
     * Calculate data size
     */
    calculateSize(data) {
        try {
            return JSON.stringify(data).length;
        }
        catch (error) {
            return 0;
        }
    }
    /**
     * Enforce maximum cache size
     */
    enforceMaxSize() {
        if (this.cache.size <= this.maxCacheSize)
            return;
        // Remove least recently accessed items
        const entries = Array.from(this.cache.entries());
        entries.sort(([, a], [, b]) => a.metadata.lastAccessed - b.metadata.lastAccessed);
        const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
        toRemove.forEach(([key]) => this.cache.delete(key));
    }
    /**
     * Start cleanup interval
     */
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupExpired();
        }, 60000); // Cleanup every minute
    }
    /**
     * Cleanup expired cache entries
     */
    cleanupExpired() {
        const now = Date.now();
        for (const [key, { metadata }] of this.cache) {
            if (metadata.ttl > 0 && now - metadata.createdAt > metadata.ttl) {
                this.cache.delete(key);
            }
        }
    }
}
/**
 * State Management Optimizer
 */
export class GrowthEngineStateOptimizer {
    state = new Map();
    listeners = new Map();
    persistence = new Map();
    changeHistory = [];
    /**
     * Set state with optimization
     */
    setState(key, value, options = {}) {
        const { persist = false, debounce = 0, validate } = options;
        // Validate value if validator provided
        if (validate && !validate(value)) {
            console.warn(`State validation failed for key: ${key}`);
            return;
        }
        const oldValue = this.state.get(key);
        // Debounce if specified
        if (debounce > 0) {
            const timeoutKey = `debounce_${key}`;
            clearTimeout(this.state.get(timeoutKey));
            const timeout = setTimeout(() => {
                this.setState(key, value, { ...options, debounce: 0 });
                this.state.delete(timeoutKey);
            }, debounce);
            this.state.set(timeoutKey, timeout);
            return;
        }
        // Update state
        this.state.set(key, value);
        // Record change history
        this.changeHistory.push({
            key,
            oldValue,
            newValue: value,
            timestamp: Date.now()
        });
        // Persist if requested
        if (persist) {
            this.persistState(key, value);
        }
        // Notify listeners
        this.notifyListeners(key, { oldValue, newValue: value });
    }
    /**
     * Get state
     */
    getState(key) {
        return this.state.get(key);
    }
    /**
     * Subscribe to state changes
     */
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        // Return unsubscribe function
        return () => {
            this.listeners.get(key)?.delete(callback);
        };
    }
    /**
     * Notify listeners
     */
    notifyListeners(key, data) {
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
            keyListeners.forEach(callback => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error('State listener error:', error);
                }
            });
        }
    }
    /**
     * Persist state to storage
     */
    async persistState(key, value) {
        this.persistence.set(key, value);
        try {
            await supabase
                .from('growth_engine_state')
                .upsert({
                key,
                value,
                updated_at: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Failed to persist state:', error);
        }
    }
    /**
     * Restore state from storage
     */
    async restoreState(key) {
        try {
            const { data } = await supabase
                .from('growth_engine_state')
                .select('value')
                .eq('key', key)
                .single();
            if (data) {
                this.state.set(key, data.value);
                this.persistence.set(key, data.value);
                return data.value;
            }
        }
        catch (error) {
            console.error('Failed to restore state:', error);
        }
        return null;
    }
    /**
     * Get state history
     */
    getStateHistory(key) {
        if (key) {
            return this.changeHistory.filter(change => change.key === key);
        }
        return [...this.changeHistory];
    }
    /**
     * Clear state history
     */
    clearStateHistory(key) {
        if (key) {
            this.changeHistory = this.changeHistory.filter(change => change.key !== key);
        }
        else {
            this.changeHistory = [];
        }
    }
}
/**
 * Performance Monitor
 */
export class GrowthEnginePerformanceMonitor {
    metrics = [];
    cacheManager;
    stateOptimizer;
    constructor(cacheManager, stateOptimizer) {
        this.cacheManager = cacheManager;
        this.stateOptimizer = stateOptimizer;
        this.startMonitoring();
    }
    /**
     * Record performance metrics
     */
    recordMetrics(metrics) {
        const fullMetrics = {
            route: metrics.route || 'unknown',
            loadTime: metrics.loadTime || 0,
            renderTime: metrics.renderTime || 0,
            apiCalls: metrics.apiCalls || 0,
            cacheHits: metrics.cacheHits || 0,
            cacheMisses: metrics.cacheMisses || 0,
            errors: metrics.errors || 0,
            memoryUsage: metrics.memoryUsage || 0,
            timestamp: new Date().toISOString()
        };
        this.metrics.push(fullMetrics);
        this.cleanupOldMetrics();
    }
    /**
     * Get performance insights
     */
    getPerformanceInsights() {
        if (this.metrics.length === 0) {
            return {
                averageLoadTime: 0,
                averageRenderTime: 0,
                cacheHitRate: 0,
                errorRate: 0,
                memoryUsage: 0,
                slowestRoutes: [],
                recommendations: []
            };
        }
        const totalMetrics = this.metrics.length;
        const averageLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / totalMetrics;
        const averageRenderTime = this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / totalMetrics;
        const totalCacheHits = this.metrics.reduce((sum, m) => sum + m.cacheHits, 0);
        const totalCacheMisses = this.metrics.reduce((sum, m) => sum + m.cacheMisses, 0);
        const cacheHitRate = (totalCacheHits + totalCacheMisses) > 0
            ? (totalCacheHits / (totalCacheHits + totalCacheMisses)) * 100
            : 0;
        const totalErrors = this.metrics.reduce((sum, m) => sum + m.errors, 0);
        const errorRate = (totalErrors / totalMetrics) * 100;
        const memoryUsage = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / totalMetrics;
        // Find slowest routes
        const routePerformance = new Map();
        this.metrics.forEach(metric => {
            const current = routePerformance.get(metric.route) || 0;
            routePerformance.set(metric.route, current + metric.loadTime);
        });
        const slowestRoutes = Array.from(routePerformance.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([route]) => route);
        // Generate recommendations
        const recommendations = this.generateRecommendations({
            averageLoadTime,
            averageRenderTime,
            cacheHitRate,
            errorRate,
            memoryUsage,
            slowestRoutes
        });
        return {
            averageLoadTime,
            averageRenderTime,
            cacheHitRate,
            errorRate,
            memoryUsage,
            slowestRoutes,
            recommendations
        };
    }
    /**
     * Generate optimization recommendations
     */
    generateRecommendations(insights) {
        const recommendations = [];
        // Load time recommendations
        if (insights.averageLoadTime > 2000) {
            recommendations.push({
                type: 'routing',
                priority: 'high',
                description: 'Implement route-level caching for slow routes',
                impact: 80,
                effort: 60,
                implementation: 'Add cache strategy to slow routes'
            });
        }
        // Cache recommendations
        if (insights.cacheHitRate < 50) {
            recommendations.push({
                type: 'caching',
                priority: 'medium',
                description: 'Increase cache TTL for frequently accessed routes',
                impact: 70,
                effort: 30,
                implementation: 'Update cache strategies for high-traffic routes'
            });
        }
        // Error rate recommendations
        if (insights.errorRate > 5) {
            recommendations.push({
                type: 'api',
                priority: 'critical',
                description: 'Implement better error handling and retry logic',
                impact: 90,
                effort: 70,
                implementation: 'Add retry mechanisms and error boundaries'
            });
        }
        // Memory usage recommendations
        if (insights.memoryUsage > 100000000) { // 100MB
            recommendations.push({
                type: 'state',
                priority: 'medium',
                description: 'Optimize state management and reduce memory usage',
                impact: 60,
                effort: 50,
                implementation: 'Implement state cleanup and compression'
            });
        }
        // Render time recommendations
        if (insights.averageRenderTime > 1000) {
            recommendations.push({
                type: 'rendering',
                priority: 'high',
                description: 'Optimize component rendering and reduce re-renders',
                impact: 75,
                effort: 80,
                implementation: 'Use React.memo, useMemo, and useCallback'
            });
        }
        return recommendations;
    }
    /**
     * Start performance monitoring
     */
    startMonitoring() {
        // Monitor memory usage
        setInterval(() => {
            if (typeof window !== 'undefined' && 'memory' in performance) {
                const memory = performance.memory;
                this.recordMetrics({
                    route: 'system',
                    memoryUsage: memory.usedJSHeapSize
                });
            }
        }, 30000); // Every 30 seconds
    }
    /**
     * Cleanup old metrics
     */
    cleanupOldMetrics() {
        const oneHourAgo = Date.now() - 3600000; // 1 hour
        this.metrics = this.metrics.filter(metric => new Date(metric.timestamp).getTime() > oneHourAgo);
    }
}
// Export singleton instances
export const growthEngineCacheManager = new GrowthEngineCacheManager();
export const growthEngineStateOptimizer = new GrowthEngineStateOptimizer();
export const growthEnginePerformanceMonitor = new GrowthEnginePerformanceMonitor(growthEngineCacheManager, growthEngineStateOptimizer);
//# sourceMappingURL=performance-optimizer.js.map