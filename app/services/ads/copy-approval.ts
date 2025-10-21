/**
 * Ad Copy Approval Service
 *
 * Handles HITL workflow for ad copy changes. Creates approval requests,
 * tracks approval status, and applies approved changes to Google Ads.
 *
 * @module app/services/ads/copy-approval
 */

import type { AdCopy, AdCopyApproval, AdCopyApprovalRequest, ApprovalStatus } from "./types";

/**
 * In-memory store for ad copy approvals (should be replaced with database)
 */
const approvals: Map<string, AdCopyApproval> = new Map();

/**
 * Generate unique ID for approval
 */
function generateApprovalId(): string {
  return `approval_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Create a new ad copy approval request
 *
 * @param request - Ad copy approval request data
 * @returns AdCopyApproval object with pending status
 */
export function createApprovalRequest(request: AdCopyApprovalRequest): AdCopyApproval {
  const approval: AdCopyApproval = {
    id: generateApprovalId(),
    request,
    status: "pending",
  };

  approvals.set(approval.id, approval);

  return approval;
}

/**
 * Get approval by ID
 *
 * @param id - Approval ID
 * @returns AdCopyApproval or undefined if not found
 */
export function getApproval(id: string): AdCopyApproval | undefined {
  return approvals.get(id);
}

/**
 * Get all pending approvals
 *
 * @returns Array of pending approvals
 */
export function getPendingApprovals(): AdCopyApproval[] {
  return Array.from(approvals.values()).filter(a => a.status === "pending");
}

/**
 * Get all approvals for a specific campaign
 *
 * @param campaignId - Campaign ID
 * @returns Array of approvals for the campaign
 */
export function getCampaignApprovals(campaignId: string): AdCopyApproval[] {
  return Array.from(approvals.values()).filter(
    a => a.request.campaignId === campaignId
  );
}

/**
 * Approve an ad copy request
 *
 * @param id - Approval ID
 * @param reviewedBy - Reviewer identifier
 * @param reviewNotes - Optional review notes
 * @returns Updated AdCopyApproval
 * @throws Error if approval not found or already processed
 */
export function approveAdCopy(
  id: string,
  reviewedBy: string,
  reviewNotes?: string
): AdCopyApproval {
  const approval = approvals.get(id);

  if (!approval) {
    throw new Error(`Approval not found: ${id}`);
  }

  if (approval.status !== "pending") {
    throw new Error(`Approval already processed: ${id} (status: ${approval.status})`);
  }

  approval.status = "approved";
  approval.reviewedBy = reviewedBy;
  approval.reviewedAt = new Date().toISOString();
  approval.reviewNotes = reviewNotes;

  approvals.set(id, approval);

  return approval;
}

/**
 * Reject an ad copy request
 *
 * @param id - Approval ID
 * @param reviewedBy - Reviewer identifier
 * @param reviewNotes - Rejection reason
 * @returns Updated AdCopyApproval
 * @throws Error if approval not found or already processed
 */
export function rejectAdCopy(
  id: string,
  reviewedBy: string,
  reviewNotes: string
): AdCopyApproval {
  const approval = approvals.get(id);

  if (!approval) {
    throw new Error(`Approval not found: ${id}`);
  }

  if (approval.status !== "pending") {
    throw new Error(`Approval already processed: ${id} (status: ${approval.status})`);
  }

  approval.status = "rejected";
  approval.reviewedBy = reviewedBy;
  approval.reviewedAt = new Date().toISOString();
  approval.reviewNotes = reviewNotes;

  approvals.set(id, approval);

  return approval;
}

/**
 * Mark an approval as applied (after publishing to Google Ads)
 *
 * @param id - Approval ID
 * @returns Updated AdCopyApproval
 * @throws Error if approval not found or not approved
 */
export function markAsApplied(id: string): AdCopyApproval {
  const approval = approvals.get(id);

  if (!approval) {
    throw new Error(`Approval not found: ${id}`);
  }

  if (approval.status !== "approved") {
    throw new Error(`Approval must be approved before applying: ${id} (status: ${approval.status})`);
  }

  approval.status = "applied";
  approval.appliedAt = new Date().toISOString();

  approvals.set(id, approval);

  return approval;
}

/**
 * Validate ad copy format
 *
 * @param copy - Ad copy to validate
 * @returns Validation errors (empty array if valid)
 */
export function validateAdCopy(copy: AdCopy): string[] {
  const errors: string[] = [];

  // Validate headlines
  if (!copy.headlines || copy.headlines.length === 0) {
    errors.push("At least one headline is required");
  } else if (copy.headlines.length > 15) {
    errors.push("Maximum 15 headlines allowed");
  }

  for (let i = 0; i < copy.headlines.length; i++) {
    const headline = copy.headlines[i];
    if (headline.length > 30) {
      errors.push(`Headline ${i + 1} exceeds 30 characters: "${headline}"`);
    }
    if (headline.trim().length === 0) {
      errors.push(`Headline ${i + 1} is empty`);
    }
  }

  // Validate descriptions
  if (!copy.descriptions || copy.descriptions.length === 0) {
    errors.push("At least one description is required");
  } else if (copy.descriptions.length > 4) {
    errors.push("Maximum 4 descriptions allowed");
  }

  for (let i = 0; i < copy.descriptions.length; i++) {
    const description = copy.descriptions[i];
    if (description.length > 90) {
      errors.push(`Description ${i + 1} exceeds 90 characters: "${description}"`);
    }
    if (description.trim().length === 0) {
      errors.push(`Description ${i + 1} is empty`);
    }
  }

  // Validate final URL
  if (!copy.finalUrl || copy.finalUrl.trim().length === 0) {
    errors.push("Final URL is required");
  } else {
    try {
      new URL(copy.finalUrl);
    } catch {
      errors.push(`Invalid final URL: ${copy.finalUrl}`);
    }
  }

  // Validate display paths (optional)
  if (copy.displayPath1 && copy.displayPath1.length > 15) {
    errors.push(`Display path 1 exceeds 15 characters: "${copy.displayPath1}"`);
  }
  if (copy.displayPath2 && copy.displayPath2.length > 15) {
    errors.push(`Display path 2 exceeds 15 characters: "${copy.displayPath2}"`);
  }

  return errors;
}

/**
 * Compare two ad copies and generate diff summary
 *
 * @param current - Current ad copy
 * @param proposed - Proposed ad copy
 * @returns Human-readable diff summary
 */
export function generateCopyDiff(current: AdCopy, proposed: AdCopy): string[] {
  const diffs: string[] = [];

  // Compare headlines
  if (JSON.stringify(current.headlines) !== JSON.stringify(proposed.headlines)) {
    diffs.push(`Headlines: ${current.headlines.length} → ${proposed.headlines.length}`);
    
    const added = proposed.headlines.filter(h => !current.headlines.includes(h));
    const removed = current.headlines.filter(h => !proposed.headlines.includes(h));
    
    if (added.length > 0) {
      diffs.push(`  Added: ${added.join(", ")}`);
    }
    if (removed.length > 0) {
      diffs.push(`  Removed: ${removed.join(", ")}`);
    }
  }

  // Compare descriptions
  if (JSON.stringify(current.descriptions) !== JSON.stringify(proposed.descriptions)) {
    diffs.push(`Descriptions: ${current.descriptions.length} → ${proposed.descriptions.length}`);
    
    const added = proposed.descriptions.filter(d => !current.descriptions.includes(d));
    const removed = current.descriptions.filter(d => !proposed.descriptions.includes(d));
    
    if (added.length > 0) {
      diffs.push(`  Added: ${added.join(", ")}`);
    }
    if (removed.length > 0) {
      diffs.push(`  Removed: ${removed.join(", ")}`);
    }
  }

  // Compare final URL
  if (current.finalUrl !== proposed.finalUrl) {
    diffs.push(`Final URL: ${current.finalUrl} → ${proposed.finalUrl}`);
  }

  // Compare display paths
  if (current.displayPath1 !== proposed.displayPath1) {
    diffs.push(`Display Path 1: ${current.displayPath1 || "(none)"} → ${proposed.displayPath1 || "(none)"}`);
  }
  if (current.displayPath2 !== proposed.displayPath2) {
    diffs.push(`Display Path 2: ${current.displayPath2 || "(none)"} → ${proposed.displayPath2 || "(none)"}`);
  }

  return diffs;
}

/**
 * Get approval statistics
 *
 * @returns Statistics about approvals
 */
export function getApprovalStats(): {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  applied: number;
  approvalRate: number;
} {
  const allApprovals = Array.from(approvals.values());
  const pending = allApprovals.filter(a => a.status === "pending").length;
  const approved = allApprovals.filter(a => a.status === "approved").length;
  const rejected = allApprovals.filter(a => a.status === "rejected").length;
  const applied = allApprovals.filter(a => a.status === "applied").length;
  
  const processed = approved + rejected;
  const approvalRate = processed > 0 ? (approved / processed) * 100 : 0;

  return {
    total: allApprovals.length,
    pending,
    approved,
    rejected,
    applied,
    approvalRate: parseFloat(approvalRate.toFixed(2)),
  };
}

