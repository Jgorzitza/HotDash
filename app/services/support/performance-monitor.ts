/**
 * Support Performance Monitoring
 *
 * Monitors webhook processing time, retry rates, failure rates
 * Alerts if processing time >1s per message
 */

import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../facts.server";

export interface PerformanceMetrics {
  avgProcessingTimeMs: number;
  p95ProcessingTimeMs: number;
  retryRate: number; // Percentage of webhooks requiring retries
  failureRate: number; // Percentage of webhooks that ultimately failed
  totalProcessed: number;
  period: {
    start: string;
    end: string;
    durationMinutes: number;
  };
}

export interface PerformanceAlert {
  type: "slow_processing" | "high_retry_rate" | "high_failure_rate";
  metric: string;
  threshold: number;
  actual: number;
  severity: "warning" | "critical";
  timestamp: string;
}

const PROCESSING_TIME_THRESHOLD_MS = 1000; // 1 second
const RETRY_RATE_THRESHOLD_PERCENT = 20; // 20%
const FAILURE_RATE_THRESHOLD_PERCENT = 5; // 5%

/**
 * Monitor webhook processing performance and trigger alerts
 *
 * @param processingTimeMs - Time taken to process webhook
 * @param retried - Whether webhook required retries
 * @param failed - Whether webhook ultimately failed
 */
export async function monitorWebhookPerformance(
  processingTimeMs: number,
  retried: boolean,
  failed: boolean,
): Promise<PerformanceAlert | null> {
  // Record individual metric
  await recordDashboardFact({
    shopDomain: "system",
    factType: "support.performance.webhook",
    scope: "performance_monitoring",
    value: {
      processingTimeMs,
      retried,
      failed,
    },
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });

  // Check for slow processing alert
  if (processingTimeMs > PROCESSING_TIME_THRESHOLD_MS) {
    const alert: PerformanceAlert = {
      type: "slow_processing",
      metric: "processing_time_ms",
      threshold: PROCESSING_TIME_THRESHOLD_MS,
      actual: processingTimeMs,
      severity:
        processingTimeMs > PROCESSING_TIME_THRESHOLD_MS * 2
          ? "critical"
          : "warning",
      timestamp: new Date().toISOString(),
    };

    logger.warn("[performance-monitor] Slow webhook processing detected", {
      processingTimeMs,
      threshold: PROCESSING_TIME_THRESHOLD_MS,
      severity: alert.severity,
    });

    // Record alert
    await recordDashboardFact({
      shopDomain: "system",
      factType: "support.performance.alert",
      scope: "performance_monitoring",
      value: alert,
      metadata: {
        timestamp: alert.timestamp,
      },
    });

    return alert;
  }

  return null;
}

/**
 * Get performance metrics for a time period
 *
 * @param periodMinutes - Time period to analyze
 * @returns Aggregated performance metrics
 */
export async function getPerformanceMetrics(
  periodMinutes: number = 60,
): Promise<PerformanceMetrics> {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - periodMinutes * 60 * 1000);

  logger.info("[performance-monitor] Calculating performance metrics", {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    periodMinutes,
  });

  // This would query dashboard_facts for performance data
  // For now, return baseline metrics

  return {
    avgProcessingTimeMs: 0,
    p95ProcessingTimeMs: 0,
    retryRate: 0,
    failureRate: 0,
    totalProcessed: 0,
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      durationMinutes: periodMinutes,
    },
  };
}

/**
 * Check if performance alerts should be triggered based on aggregate metrics
 */
export async function checkPerformanceAlerts(
  metrics: PerformanceMetrics,
): Promise<PerformanceAlert[]> {
  const alerts: PerformanceAlert[] = [];
  const timestamp = new Date().toISOString();

  // Check retry rate
  if (metrics.retryRate > RETRY_RATE_THRESHOLD_PERCENT) {
    alerts.push({
      type: "high_retry_rate",
      metric: "retry_rate_percent",
      threshold: RETRY_RATE_THRESHOLD_PERCENT,
      actual: metrics.retryRate,
      severity:
        metrics.retryRate > RETRY_RATE_THRESHOLD_PERCENT * 2
          ? "critical"
          : "warning",
      timestamp,
    });
  }

  // Check failure rate
  if (metrics.failureRate > FAILURE_RATE_THRESHOLD_PERCENT) {
    alerts.push({
      type: "high_failure_rate",
      metric: "failure_rate_percent",
      threshold: FAILURE_RATE_THRESHOLD_PERCENT,
      actual: metrics.failureRate,
      severity: "critical",
      timestamp,
    });
  }

  // Log and record alerts
  for (const alert of alerts) {
    logger.error("[performance-monitor] Performance alert triggered", alert);

    await recordDashboardFact({
      shopDomain: "system",
      factType: "support.performance.alert",
      scope: "performance_monitoring",
      value: alert,
      metadata: {
        timestamp: alert.timestamp,
      },
    });
  }

  return alerts;
}
