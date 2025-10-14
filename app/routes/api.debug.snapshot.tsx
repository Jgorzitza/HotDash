import type { LoaderFunctionArgs } from "react-router";
import { debugTools } from "../utils/debug.server";

/**
 * API Route: /api/debug/snapshot
 * 
 * Returns a complete debugging snapshot of the application state.
 * Useful for troubleshooting performance or reliability issues.
 */
export async function loader(_args: LoaderFunctionArgs) {
  try {
    const snapshot = debugTools.captureSnapshot();

    return Response.json({
      success: true,
      snapshot,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Debug snapshot error:", error);

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

