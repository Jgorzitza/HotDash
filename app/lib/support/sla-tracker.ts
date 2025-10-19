/**
 * Support SLA Tracking
 *
 * Tracks first response time SLA: <15 minutes during business hours
 * Reports SLA compliance percentage
 */

import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../../services/facts.server";

export interface SLATracking {
  conversationId: number;
  firstMessageAt: Date;
  firstResponseAt?: Date;
  responseTimeMinutes?: number;
  withinSLA: boolean;
  businessHours: boolean;
}

export interface SLAComplianceReport {
  period: {
    start: string;
    end: string;
  };
  totalConversations: number;
  withinSLA: number;
  breached: number;
  compliancePercent: number;
  avgResponseMinutes: number;
}

const SLA_TARGET_MINUTES = 15;

/**
 * Check if timestamp is during business hours (9am-5pm UTC, Mon-Fri)
 */
export function isBusinessHours(timestamp: Date): boolean {
  const hour = timestamp.getUTCHours();
  const day = timestamp.getUTCDay(); // 0 = Sunday, 6 = Saturday

  const isWeekday = day >= 1 && day <= 5;
  const isWorkHours = hour >= 9 && hour < 17;

  return isWeekday && isWorkHours;
}

/**
 * Calculate response time in minutes
 */
export function calculateResponseTime(
  firstMessageAt: Date,
  firstResponseAt: Date,
): number {
  const diffMs = firstResponseAt.getTime() - firstMessageAt.getTime();
  return Math.round(diffMs / 1000 / 60); // Convert to minutes
}

/**
 * Track SLA for a conversation
 *
 * @param conversationId - Chatwoot conversation ID
 * @param firstMessageAt - When customer first messaged
 * @param firstResponseAt - When agent first responded
 * @returns SLA tracking record
 */
export async function trackConversationSLA(
  conversationId: number,
  firstMessageAt: Date,
  firstResponseAt?: Date,
): Promise<SLATracking> {
  const businessHours = isBusinessHours(firstMessageAt);

  let responseTimeMinutes: number | undefined;
  let withinSLA = true;

  if (firstResponseAt) {
    responseTimeMinutes = calculateResponseTime(
      firstMessageAt,
      firstResponseAt,
    );

    // Only enforce SLA during business hours
    if (businessHours) {
      withinSLA = responseTimeMinutes <= SLA_TARGET_MINUTES;
    }

    logger.info("[sla-tracker] Conversation response tracked", {
      conversationId,
      responseTimeMinutes,
      withinSLA,
      businessHours,
    });

    // Record SLA fact
    await recordDashboardFact({
      shopDomain: "system",
      factType: "support.conversation.sla",
      scope: "sla_tracking",
      value: {
        conversationId,
        responseTimeMinutes,
        withinSLA,
        businessHours,
        targetMinutes: SLA_TARGET_MINUTES,
      },
      metadata: {
        firstMessageAt: firstMessageAt.toISOString(),
        firstResponseAt: firstResponseAt.toISOString(),
      },
    });

    // Record breach if applicable
    if (!withinSLA && businessHours) {
      logger.warn("[sla-tracker] SLA BREACH detected", {
        conversationId,
        responseTimeMinutes,
        targetMinutes: SLA_TARGET_MINUTES,
      });

      await recordDashboardFact({
        shopDomain: "system",
        factType: "support.sla.breach",
        scope: "sla_tracking",
        value: {
          conversationId,
          responseTimeMinutes,
          targetMinutes: SLA_TARGET_MINUTES,
          overage: responseTimeMinutes - SLA_TARGET_MINUTES,
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  return {
    conversationId,
    firstMessageAt,
    firstResponseAt,
    responseTimeMinutes,
    withinSLA,
    businessHours,
  };
}

/**
 * Get SLA compliance report for a time period
 *
 * @param startDate - Period start
 * @param endDate - Period end
 * @returns Compliance report with percentages
 */
export async function getSLAComplianceReport(
  startDate: Date,
  endDate: Date,
): Promise<SLAComplianceReport> {
  // This would query dashboard_facts for SLA data
  // For now, return mock structure

  logger.info("[sla-tracker] Generating compliance report", {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  });

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    totalConversations: 0,
    withinSLA: 0,
    breached: 0,
    compliancePercent: 100,
    avgResponseMinutes: 0,
  };
}
