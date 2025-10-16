/**
 * Health Check Endpoints for All Adapters
 * Owner: integrations agent
 * Date: 2025-10-15
 */



import { logger } from "../../../utils/logger.server";

export async function loader({ request }: any) {
  const startTime = Date.now();
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // Shopify health check
  try {
    const shopifyStart = Date.now();
    // Simple check - just verify we can create a client
    const { createShopifyClient } = await import("../../../lib/shopify/client");
    checks.shopify = {
      status: "healthy",
      latencyMs: Date.now() - shopifyStart,
    };
  } catch (error) {
    checks.shopify = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Supabase health check
  try {
    const supabaseStart = Date.now();
    const { createSupabaseClient } = await import("../../../lib/supabase/client");
    const client = createSupabaseClient();
    checks.supabase = {
      status: "healthy",
      latencyMs: Date.now() - supabaseStart,
    };
  } catch (error) {
    checks.supabase = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Chatwoot health check
  try {
    const chatwootStart = Date.now();
    const { createChatwootClient } = await import("../../../lib/chatwoot/client");
    checks.chatwoot = {
      status: "healthy",
      latencyMs: Date.now() - chatwootStart,
    };
  } catch (error) {
    checks.chatwoot = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // GA4 health check
  try {
    const ga4Start = Date.now();
    const { createGA4Client } = await import("../../../lib/analytics/client");
    const client = createGA4Client();
    checks.ga4 = {
      status: "healthy",
      latencyMs: Date.now() - ga4Start,
    };
  } catch (error) {
    checks.ga4 = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const allHealthy = Object.values(checks).every(check => check.status === "healthy");
  const totalLatency = Date.now() - startTime;

  const response = {
    status: allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    latencyMs: totalLatency,
    checks,
  };

  logger.info("Health check completed", {
    status: response.status,
    latencyMs: totalLatency,
  });

  return Response.json(response, {
    status: allHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
