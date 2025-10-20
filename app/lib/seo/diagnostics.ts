/**
 * SEO Diagnostics Builder
 *
 * Generates actionable diagnostics from SEO anomaly bundles
 */

import type { SEOAnomalyBundle } from "./pipeline";

export interface SEODiagnostic {
  type: "traffic" | "ranking" | "vitals" | "crawl";
  severity: "critical" | "warning" | "info";
  message: string;
  recommendation: string;
  affectedPages?: string[];
}

export interface SEODiagnostics {
  diagnostics: SEODiagnostic[];
  priorityActions: string[];
  estimatedImpact: {
    high: number;
    medium: number;
    low: number;
  };
}

export function buildSeoDiagnostics(bundle: SEOAnomalyBundle): SEODiagnostics {
  const diagnostics: SEODiagnostic[] = [];

  // Traffic anomalies
  for (const anomaly of bundle.traffic) {
    diagnostics.push({
      type: "traffic",
      severity: anomaly.severity,
      message: `Traffic drop of ${Math.abs(anomaly.wowDelta * 100).toFixed(1)}% on ${anomaly.landingPage}`,
      recommendation:
        "Review recent content changes, check for technical issues, analyze competitor activity",
      affectedPages: [anomaly.landingPage],
    });
  }

  // Ranking anomalies
  for (const anomaly of bundle.ranking) {
    diagnostics.push({
      type: "ranking",
      severity: anomaly.severity,
      message: `Keyword "${anomaly.keyword}" dropped ${anomaly.positionChange} positions`,
      recommendation:
        "Optimize on-page SEO, build quality backlinks, improve content relevance",
      affectedPages: [anomaly.url],
    });
  }

  // Vitals anomalies
  for (const anomaly of bundle.vitals) {
    diagnostics.push({
      type: "vitals",
      severity: anomaly.severity,
      message: `${anomaly.metric} failed threshold (${anomaly.value}ms vs ${anomaly.threshold}ms)`,
      recommendation:
        "Optimize images, minimize JavaScript, improve server response time",
      affectedPages: [anomaly.url],
    });
  }

  // Crawl errors
  for (const error of bundle.crawl) {
    diagnostics.push({
      type: "crawl",
      severity: error.severity,
      message: `${error.count} ${error.errorType} errors detected`,
      recommendation:
        "Fix broken links, update sitemap, check robots.txt configuration",
    });
  }

  const priorityActions = diagnostics
    .filter((d) => d.severity === "critical")
    .map((d) => d.recommendation)
    .slice(0, 5);

  const estimatedImpact = {
    high: diagnostics.filter((d) => d.severity === "critical").length,
    medium: diagnostics.filter((d) => d.severity === "warning").length,
    low: diagnostics.filter((d) => d.severity === "info").length,
  };

  return {
    diagnostics,
    priorityActions,
    estimatedImpact,
  };
}
