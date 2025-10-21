/**
 * Ad Performance API Route
 *
 * Returns campaign performance data, week-over-week comparisons,
 * best/worst performing campaigns, and budget alerts.
 *
 * @module app/routes/api.ads.performance
 */

import { type LoaderFunctionArgs } from "react-router";
import { createGoogleAdsClient } from "../services/ads/google-ads-client";
import { aggregatePerformanceData, calculateWoWComparison, identifyBestAndWorst } from "../services/ads/performance-metrics";
import { generateAllAlerts } from "../services/ads/budget-alerts";
import type { PerformanceSummary } from "../services/ads/types";

/**
 * GET /api/ads/performance
 *
 * Query parameters:
 * - dateRange: "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH" (default: "LAST_7_DAYS")
 * - includeComparison: "true" | "false" (default: "false")
 *
 * @param request - Fetch request object
 * @returns JSON response with performance data and alerts
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const dateRange = url.searchParams.get("dateRange") || "LAST_7_DAYS";
    const includeComparison = url.searchParams.get("includeComparison") === "true";

    // Create Google Ads client
    const adsClient = createGoogleAdsClient();

    // Authenticate
    await adsClient.authenticate();

    // Get customer IDs from config
    const customerIds = process.env.GOOGLE_ADS_CUSTOMER_IDS?.split(",").filter(Boolean) || [];

    if (customerIds.length === 0) {
      return Response.json(
        {
          error: "No Google Ads customer IDs configured",
          code: "MISSING_CUSTOMER_IDS",
        },
        { status: 400 }
      );
    }

    // Fetch campaigns and performance data
    const [campaigns, currentPerformances] = await Promise.all([
      adsClient.getCampaigns(customerIds),
      adsClient.getCampaignPerformance(customerIds, dateRange),
    ]);

    // Generate alerts
    const alerts = generateAllAlerts(campaigns, currentPerformances);

    // Aggregate performance data
    const performanceData: PerformanceSummary = aggregatePerformanceData(
      currentPerformances,
      alerts,
      dateRange
    );

    // Add best/worst performers
    const { best, worst } = identifyBestAndWorst(performanceData.campaigns, "roas", 3);

    // Prepare response
    const response: any = {
      ...performanceData,
      bestPerformers: best,
      worstPerformers: worst,
    };

    // Include week-over-week comparison if requested
    if (includeComparison && dateRange === "LAST_7_DAYS") {
      try {
        const previousPerformances = await adsClient.getCampaignPerformance(
          customerIds,
          "PREVIOUS_7_DAYS"
        );
        const comparison = calculateWoWComparison(currentPerformances, previousPerformances);
        response.weekOverWeek = comparison;
      } catch (error) {
        console.error("Error calculating WoW comparison:", error);
        // Continue without comparison data
      }
    }

    return Response.json(response, {
      headers: {
        "Cache-Control": "private, max-age=300", // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error("Error fetching ad performance:", error);

    // Check for authentication errors
    if (error instanceof Error && error.message.includes("authenticate")) {
      return Response.json(
        {
          error: "Google Ads authentication failed",
          code: "AUTH_ERROR",
          details: error.message,
        },
        { status: 401 }
      );
    }

    // Check for missing credentials
    if (error instanceof Error && error.message.includes("credentials")) {
      return Response.json(
        {
          error: "Google Ads API credentials not configured",
          code: "MISSING_CREDENTIALS",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Generic error
    return Response.json(
      {
        error: "Failed to fetch ad performance data",
        code: "FETCH_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

