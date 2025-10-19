/**
 * Audit Service
 *
 * Audit trail for campaign changes and approvals
 *
 * @module app/services/ads/audit.service
 */

import type { Campaign, AdsApprovalRequest } from "~/lib/ads";

/**
 * Audit event type
 */
export enum AuditEventType {
  CAMPAIGN_CREATED = "campaign_created",
  CAMPAIGN_UPDATED = "campaign_updated",
  CAMPAIGN_PAUSED = "campaign_paused",
  CAMPAIGN_RESUMED = "campaign_resumed",
  BUDGET_CHANGED = "budget_changed",
  APPROVAL_REQUESTED = "approval_requested",
  APPROVAL_APPROVED = "approval_approved",
  APPROVAL_REJECTED = "approval_rejected",
  METRICS_SYNCED = "metrics_synced",
}

/**
 * Audit event
 */
export interface AuditEvent {
  id: string;
  type: AuditEventType;
  campaignId?: string;
  userId: string;
  timestamp: string;
  before?: any;
  after?: any;
  metadata?: Record<string, unknown>;
  rollbackData?: any;
}

/**
 * Create audit event
 *
 * @param type - Event type
 * @param data - Event data
 * @returns Audit event
 */
export function createAuditEvent(
  type: AuditEventType,
  data: {
    campaignId?: string;
    userId: string;
    before?: any;
    after?: any;
    metadata?: Record<string, unknown>;
    rollbackData?: any;
  },
): AuditEvent {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: new Date().toISOString(),
    ...data,
  };
}

/**
 * Log campaign creation
 */
export async function auditCampaignCreation(
  campaign: Campaign,
  userId: string,
  approvalRequest: AdsApprovalRequest,
): Promise<void> {
  const event = createAuditEvent(AuditEventType.CAMPAIGN_CREATED, {
    campaignId: campaign.id,
    userId,
    after: campaign,
    metadata: {
      approvalType: approvalRequest.type,
      riskLevel: approvalRequest.risk.level,
    },
    rollbackData: approvalRequest.rollback,
  });

  console.log("[AUDIT]", event);
  // Real implementation would store to Supabase audit table
}

/**
 * Log budget change
 */
export async function auditBudgetChange(
  campaignId: string,
  userId: string,
  oldBudget: number,
  newBudget: number,
  justification: string,
): Promise<void> {
  const event = createAuditEvent(AuditEventType.BUDGET_CHANGED, {
    campaignId,
    userId,
    before: { dailyBudget: oldBudget },
    after: { dailyBudget: newBudget },
    metadata: { justification },
    rollbackData: { dailyBudget: oldBudget },
  });

  console.log("[AUDIT]", event);
}

/**
 * Log campaign pause
 */
export async function auditCampaignPause(
  campaign: Campaign,
  userId: string,
  reason: string,
): Promise<void> {
  const event = createAuditEvent(AuditEventType.CAMPAIGN_PAUSED, {
    campaignId: campaign.id,
    userId,
    before: { status: campaign.status },
    after: { status: "paused" },
    metadata: { reason },
    rollbackData: { status: campaign.status },
  });

  console.log("[AUDIT]", event);
}

/**
 * Log approval decision
 */
export async function auditApprovalDecision(
  approvalRequest: AdsApprovalRequest,
  userId: string,
  decision: "approved" | "rejected",
  notes?: string,
): Promise<void> {
  const eventType =
    decision === "approved"
      ? AuditEventType.APPROVAL_APPROVED
      : AuditEventType.APPROVAL_REJECTED;

  const event = createAuditEvent(eventType, {
    campaignId: approvalRequest.campaign.id,
    userId,
    metadata: {
      approvalType: approvalRequest.type,
      riskLevel: approvalRequest.risk.level,
      notes,
    },
  });

  console.log("[AUDIT]", event);
}
