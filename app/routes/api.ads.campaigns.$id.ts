/**
 * Campaign Detail API Route
 *
 * Get details for a specific campaign
 *
 * @route GET /api/ads/campaigns/:id
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getCampaignById } from "~/services/ads/campaign.service";

export async function loader({ params }: LoaderFunctionArgs) {
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

    return json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return json(
      {
        success: false,
        error: {
          code: "CAMPAIGN_FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch campaign",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
