/**
 * Tests for Demand Forecasting Service (INVENTORY-002)
 *
 * Validates 30-day forecasting, confidence levels, and trend analysis
 */

import { describe, it, expect } from "vitest";
import {
  generateDemandForecast,
  detectAnomalies,
  getForecastSummary,
  type HistoricalSalesData,
  type DemandForecast,
} from "~/services/inventory/demand-forecast";

// Helper to create historical data
function createHistoricalData(quantities: number[]): HistoricalSalesData[] {
  const today = new Date();
  return quantities.map((qty, index) => ({
    date: new Date(
      today.getTime() - (quantities.length - index - 1) * 86400000,
    ), // Days ago
    quantity: qty,
  }));
}

describe("Demand Forecasting Service (INVENTORY-002)", () => {
  describe("generateDemandForecast", () => {
    it("should generate forecast for stable demand pattern", () => {
      // Stable sales around 10 units per day
      const historicalData = createHistoricalData([
        10, 9, 11, 10, 10, 9, 11, 10, 10, 11, 9, 10, 10, 11, 9, 10, 10, 9, 11,
        10, 10, 11, 9, 10, 10, 9, 11, 10, 10, 11,
      ]);

      const forecast = generateDemandForecast("SKU-001", historicalData);

      expect(forecast.sku).toBe("SKU-001");
      expect(forecast.trend).toBe("stable");
      expect(forecast.confidence).toBe("high"); // Low variability
      expect(forecast.daily_forecast).toBeGreaterThan(9);
      expect(forecast.daily_forecast).toBeLessThan(11); // Around 10 per day
      expect(forecast.forecast_30d).toBeGreaterThan(280);
      expect(forecast.forecast_30d).toBeLessThan(330); // Around 300 for 30 days
      expect(forecast.recommended_reorder_qty).toBeGreaterThan(
        forecast.forecast_30d,
      ); // Should include buffer
    });

    it("should detect growing trend", () => {
      // Growing sales pattern
      const historicalData = createHistoricalData([
        5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
        24, 25, 26, 27, 28, 29, 30,
      ]);

      const forecast = generateDemandForecast("SKU-002", historicalData);

      expect(forecast.trend).toBe("growing");
      expect(forecast.analysis.trend_coefficient).toBeGreaterThan(0);
      expect(forecast.daily_forecast).toBeGreaterThan(20); // Should project growth
    });

    it("should detect declining trend", () => {
      // Declining sales pattern
      const historicalData = createHistoricalData([
        30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13,
        12, 11, 10, 9, 8, 7, 6, 5,
      ]);

      const forecast = generateDemandForecast("SKU-003", historicalData);

      expect(forecast.trend).toBe("declining");
      expect(forecast.analysis.trend_coefficient).toBeLessThan(0);
      expect(forecast.daily_forecast).toBeLessThan(15); // Should project decline
    });

    it("should assign high confidence for consistent demand", () => {
      // Very consistent demand (low variability)
      const historicalData = createHistoricalData([
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
      ]);

      const forecast = generateDemandForecast("SKU-004", historicalData);

      expect(forecast.confidence).toBe("high");
      expect(forecast.analysis.variability_coefficient).toBeLessThan(0.15);
    });

    it("should assign low confidence for volatile demand", () => {
      // Highly volatile demand
      const historicalData = createHistoricalData([
        5, 25, 10, 30, 2, 28, 8, 22, 3, 35, 1, 40, 7, 20, 15, 25, 5, 30, 10, 2,
        28, 8, 22, 3, 35, 1, 40, 7, 20, 15,
      ]);

      const forecast = generateDemandForecast("SKU-005", historicalData);

      expect(forecast.confidence).toBe("low");
      expect(forecast.analysis.variability_coefficient).toBeGreaterThan(0.3);
    });

    it("should calculate recommended reorder quantity with buffer", () => {
      const historicalData = createHistoricalData([
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
      ]);

      const forecast = generateDemandForecast("SKU-006", historicalData);

      // High confidence = 5% buffer
      // Forecast ~300, so recommended should be ~315
      expect(forecast.recommended_reorder_qty).toBeGreaterThan(
        forecast.forecast_30d,
      );
      expect(forecast.recommended_reorder_qty).toBeCloseTo(
        forecast.forecast_30d * 1.05,
        0,
      );
    });

    it("should handle minimal historical data", () => {
      const historicalData = createHistoricalData([10, 12, 11]);

      const forecast = generateDemandForecast("SKU-007", historicalData);

      expect(forecast.sku).toBe("SKU-007");
      expect(forecast.forecast_30d).toBeGreaterThan(0);
      expect(forecast.daily_forecast).toBeGreaterThan(0);
    });

    it("should throw error for empty historical data", () => {
      expect(() => generateDemandForecast("SKU-008", [])).toThrow(
        "Historical data is required for forecasting",
      );
    });

    it("should provide detailed analysis data", () => {
      const historicalData = createHistoricalData([
        8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
        26, 27, 28, 29, 30,
      ]);

      const forecast = generateDemandForecast("SKU-009", historicalData);

      expect(forecast.analysis).toBeDefined();
      expect(forecast.analysis.historical_avg).toBeGreaterThan(0);
      expect(forecast.analysis.recent_avg_7d).toBeGreaterThan(0);
      expect(forecast.analysis.recent_avg_30d).toBeGreaterThan(0);
      expect(forecast.analysis.trend_coefficient).toBeDefined();
      expect(forecast.analysis.variability_coefficient).toBeDefined();
    });

    it("should weight recent data more heavily", () => {
      // Old data: low sales, recent data: high sales
      const historicalData = createHistoricalData([
        2,
        3,
        2,
        3,
        2,
        3,
        2,
        3,
        2,
        3,
        2,
        3,
        2,
        3,
        2,
        3, // Old: ~2.5 avg
        20,
        22,
        21,
        23,
        22,
        21,
        20,
        22,
        21,
        23,
        22,
        21,
        20,
        22, // Recent: ~21.5 avg
      ]);

      const forecast = generateDemandForecast("SKU-010", historicalData);

      // Forecast should be closer to recent average (21.5) than historical average (~12)
      expect(forecast.daily_forecast).toBeGreaterThan(15);
      expect(forecast.analysis.recent_avg_7d).toBeGreaterThan(
        forecast.analysis.historical_avg,
      );
    });

    it("should handle zero sales periods", () => {
      const historicalData = createHistoricalData([
        10, 0, 0, 0, 15, 12, 10, 0, 0, 5, 8, 10, 12, 15,
      ]);

      const forecast = generateDemandForecast("SKU-011", historicalData);

      expect(forecast.forecast_30d).toBeGreaterThan(0);
      expect(forecast.confidence).toBe("low"); // High variability due to zeros
    });
  });

  describe("detectAnomalies", () => {
    it("should detect sudden spikes in demand", () => {
      const historicalData = createHistoricalData([
        10,
        10,
        10,
        10,
        10,
        50,
        10,
        10,
        10,
        10, // Spike of 50
      ]);

      const anomalies = detectAnomalies(historicalData);

      expect(anomalies.length).toBe(1);
      expect(anomalies[0].quantity).toBe(50);
    });

    it("should detect sudden drops in demand", () => {
      const historicalData = createHistoricalData([
        50,
        50,
        50,
        50,
        50,
        2,
        50,
        50,
        50,
        50, // Drop to 2
      ]);

      const anomalies = detectAnomalies(historicalData);

      expect(anomalies.length).toBe(1);
      expect(anomalies[0].quantity).toBe(2);
    });

    it("should not detect anomalies in stable data", () => {
      const historicalData = createHistoricalData([
        10, 11, 9, 10, 10, 11, 9, 10, 10, 11, 9, 10,
      ]);

      const anomalies = detectAnomalies(historicalData);

      expect(anomalies.length).toBe(0);
    });

    it("should return empty array for insufficient data", () => {
      const historicalData = createHistoricalData([10, 12]);

      const anomalies = detectAnomalies(historicalData);

      expect(anomalies.length).toBe(0);
    });

    it("should use custom threshold", () => {
      const historicalData = createHistoricalData([
        10, 10, 10, 10, 10, 20, 10, 10, 10, 10,
      ]);

      // Default threshold (2 std devs) might not catch this
      const anomaliesDefault = detectAnomalies(historicalData);

      // Lower threshold (1 std dev) should catch it
      const anomaliesStrict = detectAnomalies(historicalData, 1);

      expect(anomaliesStrict.length).toBeGreaterThanOrEqual(
        anomaliesDefault.length,
      );
    });
  });

  describe("getForecastSummary", () => {
    it("should summarize multiple forecasts", () => {
      const forecasts: DemandForecast[] = [
        {
          sku: "SKU-1",
          forecast_30d: 300,
          daily_forecast: 10,
          confidence: "high",
          trend: "stable",
          recommended_reorder_qty: 315,
          analysis: {
            historical_avg: 10,
            recent_avg_7d: 10,
            recent_avg_30d: 10,
            trend_coefficient: 0,
            variability_coefficient: 0.1,
          },
        },
        {
          sku: "SKU-2",
          forecast_30d: 450,
          daily_forecast: 15,
          confidence: "medium",
          trend: "growing",
          recommended_reorder_qty: 495,
          analysis: {
            historical_avg: 12,
            recent_avg_7d: 15,
            recent_avg_30d: 14,
            trend_coefficient: 0.5,
            variability_coefficient: 0.2,
          },
        },
        {
          sku: "SKU-3",
          forecast_30d: 150,
          daily_forecast: 5,
          confidence: "low",
          trend: "declining",
          recommended_reorder_qty: 180,
          analysis: {
            historical_avg: 8,
            recent_avg_7d: 5,
            recent_avg_30d: 6,
            trend_coefficient: -0.3,
            variability_coefficient: 0.4,
          },
        },
      ];

      const summary = getForecastSummary(forecasts);

      expect(summary.total_forecasted_demand).toBe(900); // 300 + 450 + 150
      expect(summary.high_confidence_count).toBe(1);
      expect(summary.medium_confidence_count).toBe(1);
      expect(summary.low_confidence_count).toBe(1);
      expect(summary.growing_trend_count).toBe(1);
      expect(summary.stable_trend_count).toBe(1);
      expect(summary.declining_trend_count).toBe(1);
    });

    it("should handle empty forecast array", () => {
      const summary = getForecastSummary([]);

      expect(summary.total_forecasted_demand).toBe(0);
      expect(summary.high_confidence_count).toBe(0);
      expect(summary.medium_confidence_count).toBe(0);
      expect(summary.low_confidence_count).toBe(0);
      expect(summary.growing_trend_count).toBe(0);
      expect(summary.stable_trend_count).toBe(0);
      expect(summary.declining_trend_count).toBe(0);
    });
  });

  describe("Integration: Forecasting with Seasonality", () => {
    it("should work alongside seasonal ROP adjustments", () => {
      // Create growing demand pattern
      const historicalData = createHistoricalData([
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
      ]);

      const forecast = generateDemandForecast(
        "SKU-SNOWBOARD-1",
        historicalData,
      );

      // Forecast should show growing trend
      expect(forecast.trend).toBe("growing");
      expect(forecast.forecast_30d).toBeGreaterThan(0);

      // This forecast can be used with seasonal adjustments
      // e.g., if it's winter (peak), multiply by 1.3
      // if it's summer (off-season), multiply by 0.7
      const winterAdjusted = forecast.forecast_30d * 1.3;
      const summerAdjusted = forecast.forecast_30d * 0.7;

      expect(winterAdjusted).toBeGreaterThan(forecast.forecast_30d);
      expect(summerAdjusted).toBeLessThan(forecast.forecast_30d);
    });
  });
});
