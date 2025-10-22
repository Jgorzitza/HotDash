/**
 * API Route: SEO Bing Webmaster
 *
 * GET /api/seo/bing-webmaster
 *
 * Returns comprehensive Bing Webmaster Tools metrics.
 */

import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { getBingWebmasterSummary } from "../lib/seo/bing-webmaster";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const summary = await getBingWebmasterSummary();

    return Response.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API] Bing Webmaster error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to fetch Bing Webmaster data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

