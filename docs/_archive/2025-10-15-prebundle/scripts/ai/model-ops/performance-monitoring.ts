/**
 * Task S: Model Performance Monitoring and Alerting
 */

export const MODEL_METRICS = {
  latency: { p50: 0, p95: 0, p99: 0 },
  quality: { approval_rate: 0, edit_rate: 0, csat: 0 },
  cost: { tokens_per_request: 0, cost_per_conversation: 0 },
  errors: { rate: 0, types: {} },
};

export const ALERT_THRESHOLDS = {
  critical: {
    error_rate: 0.1,
    approval_rate: 0.7,
    p95_latency: 2000,
    cost_per_conv: 1.0,
  },
  warning: {
    error_rate: 0.05,
    approval_rate: 0.8,
    p95_latency: 1000,
    cost_per_conv: 0.5,
  },
};

export async function checkAlerts(metrics: typeof MODEL_METRICS) {
  const alerts = [];

  if (metrics.errors.rate > ALERT_THRESHOLDS.critical.error_rate) {
    alerts.push({ severity: "critical", message: "High error rate detected" });
  }

  if (metrics.quality.approval_rate < ALERT_THRESHOLDS.critical.approval_rate) {
    alerts.push({ severity: "critical", message: "Low approval rate" });
  }

  return alerts;
}
