/**
 * API Route: Keyword Cannibalization Detection
 *
 * GET /api/seo/cannibalization
 *
 * Returns keyword cannibalization analysis:
 * - Keywords with multiple pages competing
 * - Severity scoring
 * - Consolidation recommendations
 * - Estimated traffic impact
 *
 * @module routes/api/seo/cannibalization
 */

import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import {
  detectKeywordCannibalization,
  getKeywordCannibalizationDetails,
} from "../services/seo/cannibalization";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const shopDomain =
      url.searchParams.get("shop") || "default-shop.myshopify.com";
    const keyword = url.searchParams.get("keyword");

    // If keyword specified, return details for that keyword
    if (keyword) {
      const details = await getKeywordCannibalizationDetails(
        shopDomain,
        keyword,
      );

      if (!details) {
        return Response.json(
          {
            success: false,
            error: `No cannibalization detected for keyword: ${keyword}`,
            timestamp: new Date().toISOString(),
          },
          { status: 404 },
        );
      }

      return Response.json({
        success: true,
        data: details,
        timestamp: new Date().toISOString(),
      });
    }

    // Otherwise return full report
    const report = await detectKeywordCannibalization(shopDomain);

    return Response.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API] Cannibalization detection error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to detect keyword cannibalization",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
