/**
 * SEO Recommendations API Route
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { normalizeVitals } from "~/lib/seo/vitals";
import { generatePerformanceRecommendations } from "~/lib/seo/recommendations";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    const pageUrl = url.searchParams.get("url") || "/";

    if (!shop) {
      return json(
        { success: false, error: "Missing required parameter: shop" },
        { status: 400 },
      );
    }

    // Mock vitals - in production, fetch from GA4
    const vitals = normalizeVitals(
      { LCP: 4500, FID: 150, CLS: 0.05 },
      "mobile",
    );

    const recommendations = generatePerformanceRecommendations(vitals, pageUrl);

    return json({
      success: true,
      data: {
        recommendations,
        summary: {
          total: recommendations.length,
          critical: recommendations.filter((r) => r.priority === "critical")
            .length,
          high: recommendations.filter((r) => r.priority === "high").length,
        },
      },
      metadata: {
        shopDomain: shop,
        url: pageUrl,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
