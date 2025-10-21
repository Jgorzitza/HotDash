/**
 * API Route: Enhanced SEO Dashboard
 *
 * GET /api/seo/enhanced
 *
 * Returns comprehensive SEO metrics from multiple sources:
 * - Google Analytics (traffic and organic sessions)
 * - Google Search Console (organic search performance)
 * - Bing Webmaster Tools (Bing search performance)
 *
 * Provides graceful degradation if any source is unavailable.
 */

import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { getEnhancedSEOData } from "../lib/seo/enhanced-seo";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const data = await getEnhancedSEOData();

    return json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("[API] Enhanced SEO error:", error);

    return json(
      {
        success: false,
        error: error.message || "Failed to fetch enhanced SEO data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

