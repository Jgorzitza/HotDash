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
export async function loader({ request }: LoaderFunctionArgs) {
  const { shopDomain } = await requireShopifyAuth(request);

  try {
    const result = await getSalesTrend7d(shopDomain);

    return json({
      success: true,
      data: result.data,
      source: result.source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Sales trend error:', error);
    
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
