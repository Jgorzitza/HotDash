/**
 * Metrics collection for LlamaIndex MCP Server
 * Tracks performance, errors, and usage statistics
 */
declare class MetricsCollector {
    private toolMetrics;
    private startTime;
    private readonly historyLimit;
    constructor();
    /**
     * Record a tool call with latency
     */
    recordCall(toolName: string, latencyMs: number, isError?: boolean): void;
    /**
     * Calculate P95 latency for a tool
     */
    private calculateP95;
    /**
     * Get metrics summary for all tools
     */
    getSummary(): {
        uptime: string;
        tools: any;
    };
    /**
     * Reset all metrics
     */
    reset(): void;
}
export declare const metrics: MetricsCollector;
export {};
//# sourceMappingURL=metrics.d.ts.map