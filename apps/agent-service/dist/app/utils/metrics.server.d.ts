/**
 * Metrics Collection
 *
 * Collects and reports application metrics for monitoring and observability.
 * Tracks counters, gauges, histograms, and timers for key operations.
 */
export interface Metric {
    name: string;
    type: "counter" | "gauge" | "histogram" | "timer";
    value: number;
    timestamp: number;
    tags?: Record<string, string>;
}
export interface MetricsSummary {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, {
        count: number;
        sum: number;
        min: number;
        max: number;
        avg: number;
    }>;
    timers: Record<string, {
        count: number;
        sum: number;
        min: number;
        max: number;
        p95: number;
        p99: number;
    }>;
}
/**
 * Metrics Collector
 */
export declare class MetricsCollector {
    private counters;
    private gauges;
    private histograms;
    private timers;
    /**
     * Increment a counter
     */
    increment(name: string, value?: number, tags?: Record<string, string>): void;
    /**
     * Decrement a counter
     */
    decrement(name: string, value?: number, tags?: Record<string, string>): void;
    /**
     * Set a gauge value
     */
    gauge(name: string, value: number, tags?: Record<string, string>): void;
    /**
     * Record a histogram value
     */
    histogram(name: string, value: number, tags?: Record<string, string>): void;
    /**
     * Record a timer value (in milliseconds)
     */
    timing(name: string, durationMs: number, tags?: Record<string, string>): void;
    /**
     * Time a function execution
     */
    time<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T>;
    /**
     * Get all metrics
     */
    getMetrics(): Metric[];
    /**
     * Get metrics summary
     */
    getSummary(): MetricsSummary;
    /**
     * Reset all metrics
     */
    reset(): void;
    /**
     * Generate key with tags
     */
    private getKey;
    /**
     * Parse name and tags from key
     */
    private parseName;
}
/**
 * Application-specific metrics
 */
export declare class AppMetrics {
    private collector;
    constructor(collector: MetricsCollector);
    httpRequest(method: string, path: string, status: number, durationMs: number): void;
    shopifyApiCall(operation: string, success: boolean, durationMs: number): void;
    gaApiCall(operation: string, success: boolean, durationMs: number): void;
    chatwootApiCall(operation: string, success: boolean, durationMs: number): void;
    agentExecution(agentName: string, success: boolean, durationMs: number): void;
    toolExecution(toolName: string, success: boolean, durationMs: number): void;
    cacheHit(key: string): void;
    cacheMiss(key: string): void;
    error(scope: string, code: string): void;
    contentDraftCreated(platform: string, success: boolean): void;
    contentApprovalCreated(platform: string, priority: string): void;
    contentApprovalReviewed(platform: string, approved: boolean, reviewTimeMs: number): void;
    contentPublished(platform: string, success: boolean): void;
    contentEngagementLift(platform: string, liftPercentage: number): void;
    contentHashtagPerformance(hashtag: string, engagementRate: number): void;
    contentTimingAdherence(platform: string, isOptimal: boolean): void;
    contentRecommendationGenerated(type: string, priority: string): void;
    ideaPoolDraftCreated(ideaId: string, category: string): void;
    ideaPoolApprovalRate(approved: boolean, category: string): void;
    ideaPoolTimeToPublish(durationMs: number, category: string): void;
    contentDiffCaptured(type: string, editDistance: number): void;
    toneAuditRun(passed: boolean, issuesFound: number): void;
}
export declare const metricsCollector: MetricsCollector;
export declare const appMetrics: AppMetrics;
//# sourceMappingURL=metrics.server.d.ts.map