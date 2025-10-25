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
  histograms: Record<
    string,
    { count: number; sum: number; min: number; max: number; avg: number }
  >;
  timers: Record<
    string,
    {
      count: number;
      sum: number;
      min: number;
      max: number;
      p95: number;
      p99: number;
    }
  >;
}

/**
 * Metrics Collector
 */
export class MetricsCollector {
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();
  private timers = new Map<string, number[]>();

  /**
   * Increment a counter
   */
  increment(
    name: string,
    value: number = 1,
    tags?: Record<string, string>,
  ): void {
    const key = this.getKey(name, tags);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  /**
   * Decrement a counter
   */
  decrement(
    name: string,
    value: number = 1,
    tags?: Record<string, string>,
  ): void {
    this.increment(name, -value, tags);
  }

  /**
   * Set a gauge value
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags);
    this.gauges.set(key, value);
  }

  /**
   * Record a histogram value
   */
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);

    // Keep only last 1000 values per histogram
    if (values.length > 1000) {
      this.histograms.set(key, values.slice(-1000));
    }
  }

  /**
   * Record a timer value (in milliseconds)
   */
  timing(
    name: string,
    durationMs: number,
    tags?: Record<string, string>,
  ): void {
    const key = this.getKey(name, tags);
    const values = this.timers.get(key) || [];
    values.push(durationMs);
    this.timers.set(key, values);

    // Keep only last 1000 values per timer
    if (values.length > 1000) {
      this.timers.set(key, values.slice(-1000));
    }
  }

  /**
   * Time a function execution
   */
  async time<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>,
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.timing(name, duration, tags);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.timing(name, duration, { ...tags, error: "true" });
      throw error;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): Metric[] {
    const metrics: Metric[] = [];
    const timestamp = Date.now();

    // Counters
    for (const [name, value] of this.counters.entries()) {
      metrics.push({
        name: this.parseName(name).name,
        type: "counter",
        value,
        timestamp,
        tags: this.parseName(name).tags,
      });
    }

    // Gauges
    for (const [name, value] of this.gauges.entries()) {
      metrics.push({
        name: this.parseName(name).name,
        type: "gauge",
        value,
        timestamp,
        tags: this.parseName(name).tags,
      });
    }

    // Histograms
    for (const [name, values] of this.histograms.entries()) {
      if (values.length > 0) {
        metrics.push({
          name: this.parseName(name).name,
          type: "histogram",
          value: values[values.length - 1],
          timestamp,
          tags: this.parseName(name).tags,
        });
      }
    }

    // Timers
    for (const [name, values] of this.timers.entries()) {
      if (values.length > 0) {
        metrics.push({
          name: this.parseName(name).name,
          type: "timer",
          value: values[values.length - 1],
          timestamp,
          tags: this.parseName(name).tags,
        });
      }
    }

    return metrics;
  }

  /**
   * Get metrics summary
   */
  getSummary(): MetricsSummary {
    const summary: MetricsSummary = {
      counters: {},
      gauges: {},
      histograms: {},
      timers: {},
    };

    // Counters
    for (const [name, value] of this.counters.entries()) {
      summary.counters[name] = value;
    }

    // Gauges
    for (const [name, value] of this.gauges.entries()) {
      summary.gauges[name] = value;
    }

    // Histograms
    for (const [name, values] of this.histograms.entries()) {
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        summary.histograms[name] = {
          count: values.length,
          sum,
          min: Math.min(...values),
          max: Math.max(...values),
          avg: sum / values.length,
        };
      }
    }

    // Timers
    for (const [name, values] of this.timers.entries()) {
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        const sum = sorted.reduce((a, b) => a + b, 0);
        const p95Index = Math.floor(sorted.length * 0.95);
        const p99Index = Math.floor(sorted.length * 0.99);

        summary.timers[name] = {
          count: sorted.length,
          sum,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          p95: sorted[p95Index] || 0,
          p99: sorted[p99Index] || 0,
        };
      }
    }

    return summary;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.timers.clear();
  }

  /**
   * Generate key with tags
   */
  private getKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name;
    }
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(",");
    return `${name}[${tagStr}]`;
  }

  /**
   * Parse name and tags from key
   */
  private parseName(key: string): {
    name: string;
    tags?: Record<string, string>;
  } {
    const match = key.match(/^(.+?)\[(.+)\]$/);
    if (!match) {
      return { name: key };
    }

    const name = match[1];
    const tagStr = match[2];
    const tags: Record<string, string> = {};

    for (const pair of tagStr.split(",")) {
      const [k, v] = pair.split(":");
      if (k && v) {
        tags[k] = v;
      }
    }

    return { name, tags };
  }
}

/**
 * Application-specific metrics
 */
export class AppMetrics {
  private collector: MetricsCollector;

  constructor(collector: MetricsCollector) {
    this.collector = collector;
  }

