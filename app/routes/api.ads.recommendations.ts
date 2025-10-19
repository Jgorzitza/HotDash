/**
 * Ads Recommendations API
 *
 * AI-powered campaign optimization suggestions
 *
 * @route GET /api/ads/recommendations
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { listCampaigns } from "~/services/ads/campaign.service";
import { generateRecommendations } from "~/lib/ads/recommendations";
import { trackAPIRequest, createTimer } from "~/lib/ads/monitoring";

export async function loader({ request }: LoaderFunctionArgs) {
  const timer = createTimer();

  try {
    const url = new URL(request.url);
    const priority = url.searchParams.get("priority") as
      | "high"
      | "medium"
      | "low"
      | null;

    // Get all campaigns
    const { campaigns } = await listCampaigns();

    // Generate recommendations
    let recommendations = generateRecommendations(campaigns);

    // Filter by priority if specified
    if (priority) {
      recommendations = recommendations.filter((r) => r.priority === priority);
    }

    const response = json({
      success: true,
      data: {
        recommendations,
        totalCount: recommendations.length,
        generatedAt: new Date().toISOString(),
      },
    });

    trackAPIRequest("/api/ads/recommendations", "GET", timer.stop(), 200);
    return response;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    trackAPIRequest("/api/ads/recommendations", "GET", timer.stop(), 500);

    return json(
      {
        success: false,
        error: {
          code: "RECOMMENDATIONS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate recommendations",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
