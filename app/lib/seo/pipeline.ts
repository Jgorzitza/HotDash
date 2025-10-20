/**
 * SEO Anomaly Pipeline
 *
 * Builds SEO anomaly bundles from various data sources
 */

import type {
  TrafficAnomaly,
  RankingAnomaly,
  VitalsAnomaly,
  CrawlError,
} from "./anomalies";

export class GaSamplingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GaSamplingError";
  }
}

export interface SEOAnomalyBundle {
  shopDomain: string;
  traffic: TrafficAnomaly[];
  ranking: RankingAnomaly[];
  vitals: VitalsAnomaly[];
  crawl: CrawlError[];
  generatedAt?: string;
  sources: {
    traffic: string;
    ranking: string;
    vitals: string;
    crawl: string;
  };
  isSampled: boolean;
  summary: {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };
}

export interface SEOAnomalyBundleInput {
  shopDomain: string;
  traffic: TrafficAnomaly[];
  ranking: RankingAnomaly[];
  vitals: VitalsAnomaly[];
  crawl: CrawlError[];
  generatedAt?: string;
  sources: {
    traffic: string;
    ranking: string;
    vitals: string;
    crawl: string;
  };
  isSampled: boolean;
}

export function buildSeoAnomalyBundle(
  input: SEOAnomalyBundleInput,
): SEOAnomalyBundle {
  const allAnomalies = [
    ...input.traffic,
    ...input.ranking,
    ...input.vitals,
    ...input.crawl,
  ];

  const criticalCount = allAnomalies.filter(
    (a) => a.severity === "critical",
  ).length;
  const warningCount = allAnomalies.filter(
    (a) => a.severity === "warning",
  ).length;
  const infoCount = allAnomalies.filter((a) => a.severity === "info").length;

  return {
    ...input,
    summary: {
      criticalCount,
      warningCount,
      infoCount,
    },
  };
}
