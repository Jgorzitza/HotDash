/**
 * Ads Daily Metrics API Route
 *
 * Query daily advertising metrics for campaigns
 *
 * @route GET /api/ads/metrics/daily
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  fetchMetaCampaigns,
  fetchGoogleCampaigns,
  calculateCampaignImpact,
  calculateAggregateImpact,
  type CampaignDailySnapshot,
  AdPlatform,
} from "~/lib/ads";

/**
 * Daily metrics loader
 *
 * Query parameters:
 * - date: Target date (YYYY-MM-DD, defaults to today)
 * - platform: Filter by platform (meta, google)
 * - campaignId: Specific campaign ID
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const date =
      url.searchParams.get("date") || new Date().toISOString().split("T")[0];
    const platform = url.searchParams.get("platform") as AdPlatform | undefined;
    const campaignId = url.searchParams.get("campaignId") || undefined;

    // Fetch campaigns from platforms (stub mode)
    const [metaCampaigns, googleCampaigns] = await Promise.all([
      fetchMetaCampaigns(),
      fetchGoogleCampaigns(),
    ]);

    let allCampaigns = [...metaCampaigns, ...googleCampaigns];

    // Apply filters
    if (platform) {
      allCampaigns = allCampaigns.filter((c) => c.platform === platform);
    }

    if (campaignId) {
      allCampaigns = allCampaigns.filter((c) => c.id === campaignId);
    }

    // Calculate daily snapshots
    const snapshots: CampaignDailySnapshot[] = allCampaigns.map((campaign) =>
      calculateCampaignImpact(campaign, date),
    );

    // Calculate aggregate metrics
    const aggregate = calculateAggregateImpact(allCampaigns, date);

    return json({
      success: true,
      data: {
        date,
        snapshots,
        aggregate: {
          totalSpend: aggregate.totalSpend,
          totalRevenue: aggregate.totalRevenue,
          averageROAS: aggregate.averageROAS,
          averageCPC: aggregate.averageCPC,
          totalClicks: aggregate.totalClicks,
          totalImpressions: aggregate.totalImpressions,
          totalConversions: aggregate.totalConversions,
          campaignCount: aggregate.campaignCount,
        },
        filters: {
          date,
          platform,
          campaignId,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching daily metrics:", error);
    return json(
      {
        success: false,
        error: {
          code: "DAILY_METRICS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch daily metrics",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
