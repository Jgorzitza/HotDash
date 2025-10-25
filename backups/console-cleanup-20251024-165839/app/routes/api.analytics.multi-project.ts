/**
 * Multi-Project Analytics API Route
 *
 * GET /api/analytics/multi-project
 * Query params:
 * - action: "summary" | "compare" | "rankings" | "top" (default: "summary")
 * - days: Number of days to analyze (default: 30)
 * - project1: First project for comparison (required for compare action)
 * - project2: Second project for comparison (required for compare action)
 * - metric: Metric for top performers (impressions|clicks|conversions|revenue|roas)
 * - limit: Number of results for top performers (default: 10)
 *
 * Returns aggregated analytics across all projects
 * Uses Response.json() per React Router 7 pattern
 */

import type { LoaderFunctionArgs } from "react-router";
import {
  getMultiProjectSummary,
  compareProjects,
  getProjectRankings,
  getTopProjectsByMetric,
} from "~/services/analytics/multi-project";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "summary";
  const days = Number(url.searchParams.get("days")) || 30;
  const project1 = url.searchParams.get("project1");
  const project2 = url.searchParams.get("project2");
  const metric = url.searchParams.get("metric") || "roas";
  const limit = Number(url.searchParams.get("limit")) || 10;

  try {
    // Compare two projects
    if (action === "compare") {
      if (!project1 || !project2) {
        return Response.json(
          {
            success: false,
            error:
              "Both project1 and project2 parameters are required for comparison",
          },
          { status: 400 },
        );
      }

      const comparison = await compareProjects(project1, project2, days);
      return Response.json({
        success: true,
        data: comparison,
        meta: { action, days },
      });
    }

    // Get project rankings
    if (action === "rankings") {
      const rankings = await getProjectRankings(days);
      return Response.json({
        success: true,
        data: rankings,
        meta: { action, days },
      });
    }

    // Get top performers by metric
    if (action === "top") {
      const validMetrics = [
        "impressions",
        "clicks",
        "conversions",
        "revenue",
        "roas",
      ];
      if (!validMetrics.includes(metric)) {
        return Response.json(
          {
            success: false,
            error: `Invalid metric. Must be one of: ${validMetrics.join(", ")}`,
          },
          { status: 400 },
        );
      }

      const topProjects = await getTopProjectsByMetric(
        metric as any,
        limit,
        days,
      );
      return Response.json({
        success: true,
        data: topProjects,
        meta: { action, metric, limit, days },
      });
    }

    // Default: Get multi-project summary
    const summary = await getMultiProjectSummary(days);
    return Response.json({
      success: true,
      data: summary,
      meta: { action, days },
    });
  } catch (error) {
    console.error("Multi-project analytics API error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
