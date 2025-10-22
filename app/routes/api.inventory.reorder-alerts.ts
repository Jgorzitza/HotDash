/**
 * API Route: Inventory Reorder Alerts
 *
 * GET /api/inventory/reorder-alerts
 *
 * Returns automated reorder alerts for all products below ROP threshold.
 * Includes urgency levels, recommended order quantities (EOQ), and cost estimates.
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-009: Automated Reorder Alerts
 */

import { type LoaderFunctionArgs } from "react-router";
// React Router 7: Use Response.json() from "~/utils/http.server";
import { generateAllReorderAlerts } from "~/services/inventory/reorder-alerts";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Mock product data (in production: fetch from Shopify/database)
    const mockProducts = [
      {
        productId: "prod_001",
        productName: "Premium Widget Pro",
        sku: "PWP-001",
        currentStock: 5,
        avgDailySales: 2.5,
        leadTimeDays: 7,
        maxDailySales: 5,
        maxLeadDays: 14,
        category: "general" as const,
        costPerUnit: 24.99,
      },
      {
        productId: "prod_002",
        productName: "Deluxe Gadget Set",
        sku: "DGS-002",
        currentStock: 0,
        avgDailySales: 1.8,
        leadTimeDays: 10,
        maxDailySales: 4,
        maxLeadDays: 15,
        category: "general" as const,
        costPerUnit: 45.0,
      },
      {
        productId: "prod_003",
        productName: "Standard Tool Kit",
        sku: "STK-003",
        currentStock: 45,
        avgDailySales: 3.2,
        leadTimeDays: 5,
        maxDailySales: 6,
        maxLeadDays: 10,
        category: "general" as const,
        costPerUnit: 19.99,
      },
      {
        productId: "prod_004",
        productName: "Ultimate Package",
        sku: "UP-004",
        currentStock: 8,
        avgDailySales: 4.1,
        leadTimeDays: 7,
        maxDailySales: 8,
        maxLeadDays: 14,
        category: "general" as const,
        costPerUnit: 89.99,
      },
      {
        productId: "prod_006",
        productName: "Professional Bundle",
        sku: "PB-006",
        currentStock: 3,
        avgDailySales: 1.2,
        leadTimeDays: 12,
        maxDailySales: 3,
        maxLeadDays: 18,
        category: "general" as const,
        costPerUnit: 129.99,
      },
    ];

    // Generate reorder alerts
    const alertSummary = await generateAllReorderAlerts(mockProducts);

    return Response.json({
      success: true,
      data: alertSummary,
    });
  } catch (error: any) {
    console.error("[API] Reorder alerts error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to generate reorder alerts",
      },
      { status: 500 }
    );
  }
}


