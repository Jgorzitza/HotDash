/**
 * Approvals Service
 *
 * Business logic for approval workflows
 */
import type { Approval } from "~/components/approvals/ApprovalsDrawer";
/**
 * Get all pending approvals
 */
export declare function getPendingApprovals(): Promise<Approval[]>;
/**
 * Get approval by ID
 */
export declare function getApprovalById(id: string): Promise<Approval | null>;
/**
 * Approve an approval request
 */
export declare function approveRequest(id: string, grades?: {
    tone: number;
    accuracy: number;
    policy: number;
}): Promise<{
    success: boolean;
}>;
/**
 * Reject an approval request
 */
export declare function rejectRequest(id: string, reason: string): Promise<{
    success: boolean;
}>;
/**
 * Get approvals with optional filters
 */
export declare function getApprovals(filters?: {
    state?: string;
    kind?: string;
    limit?: number;
    offset?: number;
}): Promise<{
    approvals: Approval[];
    total: number;
    error: string | null;
}>;
/**
 * Get approval counts by state
 */
export declare function getApprovalCounts(): Promise<Record<string, number>>;
//# sourceMappingURL=approvals.d.ts.map