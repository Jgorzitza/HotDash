/**
 * Tests for Ads ROAS Calculator
 * 
 * @see app/services/analytics/ads-roas.ts
 * @see docs/directions/analytics.md ANALYTICS-008
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateCampaignROAS,
  getROASSummary,
  getCampaignPerformance,
  compareCampaigns,
} from "../../../../app/services/analytics/ads-roas";

// Mock database client
let mockDashboardFacts: any[] = [];
let mockCreateCalled = false;

vi.mock("../../../../app/db.server", () => ({
  default: {
    dashboardFact: {
      create: vi.fn((data) => {
        mockCreateCalled = true;
        return Promise.resolve({ id: 1, ...data.data });
      }),
      findMany: vi.fn(() => Promise.resolve(mockDashboardFacts)),
    },
  },
}));

describe("Ads ROAS Calculator", () => {
  const mockShopDomain = "test-shop.myshopify.com";
  const mockCampaignId = "campaign-123";
  const mockCampaignName = "Summer Sale Campaign";

  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardFacts = [];
    mockCreateCalled = false;
  });

  describe("calculateCampaignROAS", () => {
    it("should calculate ROAS correctly (revenue / spend)", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1000, // spend
        3000, // revenue
        10000, // impressions
        200, // clicks
        30, // conversions
        mockShopDomain
      );

      expect(result.performance.roas).toBe(3.0); // 3000 / 1000
      expect(result.status).toBe("profitable");
      expect(mockCreateCalled).toBe(true);
    });

    it("should calculate CTR correctly (clicks/impressions * 100)", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1000,
        2000,
        10000, // impressions
        200, // clicks
        30,
        mockShopDomain
      );

      expect(result.performance.ctr).toBe(2.0); // (200 / 10000) * 100
    });

    it("should calculate conversion rate correctly", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1000,
        2000,
        10000,
        200, // clicks
        20, // conversions
        mockShopDomain
      );

      expect(result.performance.conversionRate).toBe(10.0); // (20 / 200) * 100
    });

    it("should calculate cost per conversion correctly", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1500, // spend
        3000,
        10000,
        200,
        30, // conversions
        mockShopDomain
      );

      expect(result.performance.costPerConversion).toBe(50.0); // 1500 / 30
    });

    it("should mark as profitable when ROAS > 2.0", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1000,
        3000, // ROAS = 3.0
        10000,
        200,
        30,
        mockShopDomain
      );

      expect(result.status).toBe("profitable");
      expect(result.recommendation).toContain("ROAS");
    });

    it("should mark as break-even when ROAS between 1.0 and 2.0", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1000,
        1500, // ROAS = 1.5
        10000,
        200,
        30,
        mockShopDomain
      );

      expect(result.status).toBe("break-even");
    });

    it("should mark as unprofitable when ROAS < 1.0", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1000,
        500, // ROAS = 0.5
        10000,
        200,
        30,
        mockShopDomain
      );

      expect(result.status).toBe("unprofitable");
      expect(result.recommendation).toContain("Unprofitable");
    });

    it("should handle zero spend gracefully", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        0, // spend
        1000,
        10000,
        200,
        30,
        mockShopDomain
      );

      expect(result.performance.roas).toBe(0);
      expect(typeof result.performance.roas).toBe("number");
    });

    it("should recommend budget increase for excellent ROAS", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1000,
        4000, // ROAS = 4.0
        10000,
        200,
        30,
        mockShopDomain
      );

      expect(result.recommendation).toContain("increasing budget");
    });

    it("should recommend ad creative review for low CTR", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1000,
        1500, // ROAS = 1.5 (break-even)
        10000,
        50, // Low clicks (CTR = 0.5%)
        10,
        mockShopDomain
      );

      expect(result.recommendation).toContain("ad creative");
    });

    it("should round all metrics to 2 decimal places", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        333,
        777,
        10000,
        127,
        19,
        mockShopDomain
      );

      expect(result.performance.roas).toBe(2.33); // 777/333 = 2.333...
      expect(result.performance.ctr).toBe(1.27); // 127/10000 * 100
      expect(result.performance.conversionRate).toBe(14.96); // 19/127 * 100
    });
  });

  describe("getROASSummary", () => {
    it("should aggregate metrics across campaigns", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: {
            campaignId: "campaign1",
            campaignName: "Campaign 1",
            spend: 1000,
            revenue: 3000,
            roas: 3.0,
            status: "profitable",
          },
          createdAt: now,
        },
        {
          id: 2,
          value: {
            campaignId: "campaign2",
            campaignName: "Campaign 2",
            spend: 2000,
            revenue: 3000,
            roas: 1.5,
            status: "break-even",
          },
          createdAt: now,
        },
      ];

      const result = await getROASSummary(mockShopDomain);

      expect(result.totalSpend).toBe(3000);
      expect(result.totalRevenue).toBe(6000);
      expect(result.overallROAS).toBe(2.0); // 6000 / 3000
      expect(result.campaignCount).toBe(2);
      expect(result.profitableCampaigns).toBe(1);
    });

    it("should identify best performers (highest ROAS)", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: {
            campaignId: "c1",
            campaignName: "Best",
            roas: 5.0,
            spend: 1000,
            revenue: 5000,
          },
          createdAt: now,
        },
        {
          id: 2,
          value: {
            campaignId: "c2",
            campaignName: "Good",
            roas: 3.0,
            spend: 1000,
            revenue: 3000,
          },
          createdAt: now,
        },
        {
          id: 3,
          value: {
            campaignId: "c3",
            campaignName: "Average",
            roas: 2.0,
            spend: 1000,
            revenue: 2000,
          },
          createdAt: now,
        },
      ];

      const result = await getROASSummary(mockShopDomain);

      expect(result.bestPerformers).toHaveLength(3);
      expect(result.bestPerformers[0].campaignName).toBe("Best");
      expect(result.bestPerformers[0].roas).toBe(5.0);
    });

    it("should identify worst performers (lowest ROAS)", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: {
            campaignId: "c1",
            campaignName: "Poor",
            roas: 0.5,
            spend: 1000,
            revenue: 500,
            status: "unprofitable",
          },
          createdAt: now,
        },
        {
          id: 2,
          value: {
            campaignId: "c2",
            campaignName: "Better",
            roas: 1.2,
            spend: 1000,
            revenue: 1200,
            status: "break-even",
          },
          createdAt: now,
        },
      ];

      const result = await getROASSummary(mockShopDomain);

      expect(result.worstPerformers).toHaveLength(2);
      expect(result.worstPerformers[0].campaignName).toBe("Poor");
      expect(result.worstPerformers[0].roas).toBe(0.5);
    });

    it("should return zeros when no campaigns found", async () => {
      mockDashboardFacts = [];

      const result = await getROASSummary(mockShopDomain);

      expect(result.totalSpend).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.overallROAS).toBe(0);
      expect(result.campaignCount).toBe(0);
      expect(result.profitableCampaigns).toBe(0);
      expect(result.unprofitableCampaigns).toBe(0);
      expect(result.bestPerformers).toEqual([]);
      expect(result.worstPerformers).toEqual([]);
    });

    it("should count unprofitable campaigns", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: {
            campaignId: "c1",
            roas: 0.5,
            spend: 1000,
            revenue: 500,
            status: "unprofitable",
          },
          createdAt: now,
        },
        {
          id: 2,
          value: {
            campaignId: "c2",
            roas: 0.8,
            spend: 1000,
            revenue: 800,
            status: "unprofitable",
          },
          createdAt: now,
        },
      ];

      const result = await getROASSummary(mockShopDomain);

      expect(result.unprofitableCampaigns).toBe(2);
    });
  });

  describe("getCampaignPerformance", () => {
    it("should return historical performance for campaign", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          value: {
            campaignId: mockCampaignId,
            roas: 2.0,
            spend: 1000,
            revenue: 2000,
            status: "profitable",
          },
          createdAt: new Date("2025-10-01"),
        },
        {
          id: 2,
          value: {
            campaignId: mockCampaignId,
            roas: 2.5,
            spend: 1200,
            revenue: 3000,
            status: "profitable",
          },
          createdAt: new Date("2025-10-15"),
        },
      ];

      const result = await getCampaignPerformance(mockCampaignId, mockShopDomain, 90);

      expect(result).toHaveLength(2);
      expect(result[0].roas).toBe(2.0);
      expect(result[1].roas).toBe(2.5);
    });

    it("should filter by specific campaign ID", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          value: { campaignId: "campaign1", roas: 2.0, spend: 1000, revenue: 2000 },
          createdAt: new Date(),
        },
        {
          id: 2,
          value: { campaignId: "campaign2", roas: 3.0, spend: 1000, revenue: 3000 },
          createdAt: new Date(),
        },
      ];

      const result = await getCampaignPerformance("campaign1", mockShopDomain, 90);

      expect(result).toHaveLength(1);
      expect(result[0].roas).toBe(2.0);
    });

    it("should return empty array when campaign not found", async () => {
      mockDashboardFacts = [];

      const result = await getCampaignPerformance(mockCampaignId, mockShopDomain, 90);

      expect(result).toEqual([]);
    });
  });

  describe("compareCampaigns", () => {
    it("should compare multiple campaigns by ROAS", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: {
            campaignId: "c1",
            campaignName: "Campaign 1",
            roas: 3.0,
            spend: 1000,
            revenue: 3000,
            conversions: 30,
          },
          createdAt: now,
        },
        {
          id: 2,
          value: {
            campaignId: "c2",
            campaignName: "Campaign 2",
            roas: 5.0,
            spend: 1000,
            revenue: 5000,
            conversions: 50,
          },
          createdAt: now,
        },
        {
          id: 3,
          value: {
            campaignId: "c3",
            campaignName: "Campaign 3",
            roas: 2.0,
            spend: 1000,
            revenue: 2000,
            conversions: 20,
          },
          createdAt: now,
        },
      ];

      const result = await compareCampaigns(["c1", "c2", "c3"], mockShopDomain);

      expect(result).toHaveLength(3);
      expect(result[0].campaignId).toBe("c2"); // Highest ROAS
      expect(result[0].rank).toBe(1);
      expect(result[1].campaignId).toBe("c1");
      expect(result[1].rank).toBe(2);
      expect(result[2].campaignId).toBe("c3");
      expect(result[2].rank).toBe(3);
    });

    it("should only return requested campaigns", async () => {
      const now = new Date();
      mockDashboardFacts = [
        {
          id: 1,
          value: { campaignId: "c1", campaignName: "C1", roas: 3.0, spend: 1000, revenue: 3000, conversions: 30 },
          createdAt: now,
        },
        {
          id: 2,
          value: { campaignId: "c2", campaignName: "C2", roas: 5.0, spend: 1000, revenue: 5000, conversions: 50 },
          createdAt: now,
        },
        {
          id: 3,
          value: { campaignId: "c3", campaignName: "C3", roas: 2.0, spend: 1000, revenue: 2000, conversions: 20 },
          createdAt: now,
        },
      ];

      const result = await compareCampaigns(["c1", "c3"], mockShopDomain);

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.campaignId)).toEqual(["c1", "c3"]);
    });

    it("should return empty array when no campaigns match", async () => {
      mockDashboardFacts = [];

      const result = await compareCampaigns(["c1", "c2"], mockShopDomain);

      expect(result).toEqual([]);
    });
  });

  describe("ROAS Status Classification", () => {
    it("should classify ROAS > 2.0 as profitable", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1000,
        2500, // ROAS = 2.5
        10000,
        200,
        30,
        mockShopDomain
      );

      expect(result.status).toBe("profitable");
    });

    it("should classify ROAS = 1.0-2.0 as break-even", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1000,
        1500, // ROAS = 1.5
        10000,
        200,
        30,
        mockShopDomain
      );

      expect(result.status).toBe("break-even");
    });

    it("should classify ROAS < 1.0 as unprofitable", async () => {
      const result = await calculateCampaignROAS(
        mockCampaignId,
        mockCampaignName,
        "google",
        1000,
        800, // ROAS = 0.8
        10000,
        200,
        30,
        mockShopDomain
      );

      expect(result.status).toBe("unprofitable");
    });
  });
});

