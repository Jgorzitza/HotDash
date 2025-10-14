/**
 * Debugging tools and utilities
 * 
 * Provides utilities for debugging application issues,
 * inspecting state, and troubleshooting problems.
 */

import { cache } from "./cache.server";
import { perfMonitor } from "./performance.server";
import { apm } from "./apm.server";
import { queryOptimizer } from "./query-optimizer.server";
import { requestLogger } from "../middleware/logging.server";

interface DebugSnapshot {
  timestamp: Date;
  cache: {
    size: number;
    keys: string[];
  };
  performance: Record<string, { count: number; avg: number; min: number; max: number }>;
  apm: {
    totalTransactions: number;
    successRate: number;
    avgDuration: number;
    errorRate: number;
  };
  queries: {
    totalQueries: number;
    avgDuration: number;
    slowQueryCount: number;
  };
  requests: {
    total: number;
    errors: number;
    slow: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  uptime: number;
}

class DebugTools {
  /**
   * Capture a complete system snapshot
   */
  captureSnapshot(): DebugSnapshot {
    const cacheStats = cache.getStats();
    const perfSummary = perfMonitor.getSummary();
    const apmMetrics = apm.getMetrics();
    const queryAnalysis = queryOptimizer.analyze();
    const recentLogs = requestLogger.getLogs(1000);
    const memory = process.memoryUsage();

    return {
      timestamp: new Date(),
      cache: cacheStats,
      performance: perfSummary,
      apm: apmMetrics,
      queries: {
        totalQueries: queryAnalysis.totalQueries,
        avgDuration: Math.round(queryAnalysis.avgDuration),
        slowQueryCount: queryAnalysis.slowQueries.length,
      },
      requests: {
        total: recentLogs.length,
        errors: requestLogger.getErrors().length,
        slow: requestLogger.getSlowRequests().length,
      },
      memory: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        rss: Math.round(memory.rss / 1024 / 1024),
      },
      uptime: process.uptime(),
    };
  }

  /**
   * Generate a debug report
   */
  generateReport(): string {
    const snapshot = this.captureSnapshot();

    const report = `
# Debug Report
Generated: ${snapshot.timestamp.toISOString()}

## System Status
- Uptime: ${Math.round(snapshot.uptime / 60)} minutes
- Memory: ${snapshot.memory.heapUsed}MB / ${snapshot.memory.heapTotal}MB
- RSS: ${snapshot.memory.rss}MB

## Cache
- Entries: ${snapshot.cache.size}
- Keys: ${snapshot.cache.keys.slice(0, 10).join(", ")}${snapshot.cache.keys.length > 10 ? "..." : ""}

## Performance
Operations tracked: ${Object.keys(snapshot.performance).length}

Top 5 slowest operations:
${this.formatTopOperations(snapshot.performance)}

## APM Metrics
- Total Transactions: ${snapshot.apm.totalTransactions}
- Success Rate: ${snapshot.apm.successRate.toFixed(1)}%
- Error Rate: ${snapshot.apm.errorRate.toFixed(1)}%
- Avg Duration: ${Math.round(snapshot.apm.avgDuration)}ms

## Database Queries
- Total Queries: ${snapshot.queries.totalQueries}
- Avg Duration: ${snapshot.queries.avgDuration}ms
- Slow Queries (>100ms): ${snapshot.queries.slowQueryCount}

## HTTP Requests
- Total: ${snapshot.requests.total}
- Errors: ${snapshot.requests.errors}
- Slow (>1s): ${snapshot.requests.slow}

## Recommendations
${this.generateRecommendations(snapshot)}
`;

    return report.trim();
  }

  /**
   * Format top operations for report
   */
  private formatTopOperations(
    perf: Record<string, { count: number; avg: number; min: number; max: number }>,
  ): string {
    const entries = Object.entries(perf)
      .sort((a, b) => b[1].avg - a[1].avg)
      .slice(0, 5);

    if (entries.length === 0) {
      return "  No operations tracked yet";
    }

    return entries
      .map(
        ([name, stats]) =>
          `  - ${name}: ${Math.round(stats.avg)}ms avg (${stats.count} calls, max: ${stats.max}ms)`,
      )
      .join("\n");
  }

  /**
   * Generate recommendations based on snapshot
   */
  private generateRecommendations(snapshot: DebugSnapshot): string {
    const recommendations: string[] = [];

    // Memory recommendations
    const memoryUsagePercent = (snapshot.memory.heapUsed / snapshot.memory.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      recommendations.push(
        `⚠️  High memory usage (${memoryUsagePercent.toFixed(1)}%). Consider optimizing cache or restarting.`,
      );
    }

    // Cache recommendations
    if (snapshot.cache.size > 500) {
      recommendations.push(
        `⚠️  Large cache size (${snapshot.cache.size} entries). Consider reducing TTL or cache size.`,
      );
    }

    // Error rate recommendations
    if (snapshot.apm.errorRate > 5) {
      recommendations.push(
        `⚠️  High error rate (${snapshot.apm.errorRate.toFixed(1)}%). Check error logs for issues.`,
      );
    }

    // Performance recommendations
    if (snapshot.apm.avgDuration > 500) {
      recommendations.push(
        `⚠️  Slow average response time (${Math.round(snapshot.apm.avgDuration)}ms). Review performance metrics.`,
      );
    }

    // Query recommendations
    if (snapshot.queries.slowQueryCount > 10) {
      recommendations.push(
        `⚠️  Many slow queries (${snapshot.queries.slowQueryCount}). Review query optimization suggestions.`,
      );
    }

    if (recommendations.length === 0) {
      return "✅ All systems operating normally";
    }

    return recommendations.join("\n");
  }

  /**
   * Clear all debugging data
   */
  clearAll(): void {
    cache.clear();
    perfMonitor.clear();
    apm.clear();
    queryOptimizer.clear();
    requestLogger.clear();
  }
}

// Singleton instance
export const debugTools = new DebugTools();

/**
 * Helper for conditional debugging
 */
export function debug(condition: boolean, ...args: unknown[]): void {
  if (condition || process.env.NODE_ENV === "development") {
    console.log("[DEBUG]", ...args);
  }
}

/**
 * Helper for debug timing
 */
export function debugTime(label: string): () => void {
  const start = Date.now();
  return () => {
    const duration = Date.now() - start;
    debug(true, `${label}: ${duration}ms`);
  };
}

