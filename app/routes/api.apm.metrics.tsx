import type { LoaderFunctionArgs } from "react-router";
import { apm } from "../utils/apm.server";

/**
 * API Route: /api/apm/metrics
 * 
 * Returns APM metrics for application performance monitoring.
 * Query params:
 * - type: 'http' | 'db' | 'external_api' (filter by transaction type)
 * - status: 'success' | 'error' (filter by status)
 * - minDuration: number (filter by minimum duration in ms)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") as "http" | "db" | "external_api" | undefined;
    const status = url.searchParams.get("status") as "success" | "error" | undefined;
    const minDuration = url.searchParams.get("minDuration")
      ? parseInt(url.searchParams.get("minDuration")!, 10)
      : undefined;

    const transactions = apm.getTransactions({ type, status, minDuration });
    const metrics = apm.getMetrics();

    return Response.json({
      success: true,
      metrics,
      transactions: transactions.slice(-50), // Last 50 matching transactions
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] APM metrics error:", error);

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

