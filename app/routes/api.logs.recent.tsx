import type { LoaderFunctionArgs } from "react-router";
import { requestLogger } from "../middleware/logging.server";

/**
 * API Route: /api/logs/recent
 * 
 * Returns recent request logs for monitoring and debugging.
 * Query params:
 * - limit: Number of logs to return (default: 100)
 * - type: 'all' | 'errors' | 'slow' (default: 'all')
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "100", 10);
    const type = url.searchParams.get("type") || "all";

    let logs;
    if (type === "errors") {
      logs = requestLogger.getErrors(limit);
    } else if (type === "slow") {
      logs = requestLogger.getSlowRequests(limit);
    } else {
      logs = requestLogger.getLogs(limit);
    }

    return Response.json({
      success: true,
      data: logs,
      count: logs.length,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Logs retrieval error:", error);

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

