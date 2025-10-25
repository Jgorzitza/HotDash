/**
 * Integration Tests: Inventory Reporting (INVENTORY-013)
 */

import { describe, it, expect } from "vitest";
import { generateInventoryReport } from "~/services/inventory/reporting";

describe("Inventory Reporting - Daily Reports", () => {
  it("should generate daily report", async () => {
    const report = await generateInventoryReport("daily");

    expect(report.period).toBe("daily");
    expect(report.summary).toBeDefined();
    expect(report.topMovers).toBeDefined();
    expect(report.bottomMovers).toBeDefined();
  });
});

describe("Inventory Reporting - Weekly Reports", () => {
  it("should generate weekly report", async () => {
    const report = await generateInventoryReport("weekly");

    expect(report.period).toBe("weekly");
    expect(report.summary.totalSKUs).toBeGreaterThan(0);
  });
});

describe("Inventory Reporting - Monthly Reports", () => {
  it("should generate monthly report", async () => {
    const report = await generateInventoryReport("monthly");

    expect(report.period).toBe("monthly");
    const start = new Date(report.startDate);
    const end = new Date(report.endDate);
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysDiff).toBeGreaterThan(25); // Approximately 30 days
  });
});
