import type { LoaderFunctionArgs } from "react-router";
import { queryOptimizer } from "../utils/query-optimizer.server";

/**
 * API Route: /api/queries/analyze
 * 
 * Returns query performance analysis and optimization suggestions.
 * Query params:
 * - window: Time window in seconds (default: 60)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const windowSeconds = parseInt(url.searchParams.get("window") || "60", 10);
    const windowMs = windowSeconds * 1000;

    const analysis = queryOptimizer.analyze(windowMs);
    const suggestions = queryOptimizer.getSuggestions(windowMs);

    return Response.json({
      success: true,
      analysis: {
        totalQueries: analysis.totalQueries,
        totalDuration: analysis.totalDuration,
        avgDuration: Math.round(analysis.avgDuration),
        slowQueryCount: analysis.slowQueries.length,
        duplicateQueryCount: analysis.duplicateQueries.size,
        nPlusOneCount: analysis.nPlusOnePatterns.length,
      },
      slowQueries: analysis.slowQueries.slice(0, 10).map((q) => ({
        query: q.query.substring(0, 100),
        duration: q.duration,
        timestamp: q.timestamp,
      })),
      duplicateQueries: Array.from(analysis.duplicateQueries.entries())
        .slice(0, 10)
        .map(([query, logs]) => ({
          query: query.substring(0, 100),
          count: logs.length,
          totalDuration: logs.reduce((sum, log) => sum + log.duration, 0),
        })),
      nPlusOnePatterns: analysis.nPlusOnePatterns.slice(0, 5).map((p) => p.substring(0, 100)),
      suggestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Query analysis error:", error);

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

