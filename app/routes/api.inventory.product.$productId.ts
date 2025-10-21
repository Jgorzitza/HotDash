/**
 * API Route: Inventory Product Data
 *
 * GET /api/inventory/product/:productId
 *
 * Returns comprehensive inventory data for a specific product including:
 * - Current stock levels
 * - Reorder point (ROP) with seasonal adjustments
 * - Safety stock
 * - Seasonal factors
 * - 30-day demand forecast
 * - Vendor information
 * - Purchase order status
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-006: Inventory Modal Backend Integration
 */

import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { calculateReorderPoint } from "~/services/inventory/rop";
import { getDemandForecast } from "~/services/inventory/demand-forecast";
import { getVendorInfo } from "~/services/inventory/vendor-management";
import { getPOTracking } from "~/services/inventory/po-tracking";

export async function loader({ params }: LoaderFunctionArgs) {
  const { productId } = params;

  if (!productId) {
    return json(
      {
        success: false,
        error: "Product ID is required",
      },
      { status: 400 }
    );
  }

  try {
    // Mock Shopify data (will be replaced with real Shopify API call)
    // In production: const product = await getProduct(context, productId);
    const mockShopifyStock = 42;
    const mockAvgDailySales = 3.5;
    const mockLeadTimeDays = 7;
    const mockMaxDailySales = 8;
    const mockMaxLeadDays = 14;
    const mockCategory = "general" as const;

    // Calculate reorder point with seasonal adjustments (INVENTORY-001)
    const ropResult = calculateReorderPoint({
      avgDailySales: mockAvgDailySales,
      leadTimeDays: mockLeadTimeDays,
      maxDailySales: mockMaxDailySales,
      maxLeadDays: mockMaxLeadDays,
      category: mockCategory,
      currentMonth: new Date().getMonth() + 1,
    });

    // Get 30-day demand forecast (INVENTORY-002)
    const forecast = await getDemandForecast(productId, {
      avgDailySales: mockAvgDailySales,
      category: mockCategory,
    });

    // Get vendor information (INVENTORY-003)
    const vendor = await getVendorInfo(productId);

    // Get purchase order tracking (INVENTORY-004)
    const purchaseOrders = await getPOTracking(productId);

    return json({
      success: true,
      data: {
        productId,
        currentStock: mockShopifyStock,
        reorderPoint: ropResult.reorderPoint,
        safetyStock: ropResult.safetyStock,
        seasonalFactor: ropResult.seasonalityFactor || 1.0,
        adjustedDailySales: ropResult.adjustedDailySales,
        forecast30d: forecast,
        vendor,
        purchaseOrders,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error(
      `[API] Inventory product data error for ${productId}:`,
      error
    );

    return json(
      {
        success: false,
        error: error.message || "Failed to fetch inventory product data",
        productId,
      },
      { status: 500 }
    );
  }
}

