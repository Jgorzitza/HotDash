/**
 * API Route: WoW Variance
 *
 * GET /api/analytics/wow-variance?project=shop.myshopify.com&metric=revenue
 *
 * Returns Week-over-Week variance for sales metrics.
 * Used by Sales Modal to show trend comparisons.
 *
 * Query Parameters:
 * - project: Shop domain (required)
 * - metric: 'revenue' | 'orders' | 'conversion' (required)
 *
 * @see docs/directions/analytics.md ANALYTICS-005
 */

import { type LoaderFunctionArgs } from "react-router";
import {
  getWoWVariance,
  type WoWVariance,
} from "../services/analytics/wow-variance";

/**
 * API Response structure
 */
interface WoWVarianceResponse {
  success: boolean;
  data?: WoWVariance;
  error?: string;
  timestamp: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const project = url.searchParams.get("project");
    const metric = url.searchParams.get("metric");

    // Validate required parameters
    if (!project) {
      const errorResponse: WoWVarianceResponse = {
        success: false,
        error: "Missing required parameter: project",
        timestamp: new Date().toISOString(),
      };
      return Response.json(errorResponse, { status: 400 });
    }

    if (!metric || !["revenue", "orders", "conversion"].includes(metric)) {
      const errorResponse: WoWVarianceResponse = {
        success: false,
        error:
          "Invalid or missing metric parameter. Must be: revenue, orders, or conversion",
        timestamp: new Date().toISOString(),
      };
      return Response.json(errorResponse, { status: 400 });
    }

    // Get Supabase credentials from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Calculate WoW variance
    const variance = await getWoWVariance(
      project,
      metric as "revenue" | "orders" | "conversion",
      supabaseUrl,
      supabaseKey,
    );

    const response: WoWVarianceResponse = {
      success: true,
      data: variance,
      timestamp: new Date().toISOString(),
    };

    return Response.json(response);
  } catch (error: any) {
    console.error("[API] WoW variance error:", error);

    const errorResponse: WoWVarianceResponse = {
      success: false,
      error: error.message || "Failed to calculate WoW variance",
      timestamp: new Date().toISOString(),
    };

    return Response.json(errorResponse, { status: 500 });
  }
}
