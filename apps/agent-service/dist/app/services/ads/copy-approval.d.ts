/**
 * Ad Copy Approval Service
 *
 * Handles HITL workflow for ad copy changes. Creates approval requests,
 * tracks approval status, and applies approved changes to Google Ads.
 *
 * @module app/services/ads/copy-approval
 */
import type { AdCopy, AdCopyApproval, AdCopyApprovalRequest } from "./types";
/**
 * Create a new ad copy approval request
 *
 * @param request - Ad copy approval request data
 * @returns AdCopyApproval object with pending status
 */
export declare function createApprovalRequest(request: AdCopyApprovalRequest): AdCopyApproval;
/**
 * Get approval by ID
 *
 * @param id - Approval ID
 * @returns AdCopyApproval or undefined if not found
 */
export declare function getApproval(id: string): AdCopyApproval | undefined;
/**
 * Get all pending approvals
 *
 * @returns Array of pending approvals
 */
export declare function getPendingApprovals(): AdCopyApproval[];
/**
 * Get all approvals for a specific campaign
 *
 * @param campaignId - Campaign ID
 * @returns Array of approvals for the campaign
 */
export declare function getCampaignApprovals(campaignId: string): AdCopyApproval[];
/**
 * Approve an ad copy request
 *
 * @param id - Approval ID
 * @param reviewedBy - Reviewer identifier
 * @param reviewNotes - Optional review notes
 * @returns Updated AdCopyApproval
 * @throws Error if approval not found or already processed
 */
export declare function approveAdCopy(id: string, reviewedBy: string, reviewNotes?: string): AdCopyApproval;
/**
 * Reject an ad copy request
 *
 * @param id - Approval ID
 * @param reviewedBy - Reviewer identifier
 * @param reviewNotes - Rejection reason
 * @returns Updated AdCopyApproval
 * @throws Error if approval not found or already processed
 */
export declare function rejectAdCopy(id: string, reviewedBy: string, reviewNotes: string): AdCopyApproval;
/**
 * Mark an approval as applied (after publishing to Google Ads)
 *
 * @param id - Approval ID
 * @returns Updated AdCopyApproval
 * @throws Error if approval not found or not approved
 */
export declare function markAsApplied(id: string): AdCopyApproval;
/**
 * Validate ad copy format
 *
 * @param copy - Ad copy to validate
 * @returns Validation errors (empty array if valid)
 */
export declare function validateAdCopy(copy: AdCopy): string[];
/**
 * Compare two ad copies and generate diff summary
 *
 * @param current - Current ad copy
 * @param proposed - Proposed ad copy
 * @returns Human-readable diff summary
 */
export declare function generateCopyDiff(current: AdCopy, proposed: AdCopy): string[];
/**
 * Get approval statistics
 *
 * @returns Statistics about approvals
 */
export declare function getApprovalStats(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    applied: number;
    approvalRate: number;
};
//# sourceMappingURL=copy-approval.d.ts.map