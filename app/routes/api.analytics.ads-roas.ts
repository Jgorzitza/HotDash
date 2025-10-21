/**
 * Ads ROAS Calculator API Route
 * 
 * GET /api/analytics/ads-roas
 * Query params:
 * - project: Shop domain (default: "occ")
 * - platform: Filter by platform (optional)
 * - days: Number of days to analyze (default: 30)
 * - campaignId: Get specific campaign history (optional)
 * - compare: Comma-separated campaign IDs to compare (optional)
 */

import type { LoaderFunctionArgs } from "react-router";
import {
  getROASSummary,
  getCampaignPerformance,
  compareCampaigns,
  calculateCampaignROAS,
} from "~/services/analytics/ads-roas";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const project = url.searchParams.get("project") || "occ";
  const platform = url.searchParams.get("platform") || undefined;
  const days = Number(url.searchParams.get("days")) || 30;
  const campaignId = url.searchParams.get("campaignId");
  const compare = url.searchParams.get("compare");

  try {
    // Compare multiple campaigns
    if (compare) {
      const campaignIds = compare.split(",");
      const comparison = await compareCampaigns(campaignIds, project);
      return Response.json({
        success: true,
        data: comparison,
        meta: { project, campaigns: campaignIds },
      });
    }

    // Get specific campaign history
    if (campaignId) {
      const history = await getCampaignPerformance(campaignId, project, days);
      return Response.json({
        success: true,
        data: history,
        meta: { campaignId, project, days },
      });
    }

    // Get overall summary
    const summary = await getROASSummary(project, platform, days);
    return Response.json({
      success: true,
      data: summary,
      meta: { project, platform: platform || "all", days },
    });
  } catch (error) {
    console.error("Ads ROAS API error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to track campaign performance
 * Body: { campaignId, campaignName, platform, spend, revenue, impressions, clicks, conversions }
 */
export async function action({ request }: { request: Request }) {
  const url = new URL(request.url);
  const project = url.searchParams.get("project") || "occ";

  try {
    const body = await request.json();
    const {
      campaignId,
      campaignName,
      platform,
      spend,
      revenue,
      impressions,
      clicks,
      conversions,
    } = body;

    // Validate required fields
    if (
      !campaignId ||
      !campaignName ||
      !platform ||
      spend === undefined ||
      revenue === undefined
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Missing required fields: campaignId, campaignName, platform, spend, revenue",
        },
        { status: 400 }
      );
    }

    const result = await calculateCampaignROAS(
      campaignId,
      campaignName,
      platform,
      spend,
      revenue,
      impressions || 0,
      clicks || 0,
      conversions || 0,
      project
    );

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Ads ROAS tracking API error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

