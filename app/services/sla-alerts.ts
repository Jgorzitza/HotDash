/**
 * SLA Alerts — Notify when reviews lag
 *
 * Monitors approval latency and sends alerts when SLA is breached.
 * Target: 15 minutes median approval time.
 */

export interface SLAAlert {
  id: string;
  conversationId: string;
  customerId: string;
  customerEmail?: string;
  waitTimeMinutes: number;
  slaThresholdMinutes: number;
  breachType: "approaching" | "breached" | "critical";
  severity: "low" | "medium" | "high";
  createdAt: string;
  notifiedAt?: string;
}

export interface AlertConfig {
  slaTargetMinutes: number; // Default: 15
  warningThresholdPct: number; // Default: 75% of SLA (11 min)
  criticalMultiplier: number; // Default: 2x SLA (30 min)
  enableNotifications: boolean;
}

const DEFAULT_CONFIG: AlertConfig = {
  slaTargetMinutes: 15,
  warningThresholdPct: 0.75,
  criticalMultiplier: 2,
  enableNotifications: true,
};

/**
 * Calculate wait time in minutes
 */
function calculateWaitTime(draftCreatedAt: string): number {
  const now = Date.now();
  const created = new Date(draftCreatedAt).getTime();
  return Math.floor((now - created) / 1000 / 60);
}

/**
 * Determine breach type and severity
 */
function classifyBreach(
  waitMinutes: number,
  config: AlertConfig,
): { type: SLAAlert["breachType"]; severity: SLAAlert["severity"] } {
  const warningThreshold = config.slaTargetMinutes * config.warningThresholdPct;
  const criticalThreshold = config.slaTargetMinutes * config.criticalMultiplier;

  if (waitMinutes >= criticalThreshold) {
    return { type: "critical", severity: "high" };
  }

  if (waitMinutes >= config.slaTargetMinutes) {
    return { type: "breached", severity: "medium" };
  }

  if (waitMinutes >= warningThreshold) {
    return { type: "approaching", severity: "low" };
  }

  return { type: "approaching", severity: "low" };
}

/**
 * Check if conversation needs SLA alert
 */
export function checkSLA(
  conversationId: string,
  draftCreatedAt: string,
  config: AlertConfig = DEFAULT_CONFIG,
): SLAAlert | null {
  const waitMinutes = calculateWaitTime(draftCreatedAt);
  const warningThreshold = config.slaTargetMinutes * config.warningThresholdPct;

  // Only alert if approaching or breaching SLA
  if (waitMinutes < warningThreshold) {
    return null;
  }

  const classification = classifyBreach(waitMinutes, config);

  return {
    id: `alert-${conversationId}-${Date.now()}`,
    conversationId,
    customerId: "unknown", // TODO: Get from conversation data
    waitTimeMinutes: waitMinutes,
    slaThresholdMinutes: config.slaTargetMinutes,
    breachType: classification.type,
    severity: classification.severity,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate alert message
 */
export function formatAlertMessage(alert: SLAAlert): string {
  const emoji =
    alert.severity === "high"
      ? "🚨"
      : alert.severity === "medium"
        ? "⚠️"
        : "⏰";

  return `${emoji} SLA ${alert.breachType}: Conversation ${alert.conversationId} waiting ${alert.waitTimeMinutes} minutes (target: ${alert.slaThresholdMinutes} min)`;
}

/**
 * Batch check SLAs for multiple conversations
 */
export function batchCheckSLAs(
  conversations: Array<{ id: string; draftCreatedAt: string }>,
  config: AlertConfig = DEFAULT_CONFIG,
): SLAAlert[] {
  return conversations
    .map((conv) => checkSLA(conv.id, conv.draftCreatedAt, config))
    .filter((alert): alert is SLAAlert => alert !== null);
}

/**
 * Send notification (stub - implement actual notification system)
 */
export async function sendAlert(alert: SLAAlert): Promise<boolean> {
  // TODO: Implement notification system
  // Options: Email, Slack, in-app notification, SMS

  console.log(formatAlertMessage(alert));

  return true;
}

/**
 * Get alert summary for dashboard
 */
export function getAlertSummary(alerts: SLAAlert[]): {
  total: number;
  bySeverity: { low: number; medium: number; high: number };
  oldestWaitMinutes: number;
  criticalCount: number;
} {
  return {
    total: alerts.length,
    bySeverity: {
      low: alerts.filter((a) => a.severity === "low").length,
      medium: alerts.filter((a) => a.severity === "medium").length,
      high: alerts.filter((a) => a.severity === "high").length,
    },
    oldestWaitMinutes: Math.max(...alerts.map((a) => a.waitTimeMinutes), 0),
    criticalCount: alerts.filter((a) => a.breachType === "critical").length,
  };
}
