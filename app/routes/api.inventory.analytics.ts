/**
 * API Route: Inventory Analytics
 *
 * GET /api/inventory/analytics
 *
 * Returns comprehensive inventory analytics including:
 * - Turnover rate and DIO (Days Inventory Outstanding)
 * - Aging analysis (fresh/aging/stale/dead stock)
 * - ABC analysis (Pareto 80/15/5 classification)
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-010: Inventory Analytics Service
 */

import { type LoaderFunctionArgs } from "react-router";
// React Router 7: Use Response.json() from "~/utils/http.server";
import { generateInventoryAnalytics } from "~/services/inventory/analytics";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Mock product data with sales history (in production: fetch from database)
    const mockProducts = [
      {
        productId: "prod_001",
        productName: "Premium Widget Pro",
        currentStock: 50,
        avgInventory: 75,
        costPerUnit: 24.99,
        annualCOGS: 24990, // Sold 1000 units
        annualRevenue: 49990,
        lastSaleDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        productId: "prod_002",
        productName: "Deluxe Gadget Set",
        currentStock: 120,
        avgInventory: 100,
        costPerUnit: 45.0,
        annualCOGS: 13500, // Sold 300 units
        annualRevenue: 27000,
        lastSaleDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // 200 days ago
      },
      {
        productId: "prod_003",
        productName: "Standard Tool Kit",
        currentStock: 45,
        avgInventory: 60,
        costPerUnit: 19.99,
        annualCOGS: 29985, // Sold 1500 units
        annualRevenue: 59970,
        lastSaleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        productId: "prod_004",
        productName: "Ultimate Package",
        currentStock: 30,
        avgInventory: 40,
        costPerUnit: 89.99,
        annualCOGS: 8999, // Sold 100 units
        annualRevenue: 17998,
        lastSaleDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      },
      {
        productId: "prod_005",
        productName: "Basic Starter Pack",
        currentStock: 200,
        avgInventory: 150,
        costPerUnit: 9.99,
        annualCOGS: 39960, // Sold 4000 units
        annualRevenue: 79920,
        lastSaleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      },
      {
        productId: "prod_006",
        productName: "Professional Bundle",
        currentStock: 15,
        avgInventory: 20,
        costPerUnit: 129.99,
        annualCOGS: 2599.8, // Sold 20 units
        annualRevenue: 5199.6,
        lastSaleDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
      },
    ];

    // Generate analytics
    const analytics = await generateInventoryAnalytics(mockProducts);

    return Response.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    console.error("[API] Inventory analytics error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to generate inventory analytics",
      },
      { status: 500 },
    );
  }
}
