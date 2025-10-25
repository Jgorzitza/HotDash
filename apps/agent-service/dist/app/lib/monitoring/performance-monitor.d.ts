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
export interface PerformanceMetric {
    id: string;
    timestamp: string;
    type: 'route' | 'api' | 'database' | 'external';
    name: string;
    duration: number;
    metadata?: Record<string, any>;
}
export interface PerformanceReport {
    period: string;
    metrics: {
        routes: PerformanceStats;
        apis: PerformanceStats;
        database: PerformanceStats;
        external: PerformanceStats;
    };
    slowestOperations: PerformanceMetric[];
}
interface PerformanceStats {
    count: number;
    avgDuration: number;
    p50: number;
    p95: number;
    p99: number;
    maxDuration: number;
}
export declare class PerformanceMonitor {
    private static instance;
    private metrics;
    private readonly maxMetrics;
    private readonly retentionMs;
    private constructor();
    static getInstance(): PerformanceMonitor;
    /**
     * Record a performance metric
     */
    record(type: PerformanceMetric['type'], name: string, duration: number, metadata?: Record<string, any>): void;
    /**
     * Start timing an operation
     */
    startTimer(type: PerformanceMetric['type'], name: string): () => void;
    /**
     * Get performance report for a time period
     */
    getReport(periodMs?: number): PerformanceReport;
    /**
     * Get metrics by type
     */
    getMetricsByType(type: PerformanceMetric['type'], limit?: number): PerformanceMetric[];
    /**
     * Clear all metrics
     */
    clear(): void;
    /**
     * Calculate statistics for a set of metrics
     */
    private calculateStats;
    /**
     * Calculate percentile
     */
    private percentile;
    /**
     * Start cleanup interval to remove old metrics
     */
    private startCleanupInterval;
}
/**
 * Convenience function to record performance metric
 */
export declare function recordPerformance(type: PerformanceMetric['type'], name: string, duration: number, metadata?: Record<string, any>): void;
/**
 * Convenience function to start a performance timer
 */
export declare function startPerformanceTimer(type: PerformanceMetric['type'], name: string): () => void;
/**
 * Get performance report
 */
export declare function getPerformanceReport(periodMs?: number): PerformanceReport;
export {};
//# sourceMappingURL=performance-monitor.d.ts.map