/**
 * Ads Alerts API
 *
 * Campaign performance alerts and thresholds
 *
 * @route GET /api/ads/alerts
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { listCampaigns } from "~/services/ads/campaign.service";
import {
  checkCampaignAlerts,
  getCriticalAlerts,
} from "~/services/ads/alerts.service";
import { trackAPIRequest, createTimer } from "~/lib/ads/monitoring";

export async function loader({ request }: LoaderFunctionArgs) {
  const timer = createTimer();

  try {
    const url = new URL(request.url);
    const criticalOnly = url.searchParams.get("critical") === "true";

    // Get all campaigns
    const { campaigns } = await listCampaigns();

    // Check for alerts
    const alerts = criticalOnly
      ? getCriticalAlerts(campaigns)
      : checkCampaignAlerts(campaigns);

    const response = json({
      success: true,
      data: {
        alerts,
        totalCount: alerts.length,
        criticalCount: alerts.filter((a) => a.severity === "critical").length,
        warningCount: alerts.filter((a) => a.severity === "warning").length,
        checkedAt: new Date().toISOString(),
      },
    });

    trackAPIRequest("/api/ads/alerts", "GET", timer.stop(), 200);
    return response;
  } catch (error) {
    console.error("Error checking alerts:", error);
    trackAPIRequest("/api/ads/alerts", "GET", timer.stop(), 500);

    return json(
      {
        success: false,
        error: {
          code: "ALERTS_CHECK_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to check alerts",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
