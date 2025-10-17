import { describe, it, expect } from "vitest";
import {
  aggregateCampaigns,
  type CampaignMetrics,
} from "~/lib/ads/aggregations";

describe("ads campaign aggregations", () => {
  it("sums totals and computes derived metrics", () => {
    const campaigns: CampaignMetrics[] = [
      {
        id: "a",
        spend: 100,
        clicks: 50,
        conversions: 10,
        revenue: 200,
        impressions: 5000,
      },
      {
        id: "b",
        spend: 50,
        clicks: 10,
        conversions: 5,
        revenue: 100,
        impressions: 1000,
      },
    ];

    const agg = aggregateCampaigns(campaigns);

    expect(agg.totals.spend).toBe(150);
    expect(agg.totals.clicks).toBe(60);
    expect(agg.totals.conversions).toBe(15);
    expect(agg.totals.revenue).toBe(300);
    expect(agg.totals.impressions).toBe(6000);

    expect(agg.roas).toBeCloseTo(2.0, 5); // 300 / 150
    expect(agg.cpc).toBeCloseTo(2.5, 5); // 150 / 60
    expect(agg.cpa).toBeCloseTo(10, 5); // 150 / 15
  });

  it("guards zero and non-finite inputs", () => {
    const campaigns: CampaignMetrics[] = [
      // @ts-expect-error intentional NaN
      { spend: Number.NaN, clicks: 0, conversions: 0, revenue: 0 },
      // @ts-expect-error intentional Infinity
      {
        spend: Number.POSITIVE_INFINITY,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      },
      { spend: 0, clicks: 0, conversions: 0, revenue: 0 },
    ];

    const agg = aggregateCampaigns(campaigns);
    expect(agg.totals.spend).toBe(0);
    expect(agg.totals.clicks).toBe(0);
    expect(agg.totals.conversions).toBe(0);
    expect(agg.totals.revenue).toBe(0);

    // Derived metrics should be zero-safe
    expect(agg.roas).toBe(0);
    expect(agg.cpc).toBe(0);
    expect(agg.cpa).toBe(0);
  });
});
