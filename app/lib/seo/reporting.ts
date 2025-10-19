/**
 * SEO Reporting
 */

import type { SEOMetrics, SEOKPIs } from "./metrics";

export interface SEOReport {
  period: "weekly" | "monthly";
  startDate: string;
  endDate: string;
  metrics: SEOMetrics;
  kpis: SEOKPIs;
  topPages: Array<{ url: string; sessions: number; revenue: number }>;
  summary: string;
}

export function generateWeeklyReport(
  metrics: SEOMetrics,
  kpis: SEOKPIs,
  topPages: Array<{ url: string; sessions: number; revenue: number }>,
): SEOReport {
  return {
    period: "weekly",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    metrics,
    kpis,
    topPages,
    summary: `Traffic: ${kpis.trafficGrowth > 0 ? "+" : ""}${kpis.trafficGrowth.toFixed(1)}% WoW`,
  };
}
