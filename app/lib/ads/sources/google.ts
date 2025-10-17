import type { CampaignMetrics } from "~/lib/ads/aggregations";

// Deterministic Google stub for dev/test
export function fetchGoogleCampaigns(): CampaignMetrics[] {
  return [
    {
      id: "google-1",
      spend: 50,
      clicks: 20,
      conversions: 5,
      revenue: 150,
      impressions: 2000,
    },
    {
      id: "google-2",
      spend: 30,
      clicks: 15,
      conversions: 3,
      revenue: 90,
      impressions: 1500,
    },
  ];
}
