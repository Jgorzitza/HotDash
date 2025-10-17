import type { CampaignMetrics } from "~/lib/ads/aggregations";

// Deterministic Meta stub for dev/test
export function fetchMetaCampaigns(): CampaignMetrics[] {
  return [
    {
      id: "meta-1",
      spend: 80,
      clicks: 40,
      conversions: 8,
      revenue: 160,
      impressions: 4000,
    },
    {
      id: "meta-2",
      spend: 20,
      clicks: 10,
      conversions: 2,
      revenue: 40,
      impressions: 1000,
    },
  ];
}
