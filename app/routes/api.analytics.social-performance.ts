/**
 * Social Performance Analytics API Route
 * 
 * GET /api/analytics/social-performance
 * Query params:
 * - project: Shop domain (default: "occ")
 * - platform: Filter by platform (optional)
 * - days: Number of days to aggregate (default: 30)
 * - postId: Get specific post metrics (optional)
 */

import type { LoaderFunctionArgs } from "react-router";
import {
  getSocialPerformanceSummary,
  trackSocialPostPerformance,
} from "~/services/analytics/social-performance";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const project = url.searchParams.get("project") || "occ";
  const platform = url.searchParams.get("platform") || undefined;
  const days = Number(url.searchParams.get("days")) || 30;
  const postId = url.searchParams.get("postId");

  try {
    // If postId is provided, return specific post metrics
    if (postId) {
      const postMetrics = await trackSocialPostPerformance(postId, project);
      return Response.json({
        success: true,
        data: postMetrics,
      });
    }

    // Otherwise return aggregated summary
    const summary = await getSocialPerformanceSummary(project, platform, days);
    return Response.json({
      success: true,
      data: summary,
      meta: {
        project,
        platform: platform || "all",
        days,
      },
    });
  } catch (error) {
    console.error("Social performance API error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

