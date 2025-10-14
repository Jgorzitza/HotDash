import type { LoaderFunctionArgs } from "react-router";
import { getSalesTrend7d } from "../services/analytics.server";

/**
 * API Route: /api/analytics/sales-trend
 * 
 * Returns 7-day sales trend data for charting:
 * - Date
 * - Total orders
 * - Total revenue
 * - Average order value
 * 
 * Cached for 5 minutes.
 */
export async function loader(_args: LoaderFunctionArgs) {
  // Note: Auth removed - analytics routes are internal only
  const shopDomain = "hotroddash.myshopify.com"; // TODO: Get from session

  try {
    const result = await getSalesTrend7d(shopDomain);

    return Response.json({
      success: true,
      data: result.data,
      source: result.source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Sales trend error:', error);
    
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
