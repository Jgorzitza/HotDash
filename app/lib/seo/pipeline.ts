import type { SEOAnomaly } from "./anomalies";

export class GaSamplingError extends Error {}

export function buildSeoAnomalyBundle(args: {
  shopDomain: string;
  traffic: SEOAnomaly[];
  ranking: SEOAnomaly[];
  vitals: SEOAnomaly[];
  crawl: SEOAnomaly[];
  generatedAt?: string;
  sources: { traffic: string; ranking: string; vitals: string; crawl: string };
  isSampled?: boolean;
}) {
  const all = [...args.traffic, ...args.ranking, ...args.vitals, ...args.crawl];
  return {
    shopDomain: args.shopDomain,
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    sources: args.sources,
    isSampled: Boolean(args.isSampled),
    anomalies: {
      traffic: args.traffic,
      ranking: args.ranking,
      vitals: args.vitals,
      crawl: args.crawl,
      all,
      counts: {
        total: all.length,
        traffic: args.traffic.length,
        ranking: args.ranking.length,
        vitals: args.vitals.length,
        crawl: args.crawl.length,
      },
    },
  };
}

