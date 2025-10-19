/**
 * Alert Rules Engine
 *
 * Defines and evaluates alert rules for analytics metrics.
 * Triggers notifications when thresholds are exceeded.
 */

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: "above" | "below" | "change_above" | "change_below";
  threshold: number;
  severity: "info" | "warning" | "critical";
  enabled: boolean;
}

export interface AlertTrigger {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  currentValue: number;
  threshold: number;
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: string;
}

/**
 * Default alert rules
 */
export const DEFAULT_RULES: AlertRule[] = [
  {
    id: "revenue-drop",
    name: "Revenue Drop Alert",
    metric: "revenue_change",
    condition: "below",
    threshold: -20,
    severity: "critical",
    enabled: true,
  },
  {
    id: "conversion-drop",
    name: "Conversion Rate Drop",
    metric: "conversion_change",
    condition: "below",
    threshold: -15,
    severity: "warning",
    enabled: true,
  },
  {
    id: "traffic-spike",
    name: "Traffic Spike",
    metric: "sessions_change",
    condition: "above",
    threshold: 50,
    severity: "info",
    enabled: true,
  },
  {
    id: "low-sessions",
    name: "Low Traffic Alert",
    metric: "sessions",
    condition: "below",
    threshold: 1000,
    severity: "warning",
    enabled: true,
  },
];

/**
 * Evaluate alert rules
 */
export function evaluateRules(
  metrics: Record<string, number>,
  rules: AlertRule[] = DEFAULT_RULES,
): AlertTrigger[] {
  const triggers: AlertTrigger[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;

    const currentValue = metrics[rule.metric];
    if (currentValue === undefined) continue;

    let triggered = false;

    switch (rule.condition) {
      case "above":
        triggered = currentValue > rule.threshold;
        break;
      case "below":
        triggered = currentValue < rule.threshold;
        break;
      case "change_above":
        triggered = currentValue > rule.threshold;
        break;
      case "change_below":
        triggered = currentValue < rule.threshold;
        break;
    }

    if (triggered) {
      triggers.push({
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: true,
        currentValue,
        threshold: rule.threshold,
        severity: rule.severity,
        message: `${rule.name}: ${currentValue} ${rule.condition} ${rule.threshold}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return triggers.sort((a, b) => {
    const severityOrder = { critical: 3, warning: 2, info: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}
