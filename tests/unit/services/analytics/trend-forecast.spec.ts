/**
 * Tests for Trend Forecasting Service
 * 
 * @see app/services/analytics/trend-forecast.ts
 * @see docs/directions/analytics.md ANALYTICS-012
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  forecastMetric,
  forecastAllMetrics,
} from "../../../../app/services/analytics/trend-forecast";

// Mock database client
let mockDashboardFacts: any[] = [];

vi.mock("../../../../app/db.server", () => ({
  default: {
    dashboardFact: {
      findMany: vi.fn(() => Promise.resolve(mockDashboardFacts)),
    },
  },
}));

describe("Trend Forecasting Service", () => {
  const mockShopDomain = "test-shop.myshopify.com";

  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardFacts = [];
  });

  describe("forecastMetric", () => {
    it("should forecast future impressions with linear regression", async () => {
      // Create upward trend data: 100, 110, 120, 130...
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: {
          impressions: 100 + i * 10,
          clicks: 50,
          conversions: 5,
          revenue: 500,
        },
        createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await forecastMetric("impressions", mockShopDomain, 7, 90);

      expect(result.metric).toBe("impressions");
      expect(result.trend).toBe("up");
      expect(result.trendStrength).toBeGreaterThan(0);
      expect(result.predictions).toHaveLength(7);
      expect(result.predictions[0]).toHaveProperty("predictedValue");
      expect(result.predictions[0]).toHaveProperty("confidenceInterval");
    });

    it("should detect downward trend", async () => {
      // Create downward trend data: 200, 190, 180, 170...
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: {
          impressions: 200 - i * 10,
          clicks: 50,
          conversions: 5,
          revenue: 500,
        },
        createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await forecastMetric("impressions", mockShopDomain, 7, 90);

      expect(result.trend).toBe("down");
      expect(result.trendStrength).toBeLessThan(0);
    });

    it("should detect stable trend", async () => {
      // Create truly stable data: all same value
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: {
          impressions: 150,
          clicks: 50,
          conversions: 5,
          revenue: 500,
        },
        createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await forecastMetric("impressions", mockShopDomain, 7, 90);

      expect(result.trend).toBe("stable");
      expect(Math.abs(result.trendStrength)).toBeLessThan(0.02);
    });

    it("should include confidence intervals for predictions", async () => {
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: { impressions: 100 + i * 10, clicks: 50, conversions: 5, revenue: 500 },
        createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await forecastMetric("impressions", mockShopDomain, 7, 90);

      result.predictions.forEach((prediction) => {
        expect(prediction.confidenceInterval).toHaveProperty("lower");
        expect(prediction.confidenceInterval).toHaveProperty("upper");
        expect(prediction.confidenceInterval.lower).toBeLessThanOrEqual(
          prediction.predictedValue
        );
        expect(prediction.confidenceInterval.upper).toBeGreaterThanOrEqual(
          prediction.predictedValue
        );
      });
    });

    it("should handle different forecast periods (7, 14, 30 days)", async () => {
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: { impressions: 100 + i * 10, clicks: 50, conversions: 5, revenue: 500 },
        createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      }));

      const forecast7 = await forecastMetric("impressions", mockShopDomain, 7, 90);
      const forecast14 = await forecastMetric("impressions", mockShopDomain, 14, 90);
      const forecast30 = await forecastMetric("impressions", mockShopDomain, 30, 90);

      expect(forecast7.predictions).toHaveLength(7);
      expect(forecast14.predictions).toHaveLength(14);
      expect(forecast30.predictions).toHaveLength(30);
    });

    it("should handle insufficient data gracefully", async () => {
      mockDashboardFacts = [
        {
          id: 1,
          factType: "ads_roas",
          value: { impressions: 100, clicks: 50, conversions: 5, revenue: 500 },
          createdAt: new Date(),
        },
      ];

      const result = await forecastMetric("impressions", mockShopDomain, 7, 90);

      expect(result.confidence).toBe(0);
      expect(result.predictions).toHaveLength(0);
      expect(result.recommendation).toContain("Insufficient data");
    });

    it("should calculate R-squared confidence score", async () => {
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: { impressions: 100 + i * 10, clicks: 50, conversions: 5, revenue: 500 },
        createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await forecastMetric("impressions", mockShopDomain, 7, 90);

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it("should provide recommendations based on trend and confidence", async () => {
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: { impressions: 100 + i * 10, clicks: 50, conversions: 5, revenue: 500 },
        createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await forecastMetric("impressions", mockShopDomain, 7, 90);

      expect(result.recommendation).toBeDefined();
      expect(typeof result.recommendation).toBe("string");
      expect(result.recommendation.length).toBeGreaterThan(0);
    });

    it("should forecast revenue metric", async () => {
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: { impressions: 1000, clicks: 50, conversions: 5, revenue: 500 + i * 50 },
        createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await forecastMetric("revenue", mockShopDomain, 7, 90);

      expect(result.metric).toBe("revenue");
      expect(result.predictions).toHaveLength(7);
    });

    it("should not produce negative forecasts", async () => {
      // Strong downward trend that might predict negative values
      mockDashboardFacts = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: { impressions: 100 - i * 50, clicks: 50, conversions: 5, revenue: 500 },
        createdAt: new Date(Date.now() - (4 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await forecastMetric("impressions", mockShopDomain, 7, 90);

      result.predictions.forEach((prediction) => {
        expect(prediction.predictedValue).toBeGreaterThanOrEqual(0);
        expect(prediction.confidenceInterval.lower).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("forecastAllMetrics", () => {
    it("should forecast all 5 metrics at once", async () => {
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: {
          impressions: 1000 + i * 100,
          clicks: 50 + i * 5,
          conversions: 5 + i,
          revenue: 500 + i * 50,
          roas: 3.0 + i * 0.1,
        },
        createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await forecastAllMetrics(mockShopDomain, 7);

      expect(result).toHaveProperty("impressions");
      expect(result).toHaveProperty("clicks");
      expect(result).toHaveProperty("conversions");
      expect(result).toHaveProperty("revenue");
      expect(result).toHaveProperty("roas");

      expect(result.impressions.predictions).toHaveLength(7);
      expect(result.clicks.predictions).toHaveLength(7);
      expect(result.conversions.predictions).toHaveLength(7);
      expect(result.revenue.predictions).toHaveLength(7);
      expect(result.roas.predictions).toHaveLength(7);
    });

    it("should provide separate trend analysis for each metric", async () => {
      mockDashboardFacts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        factType: "ads_roas",
        value: {
          impressions: 1000 + i * 100, // Up
          clicks: 50, // Stable
          conversions: 10 - i, // Down
          revenue: 500,
          roas: 3.0,
        },
        createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      }));

      const result = await forecastAllMetrics(mockShopDomain, 7);

      expect(result.impressions.trend).toBe("up");
      expect(result.conversions.trend).toBe("down");
    });
  });
});

