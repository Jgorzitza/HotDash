/**
 * Support Escalation Logic
 *
 * Triggers:
 * - Angry/frustrated language detected
 * - VIP customer identified
 * - SLA breach occurred
 *
 * Action: Flag conversation for immediate human review
 */

import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../facts.server";

export interface EscalationTrigger {
  type: "angry_language" | "vip_customer" | "sla_breach" | "repeated_contact";
  conversationId: number;
  reason: string;
  severity: "medium" | "high" | "critical";
  metadata?: Record<string, unknown>;
}

export interface EscalationResult {
  escalated: boolean;
  triggers: EscalationTrigger[];
  timestamp: string;
  notificationSent: boolean;
}

/**
 * Detect angry or frustrated language in message
 */
function detectAngryLanguage(content: string): boolean {
  const lowerContent = content.toLowerCase();

  const angryPhrases = [
    "angry",
    "frustrated",
    "furious",
    "unacceptable",
    "terrible",
    "worst",
    "horrible",
    "disgusted",
    "disappointed",
    "ridiculous",
    "pathetic",
    "useless",
    "waste of",
    "never again",
    "cancel",
    "refund now",
  ];

  return angryPhrases.some((phrase) => lowerContent.includes(phrase));
}

/**
 * Check if customer is VIP (high lifetime value or special status)
 */
async function isVIPCustomer(customerId: string): Promise<boolean> {
  // This would check Shopify customer data for VIP status
  // For now, return false as placeholder
  return false;
}

/**
 * Evaluate conversation for escalation triggers
 *
 * @param conversationId - Chatwoot conversation ID
 * @param messageContent - Latest message content
 * @param customerId - Customer identifier (optional)
 * @param slaBreached - Whether SLA has been breached
 * @returns Escalation result with triggers
 */
export async function evaluateEscalation(
  conversationId: number,
  messageContent: string,
  customerId?: string,
  slaBreached?: boolean,
): Promise<EscalationResult> {
  const triggers: EscalationTrigger[] = [];

  // Check angry language
  if (detectAngryLanguage(messageContent)) {
    triggers.push({
      type: "angry_language",
      conversationId,
      reason: "Customer message contains frustrated/angry language",
      severity: "high",
      metadata: {
        messageLength: messageContent.length,
      },
    });

    logger.warn("[escalator] Angry language detected", {
      conversationId,
    });
  }

  // Check VIP status
  if (customerId) {
    const isVIP = await isVIPCustomer(customerId);
    if (isVIP) {
      triggers.push({
        type: "vip_customer",
        conversationId,
        reason: "VIP customer requires priority handling",
        severity: "high",
        metadata: {
          customerId,
        },
      });

      logger.info("[escalator] VIP customer detected", {
        conversationId,
        customerId,
      });
    }
  }

  // Check SLA breach
  if (slaBreached) {
    triggers.push({
      type: "sla_breach",
      conversationId,
      reason: "First response SLA exceeded (>15 minutes)",
      severity: "critical",
      metadata: {
        slaTargetMinutes: 15,
      },
    });

    logger.error("[escalator] SLA breach detected", {
      conversationId,
    });
  }

  // Determine if escalation should occur
  const shouldEscalate = triggers.length > 0;
  const timestamp = new Date().toISOString();

  if (shouldEscalate) {
    const highestSeverity = triggers.some((t) => t.severity === "critical")
      ? "critical"
      : triggers.some((t) => t.severity === "high")
        ? "high"
        : "medium";

    logger.error("[escalator] ESCALATION triggered", {
      conversationId,
      triggerCount: triggers.length,
      severity: highestSeverity,
      reasons: triggers.map((t) => t.reason),
    });

    // Record escalation fact
    await recordDashboardFact({
      shopDomain: "system",
      factType: "support.escalation",
      scope: "escalation_logic",
      value: {
        conversationId,
        triggers: triggers.map((t) => ({
          type: t.type,
          reason: t.reason,
          severity: t.severity,
        })),
        highestSeverity,
      },
      metadata: {
        timestamp,
        requires_human_review: true,
      },
    });

    // Future: Send notification to manager/support lead
    // For now, just log the escalation
  }

  return {
    escalated: shouldEscalate,
    triggers,
    timestamp,
    notificationSent: false, // Placeholder - would send actual notifications
  };
}

/**
 * Get escalation statistics for a time period
 */
export async function getEscalationStats(
  startDate: Date,
  endDate: Date,
): Promise<{
  total: number;
  bySeverity: Record<string, number>;
  byTrigger: Record<string, number>;
}> {
  // This would query dashboard_facts for escalation data
  logger.info("[escalator] Getting escalation stats", {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  });

  return {
    total: 0,
    bySeverity: {},
    byTrigger: {},
  };
}
