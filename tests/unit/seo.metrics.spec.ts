import { describe, it, expect } from "vitest";
import {
  calculateSEOKPIs,
  calculateCTR,
  aggregateMetrics,
} from "../../app/lib/seo/metrics";

describe("SEO Metrics", () => {
  it("calculates traffic growth", () => {
    const current = {
      organicSessions: 1100,
      organicRevenue: 5500,
      avgPosition: 3.2,
      clickThroughRate: 5.5,
      impressions: 10000,
      clicks: 550,
      conversions: 55,
      bounceRate: 45,
    };
    const previous = {
      organicSessions: 1000,
      organicRevenue: 5000,
      avgPosition: 3.5,
      clickThroughRate: 5.0,
      impressions: 9000,
      clicks: 450,
      conversions: 50,
      bounceRate: 50,
    };

    const kpis = calculateSEOKPIs(current, previous);
    expect(kpis.trafficGrowth).toBe(10);
    expect(kpis.revenueGrowth).toBe(10);
  });

  it("calculates CTR correctly", () => {
    const ctr = calculateCTR(550, 10000);
    expect(ctr).toBe(5.5);
  });
});
