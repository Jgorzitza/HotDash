import type { LoaderFunctionArgs } from "react-router";
import { debugTools } from "../utils/debug.server";

/**
 * API Route: /api/debug/report
 * 
 * Returns a formatted debugging report with analysis and recommendations.
 * Useful for quickly identifying system issues.
 */
export async function loader(_args: LoaderFunctionArgs) {
  try {
    const report = debugTools.generateReport();

    return new Response(report, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[API] Debug report error:", error);

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

