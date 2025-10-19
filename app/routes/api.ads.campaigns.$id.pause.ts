/**
 * Campaign Pause API Route
 *
 * Pause a campaign (requires HITL approval)
 *
 * @route POST /api/ads/campaigns/:id/pause
 */

import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getCampaignById } from "~/services/ads/campaign.service";
import { createPauseApprovalRequest } from "~/lib/ads";
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
    const { reason } = body;

    if (!reason) {
      return json(
        {
          success: false,
          error: {
            code: "MISSING_REASON",
            message: "Pause reason is required",
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
    const approvalRequest = createPauseApprovalRequest(campaign, reason);

    // Return approval request for HITL review
    return json({
      success: true,
      data: {
        approvalRequest,
        message: "Pause request created - awaiting approval",
      },
    });
  } catch (error) {
    console.error("Error creating pause request:", error);
    return json(
      {
        success: false,
        error: {
          code: "PAUSE_REQUEST_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to create pause request",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
