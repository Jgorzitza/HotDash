/**
 * API Route: SEO Search Console
 *
 * GET /api/seo/search-console
 *
 * Returns comprehensive Search Console metrics.
 */

import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { getSearchConsoleSummary } from "../lib/seo/search-console";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const summary = await getSearchConsoleSummary();

    return Response.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API] Search Console error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to fetch Search Console data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
