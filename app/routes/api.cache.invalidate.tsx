import type { ActionFunctionArgs } from "react-router";
import { cache } from "../utils/cache.server";

/**
 * API Route: POST /api/cache/invalidate
 * 
 * Invalidates cache entries by pattern.
 * Useful for forcing fresh data after updates.
 * 
 * Body: { pattern: string | RegExp }
 * 
 * @example
 * POST /api/cache/invalidate
 * { "pattern": "sales:shop123" }
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const pattern = body.pattern;

    if (!pattern) {
      return Response.json({ error: "Missing pattern parameter" }, { status: 400 });
    }

    const count = cache.invalidate(pattern);

    return Response.json({
      success: true,
      invalidated: count,
      pattern,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Cache invalidation error:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

