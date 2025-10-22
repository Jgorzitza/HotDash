/**
 * API Route: Growth Engine Inventory Optimization
 *
 * GET /api/inventory/growth-engine-optimization
 *
 * Returns comprehensive inventory optimization for Growth Engine phases 9-12:
 * - Advanced ROP calculations with seasonal adjustments
 * - Emergency sourcing recommendations with opportunity-cost logic
 * - Virtual bundle stock optimization
 * - Vendor performance analysis
 * - Performance metrics and cost savings
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-104: Growth Engine Inventory Optimization
 */

import { type LoaderFunctionArgs } from "react-router";
import { getGrowthEngineInventoryOptimization } from "~/services/inventory/growth-engine-optimization";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get product IDs from query parameters or use defaults
    const url = new URL(request.url);
    const productIdsParam = url.searchParams.get('productIds');
    const productIds = productIdsParam 
      ? productIdsParam.split(',')
      : ['prod_001', 'prod_002', 'prod_003']; // Default products for demo

    // Get comprehensive growth engine optimization
    const optimization = await getGrowthEngineInventoryOptimization(productIds);

    return Response.json({
      success: true,
      data: optimization,
      metadata: {
        productCount: productIds.length,
        optimizationDate: new Date().toISOString(),
        version: '1.0.0',
        features: [
          'Advanced ROP calculations',
          'Emergency sourcing logic',
          'Virtual bundle stock optimization',
          'Vendor performance analysis',
          'Performance metrics'
        ]
      }
    });
  } catch (error: any) {
    console.error("[API] Growth Engine optimization error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to fetch growth engine optimization",
      },
      { status: 500 },
    );
  }
}
