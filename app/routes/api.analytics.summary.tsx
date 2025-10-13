import type { LoaderFunctionArgs } from "react-router";
import { json } from "react-router";
import { getCurrentDashboardMetrics } from "~/services/analytics.server";
import { requireShopifyAuth } from "~/services/auth.server";

/**
 * API Route: /api/analytics/summary
 * 
 * Returns current dashboard analytics summary including:
 * - Sales metrics (24h)
 * - Fulfillment issues
 * - Inventory alerts
 * - CX escalations
 * - GA anomalies
 * - Operator metrics
 * - Activation metrics
 * 
 * Cached for 5 minutes for performance.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { shopDomain } = await requireShopifyAuth(request);

  try {
    const result = await getCurrentDashboardMetrics(shopDomain);

    return Response.json({
      success: true,
      data: result.data,
      source: result.source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Analytics summary error:', error);
    
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
