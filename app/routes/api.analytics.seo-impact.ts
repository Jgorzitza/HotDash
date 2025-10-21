/**
 * SEO Impact Analysis API Route
 * 
 * GET /api/analytics/seo-impact
 * Query params:
 * - project: Shop domain (default: "occ")
 * - days: Number of days to analyze (default: 30)
 * - keyword: Get history for specific keyword (optional)
 * - action: "summary" | "correlation" | "history" (default: "summary")
 */

import type { LoaderFunctionArgs } from "react-router";
import {
  getSEOImpactAnalysis,
  correlateSEOWithContent,
  getKeywordHistory,
  trackKeywordRanking,
} from "~/services/analytics/seo-impact";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const project = url.searchParams.get("project") || "occ";
  const days = Number(url.searchParams.get("days")) || 30;
  const keyword = url.searchParams.get("keyword");
  const action = url.searchParams.get("action") || "summary";

  try {
    // Get keyword history
    if (action === "history" && keyword) {
      const history = await getKeywordHistory(keyword, project, days);
      return Response.json({
        success: true,
        data: history,
        meta: { keyword, project, days },
      });
    }

    // Get correlation analysis
    if (action === "correlation") {
      const correlation = await correlateSEOWithContent(project, days);
      return Response.json({
        success: true,
        data: correlation,
        meta: { project, days },
      });
    }

    // Default: Get summary
    const summary = await getSEOImpactAnalysis(project, days);
    return Response.json({
      success: true,
      data: summary,
      meta: { project, days },
    });
  } catch (error) {
    console.error("SEO impact API error:", error);
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
 * POST endpoint to track a new keyword ranking
 * Body: { keyword, position, url, searchVolume? }
 */
export async function action({ request }: { request: Request }) {
  const url = new URL(request.url);
  const project = url.searchParams.get("project") || "occ";

  try {
    const body = await request.json();
    const { keyword, position, url: pageUrl, searchVolume } = body;

    if (!keyword || position === undefined || !pageUrl) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields: keyword, position, url",
        },
        { status: 400 }
      );
    }

    const result = await trackKeywordRanking(
      keyword,
      position,
      pageUrl,
      project,
      searchVolume
    );

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("SEO tracking API error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

