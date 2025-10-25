/**
 * Shopify Health Check API
 * 
 * GET /api/shopify/health
 * 
 * Verifies Shopify API connectivity and configuration.
 */

import { type LoaderFunctionArgs } from "react-router";
import { checkShopifyHealth } from "~/utils/health-check.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const healthCheck = await checkShopifyHealth();
    
    const response = {
      connected: healthCheck.status === "pass",
      shop: process.env.SHOPIFY_SHOP_URL || "not configured",
      message: healthCheck.message,
      responseTime: healthCheck.responseTime,
      timestamp: new Date().toISOString(),
    };
    
    const status = healthCheck.status === "pass" ? 200 : 503;
    
    return Response.json(response, { status });
  } catch (error: any) {
    return Response.json(
      {
        connected: false,
        error: error.message || "Shopify health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

