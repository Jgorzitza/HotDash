/**
 * Anomaly Detection API Route
 * 
 * GET /api/analytics/anomalies
 * Query params:
 * - project: Shop domain (default: "occ")
 * - metric: Specific metric to check | "all" (default: "all")
 * - days: Historical period for baseline (default: 30)
 * 
 * Returns detected anomalies with Z-score analysis
 * Uses Response.json() per React Router 7 pattern
 */

import type { LoaderFunctionArgs } from "react-router";
import {
  detectAnomalies,
  detectAllAnomalies,
  type AnomalyMetric,
} from "~/services/analytics/anomaly-detection";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const metric = url.searchParams.get("metric") || "all";
  const project = url.searchParams.get("project") || "occ";
  const days = Number(url.searchParams.get("days")) || 30;

  try {
    // Detect all anomalies
    if (metric === "all") {
      const alert = await detectAllAnomalies(project, days);
      return Response.json({
        success: true,
        data: alert,
        meta: { project, days },
      });
    }

    // Validate single metric
    const validMetrics: AnomalyMetric[] = [
      "revenue",
      "ctr",
      "conversions",
      "impressions",
      "clicks",
    ];

    if (!validMetrics.includes(metric as AnomalyMetric)) {
      return Response.json(
        {
          success: false,
          error: `Invalid metric. Must be one of: ${validMetrics.join(
            ", "
          )}, or "all"`,
        },
        { status: 400 }
      );
    }

    // Detect anomalies for specific metric
    const anomalies = await detectAnomalies(
      metric as AnomalyMetric,
      project,
      days
    );

    return Response.json({
      success: true,
      data: {
        metric,
        anomalies,
        count: anomalies.length,
        hasAnomalies: anomalies.length > 0,
      },
      meta: { project, metric, days },
    });
  } catch (error) {
    console.error("Anomaly detection API error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


