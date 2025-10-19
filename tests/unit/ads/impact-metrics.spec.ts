/**
 * Impact Metrics Tests
 */

import { describe, it, expect } from "vitest";
import {
  calculateCampaignImpact,
  transformToSupabaseRow,
  calculateAggregateImpact,
  type Campaign,
  AdPlatform,
  CampaignStatus,
} from "~/lib/ads";

const mockCampaign: Campaign = {
  id: "campaign-1",
  name: "Test Campaign",
  platform: AdPlatform.META,
  status: CampaignStatus.ACTIVE,
  startDate: "2025-06-01T00:00:00Z",
  dailyBudget: 100,
  totalBudget: 3000,
  metrics: {
    spend: 500,
    revenue: 2500,
    impressions: 50000,
    clicks: 1000,
    conversions: 50,
    roas: 5.0,
    cpc: 0.5,
    cpa: 10.0,
    ctr: 2.0,
    conversionRate: 5.0,
  },
  createdAt: "2025-05-15T00:00:00Z",
  updatedAt: "2025-06-15T00:00:00Z",
};

describe("Campaign Impact Calculation", () => {
  it("calculates daily snapshot correctly", () => {
    const snapshot = calculateCampaignImpact(mockCampaign, "2025-06-15");

    expect(snapshot.campaignId).toBe("campaign-1");
    expect(snapshot.date).toBe("2025-06-15");
    expect(snapshot.platform).toBe(AdPlatform.META);
    expect(snapshot.metrics.roas).toBe(5.0);
  });

  it("transforms snapshot to Supabase row format", () => {
    const snapshot = calculateCampaignImpact(mockCampaign, "2025-06-15");
    const row = transformToSupabaseRow(snapshot);

    expect(row.campaign_id).toBe("campaign-1");
    expect(row.date).toBe("2025-06-15");
    expect(row.platform).toBe(AdPlatform.META);
    expect(row.roas).toBe(5.0);
    expect(row.cpc).toBe(0.5);
  });

  it("calculates aggregate impact across campaigns", () => {
    const campaigns = [mockCampaign];
    const aggregate = calculateAggregateImpact(campaigns, "2025-06-15");

    expect(aggregate.totalSpend).toBe(500);
    expect(aggregate.totalRevenue).toBe(2500);
    expect(aggregate.averageROAS).toBe(5.0);
    expect(aggregate.campaignCount).toBe(1);
  });

  it("handles empty campaign list", () => {
    const aggregate = calculateAggregateImpact([], "2025-06-15");

    expect(aggregate.totalSpend).toBe(0);
    expect(aggregate.campaignCount).toBe(0);
    expect(aggregate.averageROAS).toBe(0);
  });
});
