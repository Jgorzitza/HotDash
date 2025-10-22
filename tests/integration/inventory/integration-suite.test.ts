/**
 * Integration Tests: Full Inventory System Integration
 *
 * Tests end-to-end workflows combining multiple services
 */

import { describe, it, expect } from "vitest";
import {
  calculateReorderPoint,
  getInventoryStatus,
} from "~/services/inventory/rop";
import { getDemandForecast } from "~/services/inventory/demand-forecast";
import { generateReorderAlert } from "~/services/inventory/reorder-alerts";

describe("Integration - ROP + Forecast + Alerts", () => {
  it("should integrate ROP with demand forecast", async () => {
    const ropResult = calculateReorderPoint({
      avgDailySales: 5,
      leadTimeDays: 7,
      maxDailySales: 10,
      maxLeadDays: 14,
      category: "general",
    });

    const forecast = await getDemandForecast("test_001", {
      avgDailySales: 5,
      category: "general",
    });

    expect(ropResult.reorderPoint).toBeGreaterThan(0);
    expect(forecast.forecast_30d).toBeGreaterThan(0);
  });

  it("should generate alert when stock below ROP", async () => {
    const alert = await generateReorderAlert({
      productId: "test_001",
      productName: "Low Stock Product",
      sku: "LSP-001",
      currentStock: 5,
      avgDailySales: 3,
      leadTimeDays: 7,
      maxDailySales: 6,
      maxLeadDays: 14,
      category: "general",
      costPerUnit: 25,
    });

    expect(alert).not.toBeNull();
    expect(alert?.urgency).toMatch(/^(critical|high|medium|low)$/);
  });
});

describe("Integration - Inventory Status", () => {
  it("should correctly identify in_stock", () => {
    expect(getInventoryStatus(100, 50)).toBe("in_stock");
  });

  it("should correctly identify low_stock", () => {
    expect(getInventoryStatus(40, 50)).toBe("low_stock");
  });

  it("should correctly identify urgent_reorder", () => {
    expect(getInventoryStatus(20, 50)).toBe("urgent_reorder");
  });

  it("should correctly identify out_of_stock", () => {
    expect(getInventoryStatus(0, 50)).toBe("out_of_stock");
  });
});

describe("Integration - Edge Cases", () => {
  it("should handle products with no sales history", async () => {
    const forecast = await getDemandForecast("new_product", {
      avgDailySales: 0,
    });

    expect(forecast).toBeDefined();
    expect(forecast.confidence).toBe("low");
  });

  it("should handle very high stock levels", () => {
    const status = getInventoryStatus(10000, 50);
    expect(status).toBe("in_stock");
  });

  it("should handle exact ROP threshold", () => {
    const status = getInventoryStatus(50, 50);
    expect(status).toBe("low_stock");
  });

  it("should handle negative stock gracefully", () => {
    const status = getInventoryStatus(-5, 50);
    expect(status).toBe("out_of_stock");
  });
});
