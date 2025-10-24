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
        sources: string[];
        metrics?: Record<string, number>;
        context?: string;
    };
    projectedImpact?: {
        revenue?: number;
        customerSatisfaction?: number;
        efficiency?: string;
    };
    risks?: string[];
    rollback?: string;
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
    approvalUrl?: string;
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
export declare function createApproval(action: CEOActionRequest, userId: string, supabaseUrl: string, supabaseKey: string): Promise<ApprovalRecord>;
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
export declare function updateApprovalStatus(approvalId: number, status: ApprovalStatus, userId: string, modifications: Record<string, any> | undefined, supabaseUrl: string, supabaseKey: string): Promise<boolean>;
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
export declare function getPendingApprovals(userId: string, actionType: ApprovalType | undefined, limit: number, supabaseUrl: string, supabaseKey: string): Promise<ApprovalRecord[]>;
//# sourceMappingURL=approval-adapter.d.ts.map