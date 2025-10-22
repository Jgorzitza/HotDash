/**
 * API Route: Inventory Tile Data
 *
 * GET /api/inventory/tile-data
 *
 * Returns real-time inventory status summary for dashboard tile:
 * - Status buckets (inStock, lowStock, outOfStock, urgentReorder)
 * - Top 5 risk products approaching stockout
 * - Days until stockout for each risk product
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-007: Real-Time Inventory Tile Data
 */

import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { getInventoryTileData } from "~/services/inventory/tile-data";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get real-time inventory tile data
    const data = await getInventoryTileData();

    return Response.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("[API] Inventory tile data error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to fetch inventory tile data",
      },
      { status: 500 }
    );
  }
}

