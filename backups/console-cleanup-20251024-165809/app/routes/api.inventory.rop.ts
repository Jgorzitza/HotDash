/**
 * API Route: ROP Calculation Engine
 *
 * GET /api/inventory/rop
 * POST /api/inventory/rop/calculate
 * GET /api/inventory/rop/suggestions
 * PUT /api/inventory/rop/suggestions/:id/status
 *
 * ROP calculation engine with:
 * - Daily velocity calculation from order history
 * - Lead time demand = velocity × vendor days
 * - Safety stock = Z-score × demand variance
 * - ROP suggestions stored in reorder_suggestions table
 * - Seasonal trends and promotional uplift handling
 * - Vendor + qty + ETA + cost impact recommendations
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-100: ROP Calculation Engine
 */

import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { 
  calculateROPEngine, 
  batchCalculateROP, 
  getROPSuggestions,
  updateROPSuggestionStatus,
  type ROPEngineParams 
} from "~/services/inventory/rop-engine";

// GET /api/inventory/rop - Get ROP suggestions for products
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const productIds = url.searchParams.get('productIds')?.split(',') || [];
    const shopDomain = url.searchParams.get('shopDomain') || 'hotrodan.myshopify.com';
    const status = url.searchParams.get('status') as 'pending' | 'approved' | 'rejected' | 'ordered' | 'cancelled' | undefined;

    if (productIds.length === 0) {
      return Response.json(
        {
          success: false,
          error: "productIds parameter is required",
        },
        { status: 400 }
      );
    }

    // Get ROP suggestions for products
    const suggestions = await Promise.all(
      productIds.map(async (productId) => {
        const productSuggestions = await getROPSuggestions(productId, shopDomain, status);
        return {
          productId,
          suggestions: productSuggestions
        };
      })
    );

    return Response.json({
      success: true,
      data: {
        suggestions,
        metadata: {
          productCount: productIds.length,
          shopDomain,
          status: status || 'all',
          calculationDate: new Date().toISOString()
        }
      }
    });
  } catch (error: any) {
    console.error("[API] ROP suggestions error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to fetch ROP suggestions",
      },
      { status: 500 },
    );
  }
}

// POST /api/inventory/rop/calculate - Calculate ROP for products
export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { 
      productIds, 
      shopDomain = 'hotrodan.myshopify.com',
      calculationMethod = 'standard',
      promotionalUplift = 0,
      seasonalAdjustment = 0,
      historicalDays = 30
    } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return Response.json(
        {
          success: false,
          error: "productIds array is required",
        },
        { status: 400 }
      );
    }

    // Calculate ROP for all products
    const results = await batchCalculateROP(
      productIds,
      shopDomain,
      calculationMethod
    );

    return Response.json({
      success: true,
      data: {
        results,
        metadata: {
          productCount: productIds.length,
          calculationMethod,
          promotionalUplift,
          seasonalAdjustment,
          historicalDays,
          calculationDate: new Date().toISOString()
        }
      }
    });
  } catch (error: any) {
    console.error("[API] ROP calculation error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to calculate ROP",
      },
      { status: 500 },
    );
  }
}
