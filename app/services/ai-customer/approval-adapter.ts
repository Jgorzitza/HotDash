/**
 * AI-Customer CEO Agent Approval Adapter
 *
 * Converts CEO Agent actions into approval records for HITL workflow.
 * All CEO Agent actions require approval before execution.
 * Creates approval queue entries with evidence, reasoning, and risk assessment.
 *
 * @module app/services/ai-customer/approval-adapter
 * @see docs/directions/ai-customer.md AI-CUSTOMER-010
 */

import { createClient } from "@supabase/supabase-js";
import type { ActionType } from "./action-execution";

/**
 * Approval status
 */
export type ApprovalStatus = "pending" | "approved" | "rejected" | "modified";

/**
 * Approval type (maps to action types)
 */
export type ApprovalType = "cx" | "inventory" | "social" | "product" | "ads";

/**
 * CEO Agent action to convert into approval
 */
export interface CEOActionRequest {
  actionId: string;
  actionType: ActionType;
  description: string;
  payload: Record<string, any>;
  reasoning: string;
  evidence: {
    sources: string[]; // KB sources, data queries, etc.
    metrics?: Record<string, number>;
    context?: string;
  };
  projectedImpact?: {
    revenue?: number;
    customerSatisfaction?: number;
    efficiency?: string;
  };
  risks?: string[];
  rollback?: string; // How to undo this action if needed
}

/**
 * Created approval record
 */
export interface ApprovalRecord {
  approvalId: number;
  actionId: string;
  actionType: ApprovalType;
  status: ApprovalStatus;
  queuedAt: string;
  evidence: CEOActionRequest["evidence"];
  reasoning: string;
  approvalUrl?: string; // Deep link to approval drawer
}

/**
 * Create approval record for CEO Agent action
 *
 * Strategy:
 * 1. Validate action request has required fields
 * 2. Store in decision_log with scope='ceo_approval'
 * 3. Create approval queue entry for UI display
 * 4. Return approval ID and URL for CEO to review
 *
 * @param action - CEO Agent action requiring approval
 * @param userId - CEO user ID
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @returns Approval record with ID and review URL
 */
export async function createApproval(
  action: CEOActionRequest,
  userId: string,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<ApprovalRecord> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Validate action request
    validateActionRequest(action);

    const now = new Date().toISOString();

    // Create approval record in decision_log
    const { data, error } = await supabase
      .from("decision_log")
      .insert({
        scope: "ceo_approval",
        actor: userId,
        action: `${action.actionType}.${action.actionId}`,
        rationale: action.reasoning,
        evidence_url: action.evidence.sources[0], // Primary source
        payload: {
          actionId: action.actionId,
          actionType: action.actionType,
          description: action.description,
          actionPayload: action.payload,
          evidence: action.evidence,
          projectedImpact: action.projectedImpact,
          risks: action.risks,
          rollback: action.rollback,
          approvalStatus: "pending",
          queuedAt: now,
        },
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to create approval: ${error.message}`);
    }

    const approvalId = data!.id;

    // Generate approval URL for CEO
    const approvalUrl = `/app/approvals?id=${approvalId}&type=${action.actionType}`;

    return {
      approvalId,
      actionId: action.actionId,
      actionType: action.actionType,
      status: "pending",
      queuedAt: now,
      evidence: action.evidence,
      reasoning: action.reasoning,
      approvalUrl,
    };
  } catch (error) {
    console.error("[Approval Adapter] Error creating approval:", error);
    throw error;
  }
}

/**
 * Update approval status (approved/rejected/modified)
 *
 * @param approvalId - Approval record ID
 * @param status - New status
 * @param userId - CEO user ID
 * @param modifications - Optional modifications to action payload
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @returns Success boolean
 */
export async function updateApprovalStatus(
  approvalId: number,
  status: ApprovalStatus,
  userId: string,
  modifications: Record<string, any> | undefined,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get existing approval
    const { data: existing, error: fetchError } = await supabase
      .from("decision_log")
      .select("*")
      .eq("id", approvalId)
      .single();

    if (fetchError || !existing) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    const payload = existing.payload as any;
    payload.approvalStatus = status;
    payload.reviewedAt = new Date().toISOString();
    payload.reviewedBy = userId;

    if (modifications) {
      payload.modifications = modifications;
      payload.actionPayload = {
        ...payload.actionPayload,
        ...modifications,
      };
    }

    // Update approval
    await supabase.from("decision_log").insert({
      scope: "ceo_approval",
      actor: userId,
      action: `${payload.actionType}.${payload.actionId}.${status}`,
      rationale: `Approval ${status} by CEO`,
      external_ref: existing.external_ref,
      payload,
    });

    return true;
  } catch (error) {
    console.error("[Approval Adapter] Error updating approval:", error);
    return false;
  }
}

/**
 * Get pending approvals for CEO
 *
 * @param userId - CEO user ID
 * @param actionType - Filter by action type (optional)
 * @param limit - Max results
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @returns List of pending approvals
 */
export async function getPendingApprovals(
  userId: string,
  actionType: ApprovalType | undefined,
  limit: number,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<ApprovalRecord[]> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    let query = supabase
      .from("decision_log")
      .select("*")
      .eq("scope", "ceo_approval")
      .eq("actor", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    // Filter pending and optionally by type
    const approvals: ApprovalRecord[] = [];

    for (const record of data) {
      const payload = record.payload as any;

      // Skip non-pending approvals
      if (payload.approvalStatus !== "pending") continue;

      // Filter by action type if specified
      if (actionType && payload.actionType !== actionType) continue;

      approvals.push({
        approvalId: record.id,
        actionId: payload.actionId,
        actionType: payload.actionType,
        status: payload.approvalStatus,
        queuedAt: payload.queuedAt,
        evidence: payload.evidence,
        reasoning: record.rationale || "",
        approvalUrl: `/app/approvals?id=${record.id}&type=${payload.actionType}`,
      });
    }

    return approvals;
  } catch (error) {
    console.error(
      "[Approval Adapter] Error fetching pending approvals:",
      error,
    );
    return [];
  }
}

/**
 * Validate action request has required fields
 */
function validateActionRequest(action: CEOActionRequest): void {
  if (!action.actionId) {
    throw new Error("actionId is required");
  }
  if (!action.actionType) {
    throw new Error("actionType is required");
  }
  if (!action.description) {
    throw new Error("description is required");
  }
  if (!action.payload || typeof action.payload !== "object") {
    throw new Error("payload must be a non-empty object");
  }
  if (!action.reasoning) {
    throw new Error("reasoning is required");
  }
  if (
    !action.evidence ||
    !action.evidence.sources ||
    action.evidence.sources.length === 0
  ) {
    throw new Error("evidence.sources must contain at least one source");
  }
}
