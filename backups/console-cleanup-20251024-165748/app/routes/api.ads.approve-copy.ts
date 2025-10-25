/**
 * Ad Copy Approval API Route
 *
 * Handles HITL workflow for ad copy changes.
 * Supports creating approval requests, approving/rejecting, and applying changes.
 *
 * @module app/routes/api.ads.approve-copy
 */

import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import {
  createApprovalRequest,
  getApproval,
  getPendingApprovals,
  getCampaignApprovals,
  approveAdCopy,
  rejectAdCopy,
  markAsApplied,
  validateAdCopy,
  generateCopyDiff,
  getApprovalStats,
} from "../services/ads/copy-approval";
import type { AdCopyApprovalRequest } from "../services/ads/types";

/**
 * GET /api/ads/approve-copy
 *
 * Query parameters:
 * - id: Specific approval ID (optional)
 * - campaignId: Filter by campaign ID (optional)
 * - status: Filter by status (optional)
 *
 * @param request - Fetch request object
 * @returns JSON response with approval data
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const campaignId = url.searchParams.get("campaignId");
    const statusFilter = url.searchParams.get("status");

    // Get specific approval by ID
    if (id) {
      const approval = getApproval(id);
      if (!approval) {
        return Response.json(
          {
            error: "Approval not found",
            code: "NOT_FOUND",
          },
          { status: 404 },
        );
      }
      return Response.json({ approval });
    }

    // Get approvals by campaign
    if (campaignId) {
      const approvals = getCampaignApprovals(campaignId);
      const stats = getApprovalStats();
      return Response.json({
        approvals,
        stats,
      });
    }

    // Get all pending approvals by default
    if (!statusFilter || statusFilter === "pending") {
      const approvals = getPendingApprovals();
      const stats = getApprovalStats();
      return Response.json({
        approvals,
        stats,
      });
    }

    // If no specific query, return summary
    const approvals = getPendingApprovals();
    const stats = getApprovalStats();

    return Response.json({
      approvals,
      stats,
    });
  } catch (error) {
    console.error("Error fetching ad copy approvals:", error);
    return Response.json(
      {
        error: "Failed to fetch approvals",
        code: "FETCH_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/ads/approve-copy
 *
 * Actions:
 * - create: Create new approval request
 * - approve: Approve a pending request
 * - reject: Reject a pending request
 * - apply: Mark an approved request as applied
 *
 * @param request - Fetch request object
 * @returns JSON response with updated approval
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const action = formData.get("action")?.toString();

    if (!action) {
      return Response.json(
        {
          error: "Action is required",
          code: "MISSING_ACTION",
        },
        { status: 400 },
      );
    }

    switch (action) {
      case "create": {
        // Parse approval request data
        const requestData = formData.get("requestData")?.toString();
        if (!requestData) {
          return Response.json(
            {
              error: "Request data is required",
              code: "MISSING_DATA",
            },
            { status: 400 },
          );
        }

        const approvalRequest: AdCopyApprovalRequest = JSON.parse(requestData);

        // Validate proposed ad copy
        const validationErrors = validateAdCopy(approvalRequest.proposedCopy);
        if (validationErrors.length > 0) {
          return Response.json(
            {
              error: "Ad copy validation failed",
              code: "VALIDATION_ERROR",
              details: validationErrors,
            },
            { status: 400 },
          );
        }

        // Generate diff for review
        const diff = generateCopyDiff(
          approvalRequest.currentCopy,
          approvalRequest.proposedCopy,
        );

        // Create approval request
        const approval = createApprovalRequest(approvalRequest);

        return Response.json(
          {
            approval,
            diff,
            message: "Approval request created successfully",
          },
          { status: 201 },
        );
      }

      case "approve": {
        const id = formData.get("id")?.toString();
        const reviewedBy = formData.get("reviewedBy")?.toString();
        const reviewNotes = formData.get("reviewNotes")?.toString();

        if (!id || !reviewedBy) {
          return Response.json(
            {
              error: "Approval ID and reviewer are required",
              code: "MISSING_PARAMS",
            },
            { status: 400 },
          );
        }

        const approval = approveAdCopy(id, reviewedBy, reviewNotes);

        return Response.json({
          approval,
          message: "Ad copy approved successfully",
        });
      }

      case "reject": {
        const id = formData.get("id")?.toString();
        const reviewedBy = formData.get("reviewedBy")?.toString();
        const reviewNotes = formData.get("reviewNotes")?.toString();

        if (!id || !reviewedBy || !reviewNotes) {
          return Response.json(
            {
              error: "Approval ID, reviewer, and rejection reason are required",
              code: "MISSING_PARAMS",
            },
            { status: 400 },
          );
        }

        const approval = rejectAdCopy(id, reviewedBy, reviewNotes);

        return Response.json({
          approval,
          message: "Ad copy rejected",
        });
      }

      case "apply": {
        const id = formData.get("id")?.toString();

        if (!id) {
          return Response.json(
            {
              error: "Approval ID is required",
              code: "MISSING_PARAMS",
            },
            { status: 400 },
          );
        }

        const approval = markAsApplied(id);

        return Response.json({
          approval,
          message: "Ad copy changes applied to Google Ads",
        });
      }

      default: {
        return Response.json(
          {
            error: `Unknown action: ${action}`,
            code: "UNKNOWN_ACTION",
          },
          { status: 400 },
        );
      }
    }
  } catch (error) {
    console.error("Error processing ad copy approval:", error);

    // Check for specific error types
    if (error instanceof Error && error.message.includes("not found")) {
      return Response.json(
        {
          error: "Approval not found",
          code: "NOT_FOUND",
          details: error.message,
        },
        { status: 404 },
      );
    }

    if (error instanceof Error && error.message.includes("already processed")) {
      return Response.json(
        {
          error: "Approval already processed",
          code: "ALREADY_PROCESSED",
          details: error.message,
        },
        { status: 409 },
      );
    }

    return Response.json(
      {
        error: "Failed to process approval",
        code: "ACTION_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
