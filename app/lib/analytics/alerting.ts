/**
 * Error Alerting Integration
 *
 * Sends alerts to PagerDuty, Slack, or email when critical errors occur.
 * Feature flag: ANALYTICS_ALERTING_ENABLED (default: false)
 */

export interface Alert {
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  metric?: string;
  value?: number;
  threshold?: number;
  timestamp: string;
}

export interface AlertChannel {
  type: "pagerduty" | "slack" | "email";
  enabled: boolean;
  config: any;
}

/**
 * Check if alerting is enabled
 */
function isAlertingEnabled(): boolean {
  return process.env.ANALYTICS_ALERTING_ENABLED === "true";
}

/**
 * Send alert to configured channels
 */
export async function sendAlert(alert: Alert): Promise<void> {
  if (!isAlertingEnabled()) {
    console.log("[Alerting] Disabled, skipping alert:", alert.title);
    return;
  }

  console.log(`[Alerting] ${alert.severity.toUpperCase()}: ${alert.title}`);

  // TODO: Implement actual alert sending
  // - PagerDuty API
  // - Slack Webhooks
  // - Email via SendGrid/SES
}

/**
 * Create alert from anomaly
 */
export function createAnomalyAlert(
  metric: string,
  value: number,
  threshold: number,
  severity: "info" | "warning" | "critical",
): Alert {
  return {
    severity,
    title: `Analytics Anomaly: ${metric}`,
    description: `${metric} value ${value} exceeds threshold ${threshold}`,
    metric,
    value,
    threshold,
    timestamp: new Date().toISOString(),
  };
}
