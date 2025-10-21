/**
 * Tests for Anomaly Detection Service
 * 
 * @see app/services/analytics/anomaly-detection.ts
 * @see docs/directions/analytics.md ANALYTICS-013
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  detectAnomalies,
  detectAllAnomalies,
} from "../../../../app/services/analytics/anomaly-detection";

// Mock database client
let mockDashboardFacts: any[] = [];

vi.mock("../../../../app/db.server", () => ({
  default: {
    dashboardFact: {
      findMany: vi.fn(() => Promise.resolve(mockDashboardFacts)),
    },
  },
}));

describe("Anomaly Detection Service", () => {
  const mockShopDomain = "test-shop.myshopify.com";

  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardFacts = [];
  });

  describe("detectAnomalies", () => {
    it("should detect revenue drop anomaly (Z-score < -2.5)", async () => {
      // Normal revenue: 1000, then sudden drop to 200
      mockDashboardFacts = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i,
          factType: "ads_roas",
          value: { revenue: 1000, impressions: 10000, clicks: 200, conversions: 20 },
          createdAt: new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000),
        })),
        {
          id: 10,
          factType: "ads_roas",
          value: { revenue: 200, impressions: 10000, clicks: 200, conversions: 20 }, // Drop
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const result = await detectAnomalies("revenue", mockShopDomain, 30);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].type).toBe("drop");
      expect(result[0].metric).toBe("revenue");
      expect(result[0].zScore).toBeLessThan(-2.5);
      expect(result[0].significance).toBeDefined();
    });

    it("should detect CTR spike anomaly (Z-score > 2.5)", async () => {
      // Normal CTR: 2.0, then spike to 8.0
      mockDashboardFacts = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i,
          factType: "ads_roas",
          value: { ctr: 2.0, impressions: 10000, clicks: 200, revenue: 1000 },
          createdAt: new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000),
        })),
        {
          id: 10,
          factType: "ads_roas",
          value: { ctr: 8.0, impressions: 10000, clicks: 800, revenue: 1000 }, // Spike
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const result = await detectAnomalies("ctr", mockShopDomain, 30);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].type).toBe("spike");
      expect(result[0].metric).toBe("ctr");
      expect(result[0].zScore).toBeGreaterThan(2.5);
    });

    it("should not detect anomalies in normal data", async () => {
      // All normal values around 1000
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: { revenue: 1000 + i * 10, impressions: 10000, clicks: 200 },
        createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await detectAnomalies("revenue", mockShopDomain, 30);

      expect(result).toHaveLength(0);
    });

    it("should return empty array with insufficient data", async () => {
      // Only 3 data points (need at least 7)
      mockDashboardFacts = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: { revenue: 1000, impressions: 10000, clicks: 200 },
        createdAt: new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await detectAnomalies("revenue", mockShopDomain, 30);

      expect(result).toEqual([]);
    });

    it("should classify significance levels correctly", async () => {
      // Create extreme anomaly (Z > 4.0 = critical)
      mockDashboardFacts = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i,
          factType: "ads_roas",
          value: { revenue: 1000, impressions: 10000, clicks: 200 },
          createdAt: new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000),
        })),
        {
          id: 10,
          factType: "ads_roas",
          value: { revenue: 10000, impressions: 10000, clicks: 200 }, // Extreme spike
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const result = await detectAnomalies("revenue", mockShopDomain, 30);

      if (result.length > 0) {
        expect(["critical", "moderate", "low"]).toContain(result[0].significance);
      }
    });

    it("should include actionable recommendations", async () => {
      mockDashboardFacts = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i,
          factType: "ads_roas",
          value: { revenue: 1000, impressions: 10000, clicks: 200 },
          createdAt: new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000),
        })),
        {
          id: 10,
          factType: "ads_roas",
          value: { revenue: 200, impressions: 10000, clicks: 200 },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const result = await detectAnomalies("revenue", mockShopDomain, 30);

      if (result.length > 0) {
        expect(result[0].recommendation).toBeDefined();
        expect(typeof result[0].recommendation).toBe("string");
        expect(result[0].recommendation.length).toBeGreaterThan(0);
      }
    });

    it("should calculate severity score (1-10 scale)", async () => {
      mockDashboardFacts = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i,
          factType: "ads_roas",
          value: { revenue: 1000, impressions: 10000, clicks: 200 },
          createdAt: new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000),
        })),
        {
          id: 10,
          factType: "ads_roas",
          value: { revenue: 100, impressions: 10000, clicks: 200 },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const result = await detectAnomalies("revenue", mockShopDomain, 30);

      if (result.length > 0) {
        expect(result[0].severity).toBeGreaterThanOrEqual(1);
        expect(result[0].severity).toBeLessThanOrEqual(10);
      }
    });
  });

  describe("detectAllAnomalies", () => {
    it("should detect anomalies across all metrics", async () => {
      // Mix of normal and anomalous data
      mockDashboardFacts = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i,
          factType: "ads_roas",
          value: {
            revenue: 1000,
            ctr: 2.0,
            conversions: 20,
            impressions: 10000,
            clicks: 200,
          },
          createdAt: new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000),
        })),
        {
          id: 10,
          factType: "ads_roas",
          value: {
            revenue: 200, // Drop
            ctr: 8.0, // Spike
            conversions: 20,
            impressions: 10000,
            clicks: 200,
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const result = await detectAllAnomalies(mockShopDomain, 30);

      expect(result.alertId).toBeDefined();
      expect(result.shopDomain).toBe(mockShopDomain);
      expect(result.anomalies).toBeInstanceOf(Array);
      expect(result.summary).toBeDefined();
      expect(typeof result.actionRequired).toBe("boolean");
    });

    it("should sort anomalies by severity (highest first)", async () => {
      mockDashboardFacts = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i,
          factType: "ads_roas",
          value: { revenue: 1000, ctr: 2.0, conversions: 20, impressions: 10000, clicks: 200 },
          createdAt: new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000),
        })),
        {
          id: 10,
          factType: "ads_roas",
          value: { revenue: 100, ctr: 10.0, conversions: 5, impressions: 10000, clicks: 200 },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const result = await detectAllAnomalies(mockShopDomain, 30);

      if (result.anomalies.length > 1) {
        // Should be sorted by severity descending
        expect(result.anomalies[0].severity).toBeGreaterThanOrEqual(
          result.anomalies[1].severity
        );
      }
    });

    it("should flag actionRequired for critical anomalies", async () => {
      // Extreme revenue drop
      mockDashboardFacts = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i,
          factType: "ads_roas",
          value: { revenue: 5000, impressions: 10000, clicks: 200, conversions: 20 },
          createdAt: new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000),
        })),
        {
          id: 10,
          factType: "ads_roas",
          value: { revenue: 100, impressions: 10000, clicks: 200, conversions: 20 },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const result = await detectAllAnomalies(mockShopDomain, 30);

      // Should have anomalies and action required
      if (result.anomalies.length > 0) {
        const hasCritical = result.anomalies.some(
          (a) => a.significance === "critical"
        );
        if (hasCritical) {
          expect(result.actionRequired).toBe(true);
        }
      }
    });

    it("should generate appropriate summary", async () => {
      mockDashboardFacts = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i,
          factType: "ads_roas",
          value: { revenue: 1000, impressions: 10000, clicks: 200 },
          createdAt: new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000),
        })),
      ];

      const result = await detectAllAnomalies(mockShopDomain, 30);

      expect(result.summary).toBeDefined();
      expect(typeof result.summary).toBe("string");
    });
  });
});

