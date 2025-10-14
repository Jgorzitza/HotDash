import type { LoaderFunctionArgs } from "react-router";
import { createClient } from "@supabase/supabase-js";
import { cache } from "../utils/cache.server";
import { perfMonitor } from "../utils/performance.server";

/**
 * API Route: /api/health
 * 
 * Health check endpoint for monitoring application status.
 * Returns status of critical dependencies and system metrics.
 */
export async function loader(_args: LoaderFunctionArgs) {
  const checks: Record<string, { status: "ok" | "error"; message?: string; duration?: number }> =
    {};

  // Check Supabase connection
  try {
    const start = Date.now();
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      checks.supabase = {
        status: "error",
        message: "Supabase credentials not configured",
      };
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("pickers").select("count").limit(1);

      checks.supabase = {
        status: error ? "error" : "ok",
        message: error?.message,
        duration: Date.now() - start,
      };
    }
  } catch (error) {
    checks.supabase = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Check Shopify credentials
  checks.shopify = {
    status:
      process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET ? "ok" : "error",
    message:
      process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET
        ? undefined
        : "Shopify credentials not configured",
  };

  // Check cache
  const cacheStats = cache.getStats();
  checks.cache = {
    status: "ok",
    message: `${cacheStats.size} entries cached`,
  };

  // Check performance monitor
  const perfSummary = perfMonitor.getSummary();
  const perfKeys = Object.keys(perfSummary);
  checks.performance = {
    status: "ok",
    message: `${perfKeys.length} operations tracked`,
  };

  // Overall health
  const allOk = Object.values(checks).every((check) => check.status === "ok");
  const status = allOk ? 200 : 503;

  return Response.json(
    {
      status: allOk ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    },
    { status },
  );
}

