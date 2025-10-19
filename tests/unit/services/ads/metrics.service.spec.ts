/**
 * Metrics Service Tests
 */

import { describe, it, expect } from "vitest";
import {
  getPlatformBreakdown,
  type Campaign,
  AdPlatform,
  CampaignStatus,
} from "~/lib/ads";

const mockCampaigns: Campaign[] = [
  {
    id: "meta-1",
    name: "Meta Campaign",
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
  },
  {
    id: "google-1",
    name: "Google Campaign",
    platform: AdPlatform.GOOGLE,
    status: CampaignStatus.ACTIVE,
    startDate: "2025-06-01T00:00:00Z",
    dailyBudget: 200,
    totalBudget: 6000,
    metrics: {
      spend: 800,
      revenue: 4800,
      impressions: 80000,
      clicks: 2000,
      conversions: 80,
      roas: 6.0,
      cpc: 0.4,
      cpa: 10.0,
      ctr: 2.5,
      conversionRate: 4.0,
    },
    createdAt: "2025-05-15T00:00:00Z",
    updatedAt: "2025-06-15T00:00:00Z",
  },
];

describe("Metrics Service", () => {
  it("calculates platform breakdown", () => {
    const breakdown = getPlatformBreakdown(mockCampaigns);

    expect(breakdown.meta.count).toBe(1);
    expect(breakdown.meta.totalSpend).toBe(500);
    expect(breakdown.meta.averageROAS).toBe(5.0);

    expect(breakdown.google.count).toBe(1);
    expect(breakdown.google.totalSpend).toBe(800);
    expect(breakdown.google.averageROAS).toBe(6.0);
  });

  it("handles empty campaign list", () => {
    const breakdown = getPlatformBreakdown([]);

    expect(breakdown.meta.count).toBe(0);
    expect(breakdown.google.count).toBe(0);
  });
});
