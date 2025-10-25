/**
 * Performance Monitoring System
 *
 * Tracks application performance metrics:
 * - Response times
 * - Database query performance
 * - API call latency
 * - Resource usage
 *
 * @see DEVOPS-017
 */
export class PerformanceMonitor {
    static instance;
    metrics = [];
    maxMetrics = 10000;
    retentionMs = 24 * 60 * 60 * 1000; // 24 hours
    constructor() {
        // Singleton pattern
        this.startCleanupInterval();
    }
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    /**
     * Record a performance metric
     */
    record(type, name, duration, metadata) {
        const metric = {
            id: `perf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            timestamp: new Date().toISOString(),
            type,
            name,
            duration,
            metadata,
        };
        this.metrics.push(metric);
        // Trim old metrics if we exceed max
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
        // Log slow operations
        if (duration > 3000) {
            console.warn('[PerformanceMonitor] Slow operation detected:', {
                type,
                name,
                duration: `${duration}ms`,
            });
        }
    }
    /**
     * Start timing an operation
     */
    startTimer(type, name) {
        const start = performance.now();
        return (metadata) => {
            const duration = Math.round(performance.now() - start);
            this.record(type, name, duration, metadata);
        };
    }
    /**
     * Get performance report for a time period
     */
    getReport(periodMs = 3600000) {
        const cutoff = Date.now() - periodMs;
        const recentMetrics = this.metrics.filter(m => new Date(m.timestamp).getTime() > cutoff);
        const routes = this.calculateStats(recentMetrics.filter(m => m.type === 'route'));
        const apis = this.calculateStats(recentMetrics.filter(m => m.type === 'api'));
        const database = this.calculateStats(recentMetrics.filter(m => m.type === 'database'));
        const external = this.calculateStats(recentMetrics.filter(m => m.type === 'external'));
        const slowestOperations = recentMetrics
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10);
        return {
            period: `${periodMs / 1000}s`,
            metrics: {
                routes,
                apis,
                database,
                external,
            },
            slowestOperations,
        };
    }
    /**
     * Get metrics by type
     */
    getMetricsByType(type, limit = 100) {
        return this.metrics
            .filter(m => m.type === type)
            .slice(-limit);
    }
    /**
     * Clear all metrics
     */
    clear() {
        this.metrics = [];
    }
    /**
     * Calculate statistics for a set of metrics
     */
    calculateStats(metrics) {
        if (metrics.length === 0) {
            return {
                count: 0,
                avgDuration: 0,
                p50: 0,
                p95: 0,
                p99: 0,
                maxDuration: 0,
            };
        }
        const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
        const sum = durations.reduce((a, b) => a + b, 0);
        return {
            count: metrics.length,
            avgDuration: Math.round(sum / metrics.length),
            p50: this.percentile(durations, 0.5),
            p95: this.percentile(durations, 0.95),
            p99: this.percentile(durations, 0.99),
            maxDuration: durations[durations.length - 1],
        };
    }
    /**
     * Calculate percentile
     */
    percentile(sorted, p) {
        const index = Math.ceil(sorted.length * p) - 1;
        return sorted[Math.max(0, index)];
    }
    /**
     * Start cleanup interval to remove old metrics
     */
    startCleanupInterval() {
        setInterval(() => {
            const cutoff = Date.now() - this.retentionMs;
            this.metrics = this.metrics.filter(m => new Date(m.timestamp).getTime() > cutoff);
        }, 3600000); // Run every hour
    }
}
/**
 * Convenience function to record performance metric
 */
export function recordPerformance(type, name, duration, metadata) {
    PerformanceMonitor.getInstance().record(type, name, duration, metadata);
}
/**
 * Convenience function to start a performance timer
 */
export function startPerformanceTimer(type, name) {
    return PerformanceMonitor.getInstance().startTimer(type, name);
}
/**
 * Get performance report
 */
export function getPerformanceReport(periodMs) {
    return PerformanceMonitor.getInstance().getReport(periodMs);
}
//# sourceMappingURL=performance-monitor.js.map