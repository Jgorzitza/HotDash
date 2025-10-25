/**
 * API Route: Bing Webmaster Tools Metrics
 *
 * GET /api/bing/metrics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&siteId=xxx
 *
 * Retrieves search performance metrics from Bing Webmaster Tools
 */

import type { LoaderFunctionArgs } from "react-router";
import { createBingIntegration } from "~/services/bing/integration";

export interface BingMetricsResponse {
  success: boolean;
  metrics?: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    queries: Array<{
      query: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
  }>;
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const siteId = url.searchParams.get("siteId");

    if (!startDate || !endDate) {
      return Response.json(
        { success: false, error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return Response.json(
        { success: false, error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Validate date range (max 90 days)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 90) {
      return Response.json(
        { success: false, error: "Date range cannot exceed 90 days" },
        { status: 400 }
      );
    }

    if (start > end) {
      return Response.json(
        { success: false, error: "startDate must be before endDate" },
        { status: 400 }
      );
    }

    const integration = createBingIntegration({
      domain: "hotrodan.com", // Default domain
      sitemapUrl: "https://hotrodan.com/sitemap.xml",
      siteId: siteId || undefined,
    });

    const result = await integration.getSearchMetrics(startDate, endDate);

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error || "Failed to get metrics" },
        { status: 502 }
      );
    }

    const response: BingMetricsResponse = {
      success: true,
      metrics: result.metrics,
    };

    return Response.json(response);
  } catch (error) {
    console.error("[Bing Metrics] Error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function action() {
  return Response.json(
    { error: "Method not allowed. Use GET to retrieve metrics." },
    { status: 405 }
  );
}
