/**
 * Metrics collection for LlamaIndex MCP Server
 * Tracks performance, errors, and usage statistics
 */

interface MetricPoint {
  timestamp: number;
  value: number;
}

interface ToolMetrics {
  callCount: number;
  errorCount: number;
  totalLatency: number;
  latencyHistory: MetricPoint[];
}

class MetricsCollector {
  private toolMetrics: Map<string, ToolMetrics> = new Map();
  private startTime: number = Date.now();
  private readonly historyLimit = 100; // Keep last 100 data points

  constructor() {
    // Initialize metrics for known tools
    ['query_support', 'refresh_index', 'insight_report'].forEach(tool => {
      this.toolMetrics.set(tool, {
        callCount: 0,
        errorCount: 0,
        totalLatency: 0,
        latencyHistory: [],
      });
    });
  }

  /**
   * Record a tool call with latency
   */
  recordCall(toolName: string, latencyMs: number, isError: boolean = false) {
    let metrics = this.toolMetrics.get(toolName);
    if (!metrics) {
      metrics = {
        callCount: 0,
        errorCount: 0,
        totalLatency: 0,
        latencyHistory: [],
      };
      this.toolMetrics.set(toolName, metrics);
    }

    metrics.callCount++;
    metrics.totalLatency += latencyMs;
    
    if (isError) {
      metrics.errorCount++;
    }

    // Add to history, trim if needed
    metrics.latencyHistory.push({
      timestamp: Date.now(),
      value: latencyMs,
    });

    if (metrics.latencyHistory.length > this.historyLimit) {
      metrics.latencyHistory.shift();
    }
  }

  /**
   * Calculate P95 latency for a tool
   */
  private calculateP95(history: MetricPoint[]): number {
    if (history.length === 0) return 0;
    
    const sorted = [...history].sort((a, b) => a.value - b.value);
    const p95Index = Math.floor(sorted.length * 0.95);
    return sorted[p95Index]?.value || 0;
  }

  /**
   * Get metrics summary for all tools
   */
  getSummary() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000); // seconds
    const toolStats: any = {};

    this.toolMetrics.forEach((metrics, toolName) => {
      const avgLatency = metrics.callCount > 0 
        ? Math.round(metrics.totalLatency / metrics.callCount)
        : 0;
      
      const p95Latency = Math.round(this.calculateP95(metrics.latencyHistory));
      
      const errorRate = metrics.callCount > 0
        ? ((metrics.errorCount / metrics.callCount) * 100).toFixed(2) + '%'
        : '0%';

      toolStats[toolName] = {
        calls: metrics.callCount,
        errors: metrics.errorCount,
        errorRate,
        avgLatencyMs: avgLatency,
        p95LatencyMs: p95Latency,
      };
    });

    return {
      uptime: `${uptime}s`,
      tools: toolStats,
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.toolMetrics.forEach(metrics => {
      metrics.callCount = 0;
      metrics.errorCount = 0;
      metrics.totalLatency = 0;
      metrics.latencyHistory = [];
    });
    this.startTime = Date.now();
  }
}

export const metrics = new MetricsCollector();

