/**
 * AI-Customer CEO Agent Monitoring Service
 *
 * Tracks CEO Agent performance metrics including response times,
 * token usage, error rates, and tool utilization patterns.
 * Provides health status and performance dashboards.
 *
 * @module app/services/ai-customer/monitoring
 * @see docs/directions/ai-customer.md AI-CUSTOMER-012
 */
/**
 * Health status
 */
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "offline";
/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    responseTime: {
        avg: number;
        p50: number;
        p95: number;
        p99: number;
    };
    tokenUsage: {
        total: number;
        avgPerQuery: number;
        inputTokens: number;
        outputTokens: number;
    };
    errorRate: {
        percentage: number;
        totalErrors: number;
        totalRequests: number;
        byType: Record<string, number>;
    };
    toolUsage: {
        byTool: Record<string, number>;
        avgToolsPerQuery: number;
        totalToolCalls: number;
    };
}
/**
 * Health check result
 */
export interface HealthCheckResult {
    status: HealthStatus;
    timestamp: string;
    uptime: number;
    metrics: PerformanceMetrics;
    issues: string[];
    recommendations: string[];
}
/**
 * Monitoring time range
 */
export type TimeRange = "1h" | "24h" | "7d" | "30d";
/**
 * Perform health check on CEO Agent
 *
 * Strategy:
 * 1. Query decision_log for recent CEO agent activity
 * 2. Calculate performance metrics (response time, tokens, errors)
 * 3. Analyze tool usage patterns
 * 4. Determine health status based on thresholds
 * 5. Generate recommendations if issues detected
 *
 * @param timeRange - Time range to analyze
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @returns Health check result with metrics
 */
export declare function checkHealth(timeRange: TimeRange, supabaseUrl: string, supabaseKey: string): Promise<HealthCheckResult>;
//# sourceMappingURL=monitoring.d.ts.map