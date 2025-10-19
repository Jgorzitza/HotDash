/**
 * Ads Monitoring & Instrumentation
 *
 * Performance tracking and observability for ads module
 *
 * @module app/lib/ads/monitoring
 */

/**
 * Metric type
 */
export enum MetricType {
  COUNTER = "counter",
  GAUGE = "gauge",
  HISTOGRAM = "histogram",
}

/**
 * Performance metric
 */
interface PerformanceMetric {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: string;
}

/**
 * Metrics collector
 */
class AdsMetricsCollector {
  private metrics: PerformanceMetric[] = [];

  /**
   * Record counter metric
   */
  incrementCounter(name: string, labels?: Record<string, string>): void {
    this.metrics.push({
      name,
      type: MetricType.COUNTER,
      value: 1,
      labels,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Record gauge metric
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.metrics.push({
      name,
      type: MetricType.GAUGE,
      value,
      labels,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Record histogram metric (response time, size, etc.)
   */
  recordHistogram(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    this.metrics.push({
      name,
      type: MetricType.HISTOGRAM,
      value,
      labels,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

/**
 * Global metrics collector instance
 */
export const adsMetrics = new AdsMetricsCollector();

/**
 * Track API request performance
 */
export function trackAPIRequest(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
): void {
  adsMetrics.incrementCounter("ads_api_requests_total", {
    endpoint,
    method,
    status: String(statusCode),
  });

  adsMetrics.recordHistogram("ads_api_request_duration_ms", duration, {
    endpoint,
    method,
  });

  if (statusCode >= 500) {
    adsMetrics.incrementCounter("ads_api_errors_total", {
      endpoint,
      method,
      status: String(statusCode),
    });
  }
}

/**
 * Track campaign sync operation
 */
export function trackCampaignSync(
  platform: string,
  campaignCount: number,
  duration: number,
  success: boolean,
): void {
  adsMetrics.incrementCounter("ads_sync_operations_total", {
    platform,
    success: String(success),
  });

  adsMetrics.setGauge("ads_campaigns_synced", campaignCount, { platform });

  adsMetrics.recordHistogram("ads_sync_duration_ms", duration, { platform });

  if (!success) {
    adsMetrics.incrementCounter("ads_sync_failures_total", { platform });
  }
}

/**
 * Track campaign metrics
 */
export function trackCampaignMetrics(
  platform: string,
  campaignCount: number,
  totalSpend: number,
  totalRevenue: number,
  averageROAS: number,
): void {
  adsMetrics.setGauge("ads_active_campaigns", campaignCount, { platform });
  adsMetrics.setGauge("ads_total_spend", totalSpend, { platform });
  adsMetrics.setGauge("ads_total_revenue", totalRevenue, { platform });
  adsMetrics.setGauge("ads_average_roas", averageROAS, { platform });
}

/**
 * Track approval requests
 */
export function trackApprovalRequest(type: string, riskLevel: string): void {
  adsMetrics.incrementCounter("ads_approval_requests_total", {
    type,
    risk_level: riskLevel,
  });
}

/**
 * Track approval decision
 */
export function trackApprovalDecision(
  type: string,
  decision: "approved" | "rejected",
  reviewDuration: number,
): void {
  adsMetrics.incrementCounter("ads_approval_decisions_total", {
    type,
    decision,
  });

  adsMetrics.recordHistogram("ads_approval_review_duration_s", reviewDuration, {
    type,
  });
}

/**
 * Performance timer utility
 */
export function createTimer(): { stop: () => number } {
  const start = Date.now();
  return {
    stop: () => Date.now() - start,
  };
}
