import type { LoaderFunctionArgs } from "react-router";
import { perfMonitor } from "../utils/performance.server";

/**
 * API Route: /api/performance/summary
 * 
 * Returns performance metrics summary for monitoring dashboard load times
 * and identifying slow operations.
 */
export async function loader(_args: LoaderFunctionArgs) {
  try {
    const summary = perfMonitor.getSummary();

    return Response.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Performance summary error:", error);

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

