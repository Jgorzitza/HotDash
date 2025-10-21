/**
 * Inventory Tile Data Service (INVENTORY-007)
 *
 * Calculates real-time inventory status for dashboard tile display:
 * - Status buckets (inStock, lowStock, outOfStock, urgentReorder)
 * - Top risk products (SKUs approaching stockout)
 * - Days until stockout calculations
 * - Integration with ROP and forecasting services
 *
 * Context7: /microsoft/typescript - async/Promise types
 * Context7: /websites/reactrouter - API patterns
 */

import { calculateReorderPoint, getInventoryStatus } from "./rop";
import { getDemandForecast } from "./demand-forecast";

export interface InventoryTileData {
  statusBuckets: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    urgentReorder: number;
  };
  topRisks: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    rop: number;
    daysUntilStockout: number;
    status: "urgent_reorder" | "low_stock" | "out_of_stock";
  }>;
  lastUpdated: string;
}

/**
 * Get all products (mock data - replace with real Shopify API call)
 *
 * In production: query Shopify API for all products with inventory
 *
 * @returns Promise resolving to array of products
 */
async function getAllProducts(): Promise<
  Array<{
    id: string;
    title: string;
    stock: number;
    avgDailySales: number;
    category?: string;
  }>
> {
  // Mock product data (in production: fetch from Shopify)
  return [
    {
      id: "prod_001",
      title: "Premium Widget Pro",
      stock: 5,
      avgDailySales: 2.5,
      category: "general",
    },
    {
      id: "prod_002",
      title: "Deluxe Gadget Set",
      stock: 0,
      avgDailySales: 1.8,
      category: "general",
    },
    {
      id: "prod_003",
      title: "Standard Tool Kit",
      stock: 45,
      avgDailySales: 3.2,
      category: "general",
    },
    {
      id: "prod_004",
      title: "Ultimate Package",
      stock: 8,
      avgDailySales: 4.1,
      category: "general",
    },
    {
      id: "prod_005",
      title: "Basic Starter Pack",
      stock: 120,
      avgDailySales: 5.5,
      category: "general",
    },
    {
      id: "prod_006",
      title: "Professional Bundle",
      stock: 3,
      avgDailySales: 1.2,
      category: "general",
    },
    {
      id: "prod_007",
      title: "Enterprise Solution",
      stock: 15,
      avgDailySales: 2.8,
      category: "general",
    },
  ];
}

/**
 * Get real-time inventory tile data
 *
 * Calculates status buckets and top risks across all products.
 * Used by Inventory Risk tile on dashboard.
 *
 * INVENTORY-007: Real-Time Inventory Tile Data
 *
 * @returns Promise resolving to inventory tile data
 */
export async function getInventoryTileData(): Promise<InventoryTileData> {
  const allProducts = await getAllProducts();

  const statusBuckets = {
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    urgentReorder: 0,
  };

  const riskProducts: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    rop: number;
    daysUntilStockout: number;
    status: "urgent_reorder" | "low_stock" | "out_of_stock";
  }> = [];

  // Process each product
  for (const product of allProducts) {
    // Calculate ROP with seasonal adjustments (INVENTORY-001)
    const ropResult = calculateReorderPoint({
      avgDailySales: product.avgDailySales,
      leadTimeDays: 7, // Mock lead time
      maxDailySales: product.avgDailySales * 1.5, // Mock max sales (50% above avg)
      maxLeadDays: 14, // Mock max lead days
      category: (product.category as any) || "general",
      currentMonth: new Date().getMonth() + 1,
    });

    // Get demand forecast (INVENTORY-002)
    const forecast = await getDemandForecast(product.id, {
      avgDailySales: product.avgDailySales,
      category: product.category,
    });

    // Determine inventory status
    const status = getInventoryStatus(product.stock, ropResult.reorderPoint);

    // Update status buckets
    if (status === "out_of_stock") {
      statusBuckets.outOfStock++;
    } else if (status === "urgent_reorder") {
      statusBuckets.urgentReorder++;
    } else if (status === "low_stock") {
      statusBuckets.lowStock++;
    } else {
      statusBuckets.inStock++;
    }

    // Calculate days until stockout
    const dailyDemand = forecast.daily_forecast;
    const daysLeft =
      dailyDemand > 0 ? Math.ceil(product.stock / dailyDemand) : 999;

    // Track high-risk products (stockout within 7 days)
    if (daysLeft < 7 && status !== "in_stock") {
      riskProducts.push({
        productId: product.id,
        productName: product.title,
        currentStock: product.stock,
        rop: ropResult.reorderPoint,
        daysUntilStockout: daysLeft,
        status: status as "urgent_reorder" | "low_stock" | "out_of_stock",
      });
    }
  }

  // Sort risk products by days until stockout (most urgent first)
  riskProducts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);

  // Return top 5 risks
  return {
    statusBuckets,
    topRisks: riskProducts.slice(0, 5),
    lastUpdated: new Date().toISOString(),
  };
}

