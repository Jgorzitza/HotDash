/**
 * Support Queue Depth Monitoring
 *
 * Monitors queue depth and triggers alerts:
 * - Alert if queue > 50 pending
 * - Escalate to manager if queue > 100
 */

import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../facts.server";

export interface QueueDepthAlert {
  queueDepth: number;
  threshold: number;
  severity: "warning" | "critical";
  timestamp: string;
}

const ALERT_THRESHOLD = 50;
const ESCALATION_THRESHOLD = 100;

/**
 * Check queue depth and trigger alerts if needed
 *
 * @param queueDepth - Current pending conversation count
 * @returns Alert object if threshold exceeded, null otherwise
 */
export async function monitorQueueDepth(
  queueDepth: number,
): Promise<QueueDepthAlert | null> {
  logger.debug("[queue-monitor] Checking queue depth", { queueDepth });

  let alert: QueueDepthAlert | null = null;

  if (queueDepth > ESCALATION_THRESHOLD) {
    alert = {
      queueDepth,
      threshold: ESCALATION_THRESHOLD,
      severity: "critical",
      timestamp: new Date().toISOString(),
    };

    logger.error(
      "[queue-monitor] CRITICAL: Queue depth exceeds escalation threshold",
      {
        queueDepth,
        threshold: ESCALATION_THRESHOLD,
      },
    );

    // Record escalation fact
    await recordDashboardFact({
      shopDomain: "system",
      factType: "support.queue.escalation",
      scope: "queue_monitoring",
      value: {
        queueDepth,
        threshold: ESCALATION_THRESHOLD,
        severity: "critical",
      },
      metadata: {
        timestamp: alert.timestamp,
        requires_manager_notification: true,
      },
    });
  } else if (queueDepth > ALERT_THRESHOLD) {
    alert = {
      queueDepth,
      threshold: ALERT_THRESHOLD,
      severity: "warning",
      timestamp: new Date().toISOString(),
    };

    logger.warn(
      "[queue-monitor] WARNING: Queue depth exceeds alert threshold",
      {
        queueDepth,
        threshold: ALERT_THRESHOLD,
      },
    );

    // Record warning fact
    await recordDashboardFact({
      shopDomain: "system",
      factType: "support.queue.alert",
      scope: "queue_monitoring",
      value: {
        queueDepth,
        threshold: ALERT_THRESHOLD,
        severity: "warning",
      },
      metadata: {
        timestamp: alert.timestamp,
      },
    });
  }

  // Always record current queue depth for tracking
  await recordDashboardFact({
    shopDomain: "system",
    factType: "support.queue.depth",
    scope: "queue_monitoring",
    value: {
      queueDepth,
    },
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });

  return alert;
}

/**
 * Get current queue depth from recent facts
 */
export async function getCurrentQueueDepth(): Promise<number> {
  // This would query Supabase for the most recent queue depth
  // For now, return 0 as placeholder
  return 0;
}
