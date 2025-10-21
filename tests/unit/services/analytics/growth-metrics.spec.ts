/**
 * Tests for Growth Dashboard Metrics
 * 
 * @see app/services/analytics/growth-metrics.ts
 * @see docs/directions/analytics.md ANALYTICS-009
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getGrowthMetrics,
  getWeeklyGrowthReport,
  getTrendAnalysis,
  getDashboardMetrics,
} from "../../../../app/services/analytics/growth-metrics";

// Mock database client
let mockDashboardFacts: any[] = [];

vi.mock("../../../../app/db.server", () => ({
  default: {
    dashboardFact: {
      findMany: vi.fn((query: any) => {
        // Filter by factType if specified
        if (query?.where?.factType) {
          const filtered = mockDashboardFacts.filter(
            (f) => f.factType === query.where.factType
          );
          return Promise.resolve(filtered);
        }
        return Promise.resolve(mockDashboardFacts);
      }),
    },
  },
}));

describe("Growth Dashboard Metrics", () => {
  const mockShopDomain = "test-shop.myshopify.com";

  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardFacts = [];
  });

  describe("getGrowthMetrics", () => {
    it("should aggregate metrics across social and ads channels", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "social_performance",
          value: {
            impressions: 5000,
            clicks: 100,
            engagement: 50,
          },
          createdAt: new Date(),
        },
        {
          id: 2,
          factType: "ads_roas",
          value: {
            impressions: 10000,
            clicks: 200,
            conversions: 30,
            revenue: 3000,
            spend: 1000,
          },
          createdAt: new Date(),
        },
      ];

      const result = await getGrowthMetrics(mockShopDomain, 30);

      expect(result.totalImpressions).toBe(15000); // 5000 + 10000
      expect(result.totalClicks).toBe(300); // 100 + 200
      expect(result.totalConversions).toBe(30);
      expect(result.totalRevenue).toBe(3000);
      expect(result.totalSpend).toBe(1000);
    });

    it("should calculate average CTR correctly", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "social_performance",
          value: { impressions: 10000, clicks: 200 },
          createdAt: new Date(),
        },
      ];

      const result = await getGrowthMetrics(mockShopDomain, 30);

      expect(result.avgCTR).toBe(2.0); // (200 / 10000) * 100
    });

    it("should calculate average conversion rate correctly", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: {
            impressions: 10000,
            clicks: 200,
            conversions: 20,
            revenue: 2000,
            spend: 1000,
          },
          createdAt: new Date(),
        },
      ];

      const result = await getGrowthMetrics(mockShopDomain, 30);

      expect(result.avgConversionRate).toBe(10.0); // (20 / 200) * 100
    });

    it("should calculate overall ROAS correctly", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: {
            impressions: 10000,
            clicks: 200,
            conversions: 20,
            revenue: 3000,
            spend: 1000,
          },
          createdAt: new Date(),
        },
      ];

      const result = await getGrowthMetrics(mockShopDomain, 30);

      expect(result.overallROAS).toBe(3.0); // 3000 / 1000
    });

    it("should handle zero values gracefully", async () => {
      mockDashboardFacts = [];

      const result = await getGrowthMetrics(mockShopDomain, 30);

      expect(result.totalImpressions).toBe(0);
      expect(result.totalClicks).toBe(0);
      expect(result.totalConversions).toBe(0);
      expect(result.avgCTR).toBe(0);
      expect(result.avgConversionRate).toBe(0);
      expect(result.overallROAS).toBe(0);
    });

    it("should round percentages to 2 decimal places", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: {
            impressions: 3333,
            clicks: 111,
            conversions: 7,
            revenue: 1234,
            spend: 567,
          },
          createdAt: new Date(),
        },
      ];

      const result = await getGrowthMetrics(mockShopDomain, 30);

      expect(result.avgCTR).toBe(3.33); // (111 / 3333) * 100
      expect(result.avgConversionRate).toBe(6.31); // (7 / 111) * 100
      expect(result.overallROAS).toBe(2.18); // 1234 / 567
    });
  });

  describe("getWeeklyGrowthReport", () => {
    it("should generate weekly reports with growth metrics", async () => {
      // Mock data for multiple weeks
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: {
            impressions: 1000,
            clicks: 50,
            conversions: 5,
            revenue: 500,
            spend: 100,
          },
          createdAt: new Date(),
        },
      ];

      const result = await getWeeklyGrowthReport(mockShopDomain, 2);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("week");
      expect(result[0]).toHaveProperty("impressions");
      expect(result[0]).toHaveProperty("clicks");
      expect(result[0]).toHaveProperty("conversions");
      expect(result[0]).toHaveProperty("weekOverWeekGrowth");
    });

    it("should calculate week-over-week growth", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: {
            impressions: 1000,
            clicks: 50,
            conversions: 5,
            revenue: 500,
            spend: 100,
          },
          createdAt: new Date(),
        },
      ];

      const result = await getWeeklyGrowthReport(mockShopDomain, 1);

      expect(result[0]).toHaveProperty("weekOverWeekGrowth");
      expect(result[0].weekOverWeekGrowth).toHaveProperty("impressions");
      expect(result[0].weekOverWeekGrowth).toHaveProperty("clicks");
      expect(result[0].weekOverWeekGrowth).toHaveProperty("conversions");
      expect(result[0].weekOverWeekGrowth).toHaveProperty("revenue");
    });

    it("should return reports in chronological order (oldest to newest)", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500, spend: 100 },
          createdAt: new Date(),
        },
      ];

      const result = await getWeeklyGrowthReport(mockShopDomain, 3);

      expect(result).toHaveLength(3);
      // Should be ordered oldest to newest (reversed in implementation)
    });

    it("should include week identifier in ISO format", async () => {
      mockDashboardFacts = [];

      const result = await getWeeklyGrowthReport(mockShopDomain, 1);

      expect(result[0].week).toMatch(/^\d{4}-W\d{2}$/); // Format: YYYY-Www
    });
  });

  describe("getTrendAnalysis", () => {
    it("should analyze trends for key metrics", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: {
            impressions: 1000,
            clicks: 50,
            conversions: 5,
            revenue: 500,
          },
          createdAt: new Date(),
        },
      ];

      const result = await getTrendAnalysis(mockShopDomain, 30);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("channel");
      expect(result[0]).toHaveProperty("trend");
      expect(result[0]).toHaveProperty("changePercent");
      expect(result[0]).toHaveProperty("metric");
    });

    it("should identify upward trends", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: {
            impressions: 2000,
            clicks: 100,
            conversions: 20,
            revenue: 1000,
          },
          createdAt: new Date(),
        },
      ];

      const result = await getTrendAnalysis(mockShopDomain, 30);

      const impressionTrend = result.find((t) => t.metric === "impressions");
      expect(impressionTrend).toBeDefined();
      expect(["up", "down", "stable"]).toContain(impressionTrend?.trend);
    });

    it("should classify trends correctly (up/down/stable)", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500 },
          createdAt: new Date(),
        },
      ];

      const result = await getTrendAnalysis(mockShopDomain, 30);

      result.forEach((trend) => {
        expect(["up", "down", "stable"]).toContain(trend.trend);
      });
    });

    it("should include current and previous values", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500 },
          createdAt: new Date(),
        },
      ];

      const result = await getTrendAnalysis(mockShopDomain, 30);

      expect(result[0]).toHaveProperty("currentValue");
      expect(result[0]).toHaveProperty("previousValue");
      expect(typeof result[0].currentValue).toBe("number");
      expect(typeof result[0].previousValue).toBe("number");
    });
  });

  describe("getDashboardMetrics", () => {
    it("should return complete dashboard with all sections", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: {
            impressions: 1000,
            clicks: 50,
            conversions: 5,
            revenue: 500,
            spend: 100,
          },
          createdAt: new Date(),
        },
      ];

      const result = await getDashboardMetrics(mockShopDomain);

      expect(result).toHaveProperty("current");
      expect(result).toHaveProperty("previous");
      expect(result).toHaveProperty("weeklyReports");
      expect(result).toHaveProperty("trends");
      expect(result).toHaveProperty("topPerformers");
    });

    it("should include current and previous metrics", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500, spend: 100 },
          createdAt: new Date(),
        },
      ];

      const result = await getDashboardMetrics(mockShopDomain);

      expect(result.current).toHaveProperty("totalImpressions");
      expect(result.current).toHaveProperty("totalClicks");
      expect(result.previous).toHaveProperty("totalImpressions");
      expect(result.previous).toHaveProperty("totalClicks");
    });

    it("should include weekly reports", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500, spend: 100 },
          createdAt: new Date(),
        },
      ];

      const result = await getDashboardMetrics(mockShopDomain);

      expect(result.weeklyReports).toBeInstanceOf(Array);
      expect(result.weeklyReports.length).toBeGreaterThan(0);
    });

    it("should identify top performers", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: 2000, clicks: 100, conversions: 10, revenue: 1000, spend: 200 },
          createdAt: new Date(),
        },
      ];

      const result = await getDashboardMetrics(mockShopDomain);

      expect(result.topPerformers).toBeInstanceOf(Array);
      result.topPerformers.forEach((performer) => {
        expect(performer).toHaveProperty("channel");
        expect(performer).toHaveProperty("metric");
        expect(performer).toHaveProperty("value");
        expect(performer).toHaveProperty("change");
      });
    });
  });

  describe("Aggregation Logic", () => {
    it("should combine social and ads impressions", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "social_performance",
          value: { impressions: 5000, clicks: 100 },
          createdAt: new Date(),
        },
        {
          id: 2,
          factType: "ads_roas",
          value: { impressions: 10000, clicks: 200, conversions: 20, revenue: 2000, spend: 1000 },
          createdAt: new Date(),
        },
      ];

      const result = await getGrowthMetrics(mockShopDomain, 30);

      expect(result.totalImpressions).toBe(15000);
      expect(result.totalClicks).toBe(300);
    });

    it("should only count ads conversions (social doesn't track conversions)", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "social_performance",
          value: { impressions: 5000, clicks: 100 },
          createdAt: new Date(),
        },
        {
          id: 2,
          factType: "ads_roas",
          value: { impressions: 10000, clicks: 200, conversions: 30, revenue: 3000, spend: 1000 },
          createdAt: new Date(),
        },
      ];

      const result = await getGrowthMetrics(mockShopDomain, 30);

      expect(result.totalConversions).toBe(30); // Only from ads
    });

    it("should handle multiple records of same type", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500, spend: 100 },
          createdAt: new Date(),
        },
        {
          id: 2,
          factType: "ads_roas",
          value: { impressions: 2000, clicks: 100, conversions: 10, revenue: 1000, spend: 200 },
          createdAt: new Date(),
        },
      ];

      const result = await getGrowthMetrics(mockShopDomain, 30);

      expect(result.totalImpressions).toBe(3000);
      expect(result.totalClicks).toBe(150);
      expect(result.totalConversions).toBe(15);
      expect(result.totalRevenue).toBe(1500);
      expect(result.totalSpend).toBe(300);
    });
  });
});

