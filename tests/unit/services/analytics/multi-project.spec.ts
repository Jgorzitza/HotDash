/**
 * Tests for Multi-Project Analytics Aggregation
 * 
 * @see app/services/analytics/multi-project.ts
 * @see docs/directions/analytics.md ANALYTICS-011
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProjectMetrics,
  getMultiProjectSummary,
  compareProjects,
  getTopProjectsByMetric,
  getProjectRankings,
} from "../../../../app/services/analytics/multi-project";

// Mock database client
let mockDashboardFacts: any[] = [];
let mockDistinctShops: any[] = [];

vi.mock("../../../../app/db.server", () => ({
  default: {
    dashboardFact: {
      findMany: vi.fn((query: any) => {
        // Handle distinct query
        if (query?.distinct) {
          return Promise.resolve(mockDistinctShops);
        }

        // Filter by shopDomain and factType
        let results = mockDashboardFacts;

        if (query?.where?.shopDomain) {
          results = results.filter((f) => f.shopDomain === query.where.shopDomain);
        }

        if (query?.where?.factType?.in) {
          results = results.filter((f) =>
            query.where.factType.in.includes(f.factType)
          );
        }

        return Promise.resolve(results);
      }),
    },
  },
}));

describe("Multi-Project Analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardFacts = [];
    mockDistinctShops = [];
  });

  describe("getProjectMetrics", () => {
    it("should get aggregated metrics for a single project", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: "shop1.myshopify.com",
          factType: "social_performance",
          value: { impressions: 1000, clicks: 50 },
          createdAt: new Date(),
        },
        {
          id: 2,
          shopDomain: "shop1.myshopify.com",
          factType: "ads_roas",
          value: {
            impressions: 2000,
            clicks: 100,
            conversions: 20,
            revenue: 2000,
            spend: 1000,
          },
          createdAt: new Date(),
        },
      ];

      const result = await getProjectMetrics("shop1.myshopify.com", 30);

      expect(result.project).toBe("shop1.myshopify.com");
      expect(result.totalImpressions).toBe(3000);
      expect(result.totalClicks).toBe(150);
      expect(result.totalConversions).toBe(20);
      expect(result.totalRevenue).toBe(2000);
      expect(result.totalSpend).toBe(1000);
    });

    it("should calculate CTR and conversion rate correctly", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: "shop1.myshopify.com",
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

      const result = await getProjectMetrics("shop1.myshopify.com", 30);

      expect(result.avgCTR).toBe(2.0); // (200 / 10000) * 100
      expect(result.avgConversionRate).toBe(10.0); // (20 / 200) * 100
      expect(result.overallROAS).toBe(2.0); // 2000 / 1000
    });

    it("should handle projects with no data", async () => {
      mockDashboardFacts = [];

      const result = await getProjectMetrics("empty-shop.myshopify.com", 30);

      expect(result.totalImpressions).toBe(0);
      expect(result.totalClicks).toBe(0);
      expect(result.avgCTR).toBe(0);
      expect(result.overallROAS).toBe(0);
    });
  });

  describe("getMultiProjectSummary", () => {
    it("should aggregate metrics across all projects", async () => {
      mockDistinctShops = [
        { shopDomain: "shop1.myshopify.com" },
        { shopDomain: "shop2.myshopify.com" },
      ];

      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: "shop1.myshopify.com",
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
        {
          id: 2,
          shopDomain: "shop2.myshopify.com",
          factType: "ads_roas",
          value: {
            impressions: 2000,
            clicks: 100,
            conversions: 10,
            revenue: 1000,
            spend: 200,
          },
          createdAt: new Date(),
        },
      ];

      const result = await getMultiProjectSummary(30);

      expect(result.totalProjects).toBe(2);
      expect(result.aggregateMetrics.totalImpressions).toBe(3000);
      expect(result.aggregateMetrics.totalClicks).toBe(150);
      expect(result.aggregateMetrics.totalConversions).toBe(15);
      expect(result.aggregateMetrics.totalRevenue).toBe(1500);
      expect(result.aggregateMetrics.totalSpend).toBe(300);
    });

    it("should identify top performers by ROAS", async () => {
      mockDistinctShops = [
        { shopDomain: "shop1" },
        { shopDomain: "shop2" },
        { shopDomain: "shop3" },
      ];

      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: "shop1",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500, spend: 100 }, // ROAS 5.0
          createdAt: new Date(),
        },
        {
          id: 2,
          shopDomain: "shop2",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 300, spend: 100 }, // ROAS 3.0
          createdAt: new Date(),
        },
        {
          id: 3,
          shopDomain: "shop3",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 150, spend: 100 }, // ROAS 1.5
          createdAt: new Date(),
        },
      ];

      const result = await getMultiProjectSummary(30);

      expect(result.topPerformers[0].project).toBe("shop1");
      expect(result.topPerformers[0].overallROAS).toBe(5.0);
      expect(result.topPerformers[0].rank).toBe(1);
    });

    it("should identify bottom performers", async () => {
      mockDistinctShops = [
        { shopDomain: "shop1" },
        { shopDomain: "shop2" },
      ];

      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: "shop1",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500, spend: 100 },
          createdAt: new Date(),
        },
        {
          id: 2,
          shopDomain: "shop2",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 100, spend: 100 },
          createdAt: new Date(),
        },
      ];

      const result = await getMultiProjectSummary(30);

      expect(result.bottomPerformers[0].project).toBe("shop2");
      expect(result.bottomPerformers[0].overallROAS).toBe(1.0);
    });

    it("should return complete project breakdown", async () => {
      mockDistinctShops = [
        { shopDomain: "shop1" },
        { shopDomain: "shop2" },
      ];

      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: "shop1",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500, spend: 100 },
          createdAt: new Date(),
        },
        {
          id: 2,
          shopDomain: "shop2",
          factType: "ads_roas",
          value: { impressions: 2000, clicks: 100, conversions: 10, revenue: 1000, spend: 200 },
          createdAt: new Date(),
        },
      ];

      const result = await getMultiProjectSummary(30);

      expect(result.projectBreakdown).toHaveLength(2);
      expect(result.projectBreakdown[0].rank).toBe(1);
      expect(result.projectBreakdown[1].rank).toBe(2);
    });
  });

  describe("compareProjects", () => {
    it("should compare two projects side by side", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: "shop1",
          factType: "ads_roas",
          value: {
            impressions: 5000,
            clicks: 250,
            conversions: 50,
            revenue: 5000,
            spend: 1000,
          },
          createdAt: new Date(),
        },
        {
          id: 2,
          shopDomain: "shop2",
          factType: "ads_roas",
          value: {
            impressions: 3000,
            clicks: 150,
            conversions: 30,
            revenue: 3000,
            spend: 1000,
          },
          createdAt: new Date(),
        },
      ];

      const result = await compareProjects("shop1", "shop2", 30);

      expect(result.project1).toBe("shop1");
      expect(result.project2).toBe("shop2");
      expect(result.metrics.project1.totalImpressions).toBe(5000);
      expect(result.metrics.project2.totalImpressions).toBe(3000);
      expect(result.comparison.impressionsDiff).toBe(2000); // 5000 - 3000
    });

    it("should determine winner based on ROAS", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: "shop1",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500, spend: 100 }, // ROAS 5.0
          createdAt: new Date(),
        },
        {
          id: 2,
          shopDomain: "shop2",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 300, spend: 100 }, // ROAS 3.0
          createdAt: new Date(),
        },
      ];

      const result = await compareProjects("shop1", "shop2", 30);

      expect(result.comparison.winner).toBe("shop1");
      expect(result.comparison.roasDiff).toBe(2.0); // 5.0 - 3.0
    });
  });

  describe("getTopProjectsByMetric", () => {
    beforeEach(() => {
      mockDistinctShops = [
        { shopDomain: "shop1" },
        { shopDomain: "shop2" },
        { shopDomain: "shop3" },
      ];

      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: "shop1",
          factType: "ads_roas",
          value: { impressions: 5000, clicks: 250, conversions: 50, revenue: 5000, spend: 1000 },
          createdAt: new Date(),
        },
        {
          id: 2,
          shopDomain: "shop2",
          factType: "ads_roas",
          value: { impressions: 3000, clicks: 150, conversions: 30, revenue: 3000, spend: 1000 },
          createdAt: new Date(),
        },
        {
          id: 3,
          shopDomain: "shop3",
          factType: "ads_roas",
          value: { impressions: 10000, clicks: 500, conversions: 100, revenue: 10000, spend: 2000 },
          createdAt: new Date(),
        },
      ];
    });

    it("should return top projects by impressions", async () => {
      const result = await getTopProjectsByMetric("impressions", 2, 30);

      expect(result).toHaveLength(2);
      expect(result[0].project).toBe("shop3"); // 10000 impressions
      expect(result[1].project).toBe("shop1"); // 5000 impressions
    });

    it("should return top projects by revenue", async () => {
      const result = await getTopProjectsByMetric("revenue", 2, 30);

      expect(result).toHaveLength(2);
      expect(result[0].totalRevenue).toBe(10000);
      expect(result[1].totalRevenue).toBe(5000);
    });

    it("should return top projects by ROAS", async () => {
      const result = await getTopProjectsByMetric("roas", 3, 30);

      expect(result).toHaveLength(3);
      // All have same ROAS (5.0) in this mock
      expect(result[0].overallROAS).toBeGreaterThan(0);
    });

    it("should limit results to specified number", async () => {
      const result = await getTopProjectsByMetric("clicks", 1, 30);

      expect(result).toHaveLength(1);
    });
  });

  describe("getProjectRankings", () => {
    it("should return ranked projects with grades", async () => {
      mockDistinctShops = [
        { shopDomain: "shop1" },
        { shopDomain: "shop2" },
      ];

      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: "shop1",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500, spend: 100 }, // ROAS 5.0
          createdAt: new Date(),
        },
        {
          id: 2,
          shopDomain: "shop2",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 150, spend: 100 }, // ROAS 1.5
          createdAt: new Date(),
        },
      ];

      const result = await getProjectRankings(30);

      expect(result).toHaveLength(2);
      expect(result[0].rank).toBe(1);
      expect(result[0].project).toBe("shop1");
      expect(result[0].grade).toBe("A"); // ROAS 5.0 = A grade
      expect(result[1].rank).toBe(2);
      expect(result[1].grade).toBe("D"); // ROAS 1.5 = D grade
    });

    it("should assign correct performance grades", async () => {
      mockDistinctShops = [
        { shopDomain: "gradeA" },
        { shopDomain: "gradeB" },
        { shopDomain: "gradeC" },
        { shopDomain: "gradeD" },
        { shopDomain: "gradeF" },
      ];

      mockDashboardFacts = [
        {
          id: 1,
          shopDomain: "gradeA",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 450, spend: 100 }, // ROAS 4.5
          createdAt: new Date(),
        },
        {
          id: 2,
          shopDomain: "gradeB",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 320, spend: 100 }, // ROAS 3.2
          createdAt: new Date(),
        },
        {
          id: 3,
          shopDomain: "gradeC",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 220, spend: 100 }, // ROAS 2.2
          createdAt: new Date(),
        },
        {
          id: 4,
          shopDomain: "gradeD",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 120, spend: 100 }, // ROAS 1.2
          createdAt: new Date(),
        },
        {
          id: 5,
          shopDomain: "gradeF",
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 50, spend: 100 }, // ROAS 0.5
          createdAt: new Date(),
        },
      ];

      const result = await getProjectRankings(30);

      expect(result.find((p) => p.project === "gradeA")?.grade).toBe("A");
      expect(result.find((p) => p.project === "gradeB")?.grade).toBe("B");
      expect(result.find((p) => p.project === "gradeC")?.grade).toBe("C");
      expect(result.find((p) => p.project === "gradeD")?.grade).toBe("D");
      expect(result.find((p) => p.project === "gradeF")?.grade).toBe("F");
    });
  });
});


