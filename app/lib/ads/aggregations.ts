import { roas, cpc, cpa } from "~/lib/ads/metrics";

export type CampaignMetrics = {
  id?: string;
  spend: number; // ad spend in currency
  clicks: number;
  conversions: number;
  revenue: number; // attributed revenue in currency
  impressions?: number;
};

export type AggregatedAdsMetrics = {
  totals: {
    spend: number;
    clicks: number;
    conversions: number;
    revenue: number;
    impressions: number;
  };
  roas: number;
  cpc: number;
  cpa: number;
};

export function aggregateCampaigns(
  campaigns: CampaignMetrics[],
): AggregatedAdsMetrics {
  const totals = campaigns.reduce(
    (acc, c) => {
      acc.spend += toFiniteOrZero(c.spend);
      acc.clicks += toFiniteOrZero(c.clicks);
      acc.conversions += toFiniteOrZero(c.conversions);
      acc.revenue += toFiniteOrZero(c.revenue);
      acc.impressions += toFiniteOrZero(c.impressions ?? 0);
      return acc;
    },
    { spend: 0, clicks: 0, conversions: 0, revenue: 0, impressions: 0 },
  );

  return {
    totals,
    roas: roas(totals.revenue, totals.spend),
    cpc: cpc(totals.spend, totals.clicks),
    cpa: cpa(totals.spend, totals.conversions),
  };
}

function toFiniteOrZero(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}