  // HTTP metrics
  httpRequest(
    method: string,
    path: string,
    status: number,
    durationMs: number,
  ): void {
    this.collector.increment("http.requests", 1, {
      method,
      status: String(status),
    });
    this.collector.timing("http.response_time", durationMs, { method, path });
  }

  // Service metrics
  shopifyApiCall(
    operation: string,
    success: boolean,
    durationMs: number,
  ): void {
    this.collector.increment("shopify.api_calls", 1, {
      operation,
      success: String(success),
    });
    this.collector.timing("shopify.api_latency", durationMs, { operation });
  }

  gaApiCall(operation: string, success: boolean, durationMs: number): void {
    this.collector.increment("ga.api_calls", 1, {
      operation,
      success: String(success),
    });
    this.collector.timing("ga.api_latency", durationMs, { operation });
  }

  chatwootApiCall(
    operation: string,
    success: boolean,
    durationMs: number,
  ): void {
    this.collector.increment("chatwoot.api_calls", 1, {
      operation,
      success: String(success),
    });
    this.collector.timing("chatwoot.api_latency", durationMs, { operation });
  }

  // Agent metrics
  agentExecution(
    agentName: string,
    success: boolean,
    durationMs: number,
  ): void {
    this.collector.increment("agent.executions", 1, {
      agent: agentName,
      success: String(success),
    });
    this.collector.timing("agent.execution_time", durationMs, {
      agent: agentName,
    });
  }

  toolExecution(toolName: string, success: boolean, durationMs: number): void {
    this.collector.increment("tool.executions", 1, {
      tool: toolName,
      success: String(success),
    });
    this.collector.timing("tool.execution_time", durationMs, {
      tool: toolName,
    });
  }

  // Cache metrics
  cacheHit(key: string): void {
    this.collector.increment("cache.hits", 1, { key });
  }

  cacheMiss(key: string): void {
    this.collector.increment("cache.misses", 1, { key });
  }

  // Error metrics
  error(scope: string, code: string): void {
    this.collector.increment("errors", 1, { scope, code });
  }

  // Content metrics (Task 8: Telemetry & Metrics)
  contentDraftCreated(platform: string, success: boolean): void {
    this.collector.increment("content.drafts_created", 1, {
      platform,
      success: String(success),
    });
  }

  contentApprovalCreated(platform: string, priority: string): void {
    this.collector.increment("content.approvals_created", 1, {
      platform,
      priority,
    });
  }

  contentApprovalReviewed(
    platform: string,
    approved: boolean,
    reviewTimeMs: number,
  ): void {
    this.collector.increment("content.approvals_reviewed", 1, {
      platform,
      approved: String(approved),
    });
    this.collector.timing("content.approval_review_time", reviewTimeMs, {
      platform,
    });
  }

  contentPublished(platform: string, success: boolean): void {
    this.collector.increment("content.posts_published", 1, {
      platform,
      success: String(success),
    });
  }

  contentEngagementLift(platform: string, liftPercentage: number): void {
    this.collector.histogram("content.engagement_lift", liftPercentage, {
      platform,
    });
  }

  contentHashtagPerformance(hashtag: string, engagementRate: number): void {
    this.collector.histogram("content.hashtag_performance", engagementRate, {
      hashtag,
    });
  }

  contentTimingAdherence(platform: string, isOptimal: boolean): void {
    this.collector.increment("content.timing_adherence", 1, {
      platform,
      optimal: String(isOptimal),
    });
  }

  contentRecommendationGenerated(type: string, priority: string): void {
    this.collector.increment("content.recommendations_generated", 1, {
      type,
      priority,
    });
  }

  // Idea pool metrics (Task 9)
  ideaPoolDraftCreated(ideaId: string, category: string): void {
    this.collector.increment("content.idea_pool_drafts", 1, { category });
  }

  ideaPoolApprovalRate(approved: boolean, category: string): void {
    this.collector.increment("content.idea_pool_approvals", 1, {
      approved: String(approved),
      category,
    });
  }

  ideaPoolTimeToPublish(durationMs: number, category: string): void {
    this.collector.histogram("content.idea_pool_time_to_publish", durationMs, {
      category,
    });
  }

  // Learning loop metrics (Task 11)
  contentDiffCaptured(type: string, editDistance: number): void {
    this.collector.increment("content.diffs_captured", 1, { type });
    this.collector.histogram("content.edit_distance", editDistance, { type });
  }

  // Tone audit metrics (Task 12)
  toneAuditRun(passed: boolean, issuesFound: number): void {
    this.collector.increment("content.tone_audits", 1, {
      passed: String(passed),
    });
    this.collector.histogram("content.tone_issues", issuesFound, {});
  }
}

// Export singleton instances
export const metricsCollector = new MetricsCollector();
export const appMetrics = new AppMetrics(metricsCollector);

// Export metrics every minute for monitoring systems
setInterval(() => {
  const summary = metricsCollector.getSummary();
}, 60000);
