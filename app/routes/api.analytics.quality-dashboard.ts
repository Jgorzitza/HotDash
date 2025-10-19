/**
 * Data Quality Dashboard API
 *
 * GET /api/analytics/quality-dashboard
 *
 * Returns data quality metrics and scores for all analytics endpoints.
 */

import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { scoreMetric } from "../lib/analytics/metric-scorer";

export async function loader(_: LoaderFunctionArgs) {
  // Mock quality scores for each endpoint
  const qualityReport = {
    timestamp: new Date().toISOString(),
    metrics: {
      revenue: {
        score: 95,
        grade: "A",
        completeness: 100,
        validation: 100,
        reconciliation: 98,
        freshness: 85,
        issues: [],
      },
      conversion: {
        score: 92,
        grade: "A",
        completeness: 100,
        validation: 100,
        reconciliation: 95,
        freshness: 80,
        issues: ["Data slightly stale (>5min)"],
      },
      traffic: {
        score: 88,
        grade: "B",
        completeness: 100,
        validation: 90,
        reconciliation: 100,
        freshness: 75,
        issues: ["Minor validation warnings"],
      },
      ideaPool: {
        score: 85,
        grade: "B",
        completeness: 90,
        validation: 100,
        reconciliation: 100,
        freshness: 95,
        issues: ["Using mock data (Supabase not enabled)"],
      },
    },
    overallScore: 90,
    overallGrade: "A",
    summary: "4 metrics assessed - All performing well",
  };

  return json(qualityReport);
}
