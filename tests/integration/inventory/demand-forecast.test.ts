/**
 * Integration Tests: Demand Forecasting (INVENTORY-002)
 *
 * Tests demand forecasting algorithms
 */

import { describe, it, expect } from "vitest";
import { generateDemandForecast } from "~/services/inventory/demand-forecast";

describe("Demand Forecasting - Forecast Generation", () => {
  it("should generate forecast from historical data", () => {
    const historicalData = Array.from({ length: 60 }, (_, i) => ({
      date: new Date(Date.now() - (60 - i) * 24 * 60 * 60 * 1000),
      quantity: 5 + Math.floor(Math.random() * 3), // 5-7 units/day
    }));

    const forecast = generateDemandForecast("test_sku", historicalData);

    expect(forecast.forecast_30d).toBeGreaterThan(0);
    expect(forecast.daily_forecast).toBeGreaterThan(0);
    expect(forecast.confidence).toMatch(/^(high|medium|low)$/);
    expect(forecast.trend).toMatch(/^(growing|stable|declining)$/);
  });

  it("should handle insufficient data", () => {
    const historicalData = [{ date: new Date(), quantity: 5 }];

    const forecast = generateDemandForecast("test_sku", historicalData);

    expect(forecast).toBeDefined();
    expect(forecast.confidence).toBe("low");
  });

  it("should detect growing trend", () => {
    const historicalData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
      quantity: 5 + i * 0.5, // Increasing trend
    }));

    const forecast = generateDemandForecast("test_sku", historicalData);

    expect(forecast.trend).toBe("growing");
    expect(forecast.analysis.trend_coefficient).toBeGreaterThan(0);
  });

  it("should detect declining trend", () => {
    const historicalData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
      quantity: 20 - i * 0.5, // Decreasing trend
    }));

    const forecast = generateDemandForecast("test_sku", historicalData);

    expect(forecast.trend).toBe("declining");
    expect(forecast.analysis.trend_coefficient).toBeLessThan(0);
  });

  it("should calculate confidence based on variability", () => {
    const consistentData = Array.from({ length: 30 }, () => ({
      date: new Date(),
      quantity: 10, // Very consistent
    }));

    const forecast = generateDemandForecast("test_sku", consistentData);

    expect(forecast.confidence).toBe("high");
  });
});
