/**
 * SEO Alerting System
 */

import type { DetectedAnomaly } from "./anomalies-detector";

export interface AlertRule {
  id: string;
  name: string;
  condition: (anomaly: DetectedAnomaly) => boolean;
  action: "email" | "slack" | "pager";
  recipients: string[];
}

export interface Alert {
  id: string;
  ruleId: string;
  anomaly: DetectedAnomaly;
  triggeredAt: string;
  acknowledged: boolean;
}

export function evaluateAlertRules(
  anomalies: DetectedAnomaly[],
  rules: AlertRule[],
): Alert[] {
  const alerts: Alert[] = [];

  for (const anomaly of anomalies) {
    for (const rule of rules) {
      if (rule.condition(anomaly)) {
        alerts.push({
          id: `alert-${Date.now()}-${rule.id}`,
          ruleId: rule.id,
          anomaly,
          triggeredAt: new Date().toISOString(),
          acknowledged: false,
        });
      }
    }
  }

  return alerts;
}
