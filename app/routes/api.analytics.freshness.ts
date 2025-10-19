/**
 * Metric Freshness Monitoring API
 *
 * GET /api/analytics/freshness
 *
 * Returns freshness status for all analytics metrics.
 * Helps monitor data pipeline health and staleness.
 */

import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";

interface FreshnessStatus {
  metric: string;
  lastUpdate: string;
  ageMinutes: number;
  status: "fresh" | "acceptable" | "stale" | "critical";
  cacheHit: boolean;
}

export async function loader(_: LoaderFunctionArgs) {
  const now = Date.now();

  // Mock freshness data for each metric
  // TODO: Replace with actual cache timestamp tracking
  const freshness: FreshnessStatus[] = [
    {
      metric: "revenue",
      lastUpdate: new Date(now - 3 * 60 * 1000).toISOString(), // 3 min ago
      ageMinutes: 3,
      status: "fresh",
      cacheHit: true,
    },
    {
      metric: "conversion",
      lastUpdate: new Date(now - 4 * 60 * 1000).toISOString(), // 4 min ago
      ageMinutes: 4,
      status: "fresh",
      cacheHit: true,
    },
    {
      metric: "traffic",
      lastUpdate: new Date(now - 2 * 60 * 1000).toISOString(), // 2 min ago
      ageMinutes: 2,
      status: "fresh",
      cacheHit: true,
    },
    {
      metric: "ideaPool",
      lastUpdate: new Date(now - 1 * 60 * 1000).toISOString(), // 1 min ago
      ageMinutes: 1,
      status: "fresh",
      cacheHit: false,
    },
  ];

  const summary = {
    fresh: freshness.filter((f) => f.status === "fresh").length,
    acceptable: freshness.filter((f) => f.status === "acceptable").length,
    stale: freshness.filter((f) => f.status === "stale").length,
    critical: freshness.filter((f) => f.status === "critical").length,
  };

  return json({
    timestamp: new Date().toISOString(),
    metrics: freshness,
    summary,
    overallStatus:
      summary.critical > 0
        ? "critical"
        : summary.stale > 0
          ? "stale"
          : summary.acceptable > 0
            ? "acceptable"
            : "fresh",
  });
}
