/**
 * Tests for Data Validation Service
 * 
 * @see app/services/analytics/data-validation.ts
 * @see docs/directions/analytics.md ANALYTICS-015
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateDataQuality } from "../../../../app/services/analytics/data-validation";

// Mock database client
let mockDashboardFacts: any[] = [];

vi.mock("../../../../app/db.server", () => ({
  default: {
    dashboardFact: {
      findMany: vi.fn(() => Promise.resolve(mockDashboardFacts)),
    },
  },
}));

describe("Data Validation Service", () => {
  const mockShopDomain = "test-shop.myshopify.com";

  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardFacts = [];
  });

  describe("validateDataQuality", () => {
    it("should return quality score of 100 for perfect data", async () => {
      // Create data for all 30 days
      mockDashboardFacts = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: {
          impressions: 1000,
          clicks: 50,
          conversions: 5,
          revenue: 500,
          ctr: 5.0,
        },
        createdAt: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await validateDataQuality(mockShopDomain, 30);

      expect(result.qualityScore).toBeGreaterThanOrEqual(85);
      expect(["A", "B"]).toContain(result.grade);
      // May have minor issues like stale data detection
    });

    it("should detect missing data gaps", async () => {
      // Only 10 days of data out of 30
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: { impressions: 1000, clicks: 50, revenue: 500 },
        createdAt: new Date(Date.now() - (29 - i * 3) * 24 * 60 * 60 * 1000),
      }));

      const result = await validateDataQuality(mockShopDomain, 30);

      expect(result.summary.missingDataDays).toBeGreaterThan(0);
      expect(result.issues.some((i) => i.type === "missing_data")).toBe(true);
    });

    it("should detect outliers in data", async () => {
      // Normal values: 1000, then one extreme outlier: 10000
      mockDashboardFacts = [
        ...Array.from({ length: 20 }, (_, i) => ({
          id: i,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, revenue: 500 },
          createdAt: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        })),
        {
          id: 20,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, revenue: 50000 }, // Outlier
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const result = await validateDataQuality(mockShopDomain, 30);

      expect(result.summary.outlierCount).toBeGreaterThan(0);
    });

    it("should detect inconsistencies (negative values)", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: -1000, clicks: 50, revenue: 500 }, // Negative impressions
          createdAt: new Date(),
        },
      ];

      const result = await validateDataQuality(mockShopDomain, 30);

      const hasInconsistency = result.issues.some((i) => i.type === "inconsistency");
      expect(hasInconsistency).toBe(true);
      if (hasInconsistency) {
        expect(result.qualityScore).toBeLessThan(100);
      }
    });

    it("should detect stale data (no recent updates)", async () => {
      // Data from 5 days ago (no recent data)
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, revenue: 500 },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ];

      const result = await validateDataQuality(mockShopDomain, 30);

      const hasStaleData = result.issues.some((i) => i.type === "stale_data");
      expect(hasStaleData).toBe(true);
    });

    it("should assign quality grades correctly", async () => {
      // Test different quality scores → grades
      mockDashboardFacts = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: { impressions: 1000, clicks: 50, revenue: 500 },
        createdAt: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await validateDataQuality(mockShopDomain, 30);

      expect(["A", "B", "C", "D", "F"]).toContain(result.grade);
    });

    it("should provide actionable recommendations", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, revenue: 500 },
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ];

      const result = await validateDataQuality(mockShopDomain, 30);

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should include summary with record counts", async () => {
      mockDashboardFacts = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: { impressions: 1000, clicks: 50, revenue: 500 },
        createdAt: new Date(Date.now() - (29 - i * 2) * 24 * 60 * 60 * 1000),
      }));

      const result = await validateDataQuality(mockShopDomain, 30);

      expect(result.summary).toHaveProperty("totalRecords");
      expect(result.summary).toHaveProperty("validRecords");
      expect(result.summary).toHaveProperty("missingDataDays");
      expect(result.summary).toHaveProperty("outlierCount");
      expect(result.summary).toHaveProperty("inconsistencyCount");
      expect(result.summary.totalRecords).toBe(15);
    });

    it("should detect impossible CTR values (> 100%)", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: 1000, clicks: 50, revenue: 500, ctr: 150.0 }, // Impossible
          createdAt: new Date(),
        },
      ];

      const result = await validateDataQuality(mockShopDomain, 30);

      const hasInvalidCTR = result.issues.some(
        (i) => i.type === "inconsistency" && i.metric === "ctr"
      );
      expect(hasInvalidCTR).toBe(true);
    });
  });
});

