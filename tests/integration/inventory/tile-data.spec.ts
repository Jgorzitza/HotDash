/**
 * Integration Tests: Tile Data (INVENTORY-007)
 */

import { describe, it, expect } from "vitest";
import { getInventoryTileData } from "~/services/inventory/tile-data";

describe("Tile Data - Status Buckets", () => {
  it("should calculate status buckets", async () => {
    const data = await getInventoryTileData();

    expect(data.statusBuckets).toBeDefined();
    expect(data.statusBuckets.inStock).toBeGreaterThanOrEqual(0);
    expect(data.statusBuckets.lowStock).toBeGreaterThanOrEqual(0);
    expect(data.statusBuckets.outOfStock).toBeGreaterThanOrEqual(0);
    expect(data.statusBuckets.urgentReorder).toBeGreaterThanOrEqual(0);
  });

  it("should identify top risks", async () => {
    const data = await getInventoryTileData();

    expect(data.topRisks).toBeDefined();
    expect(data.topRisks.length).toBeLessThanOrEqual(5);
  });

  it("should sort risks by urgency", async () => {
    const data = await getInventoryTileData();

    if (data.topRisks.length > 1) {
      for (let i = 0; i < data.topRisks.length - 1; i++) {
        expect(data.topRisks[i].daysUntilStockout).toBeLessThanOrEqual(
          data.topRisks[i + 1].daysUntilStockout,
        );
      }
    }
  });

  it("should include timestamp", async () => {
    const data = await getInventoryTileData();
    expect(data.lastUpdated).toBeDefined();
    expect(new Date(data.lastUpdated).getTime()).toBeGreaterThan(0);
  });
});
