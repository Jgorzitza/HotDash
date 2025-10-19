/**
 * Campaign Budget Update API Route
 *
 * Update campaign budget (requires HITL approval)
 *
 * @route POST /api/ads/campaigns/:id/budget
 */

import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getCampaignById } from "~/services/ads/campaign.service";
import { createBudgetChangeApprovalRequest } from "~/lib/ads";
import { AdsFeatureFlags } from "~/config/ads.server";

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    const { id } = params;

    if (!id) {
      return json(
        {
          success: false,
          error: {
            code: "MISSING_CAMPAIGN_ID",
            message: "Campaign ID is required",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { newBudget, justification } = body;

    if (newBudget === undefined || newBudget < 0) {
      return json(
        {
          success: false,
          error: {
            code: "INVALID_BUDGET",
            message: "Valid budget amount is required",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    if (!justification) {
      return json(
        {
          success: false,
          error: {
            code: "MISSING_JUSTIFICATION",
            message: "Budget change justification is required",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    // Fetch campaign
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return json(
        {
          success: false,
          error: {
            code: "CAMPAIGN_NOT_FOUND",
            message: `Campaign ${id} not found`,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 },
      );
    }

    // Check if HITL approvals are enabled
    if (!AdsFeatureFlags.approvalsEnabled) {
      return json(
        {
          success: false,
          error: {
            code: "APPROVALS_DISABLED",
            message: "Campaign approvals are not enabled",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 },
      );
    }

    // Generate approval request
    const approvalRequest = createBudgetChangeApprovalRequest(
      id,
      campaign.dailyBudget,
      newBudget,
      justification,
    );

    // Return approval request for HITL review
    return json({
      success: true,
      data: {
        approvalRequest,
        currentBudget: campaign.dailyBudget,
        newBudget,
        percentChange: (
          ((newBudget - campaign.dailyBudget) / campaign.dailyBudget) *
          100
        ).toFixed(1),
        message: "Budget change request created - awaiting approval",
      },
    });
  } catch (error) {
    console.error("Error creating budget change request:", error);
    return json(
      {
        success: false,
        error: {
          code: "BUDGET_CHANGE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to create budget change request",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
