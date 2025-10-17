import type { CampaignMetrics } from "~/lib/ads/aggregations";

export type PublerPost = {
  platform: "meta" | "google" | "tiktok";
  content: string;
  scheduleISO: string; // ISO8601 in UTC
  budgetAllocation: number; // currency units
  sourceCampaignId?: string;
};

export function buildPublerPlan(
  metaCampaigns: CampaignMetrics[],
  googleCampaigns: CampaignMetrics[],
  when: Date = new Date(Date.UTC(2025, 9, 18, 14, 0, 0)),
): PublerPost[] {
  const scheduleISO = when.toISOString();

  const mapCampaign = (
    platform: PublerPost["platform"],
    c: CampaignMetrics,
  ): PublerPost => ({
    platform,
    content: draftContent(platform, c),
    scheduleISO,
    budgetAllocation: round2(c.spend * 0.1),
    sourceCampaignId: c.id,
  });

  return [
    ...metaCampaigns.map((c) => mapCampaign("meta", c)),
    ...googleCampaigns.map((c) => mapCampaign("google", c)),
  ];
}

function draftContent(
  platform: PublerPost["platform"],
  c: CampaignMetrics,
): string {
  // Keep simple and deterministic for tests; UI can augment later
  return `[${platform.toUpperCase()}] Boosting top creative — clicks=${c.clicks}, conversions=${c.conversions}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
