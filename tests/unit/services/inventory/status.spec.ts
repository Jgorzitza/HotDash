import { describe, expect, it } from "vitest";
import {
  evaluateInventoryStatus,
  calculateDaysOfCover,
  recommendOrderQuantity,
  getInventoryStatus,
  getReorderRecommendation,
  filterByStatus,
  groupByStatus,
  calculateInventoryMetrics,
  type InventoryStatus,
} from "../../../../app/services/inventory/status";

describe("Inventory Status Service", () => {
  describe("evaluateInventoryStatus", () => {
    it("classifies out of stock correctly", () => {
      expect(evaluateInventoryStatus(0, 50, 20)).toBe("out_of_stock");
      expect(evaluateInventoryStatus(-5, 50, 20)).toBe("out_of_stock");
    });

    it("classifies urgent reorder correctly", () => {
      expect(evaluateInventoryStatus(20, 50, 20)).toBe("urgent_reorder");
      expect(evaluateInventoryStatus(15, 50, 20)).toBe("urgent_reorder");
      expect(evaluateInventoryStatus(1, 50, 20)).toBe("urgent_reorder");
    });

    it("classifies low stock correctly", () => {
      expect(evaluateInventoryStatus(40, 50, 20)).toBe("low_stock");
      expect(evaluateInventoryStatus(30, 50, 20)).toBe("low_stock");
      expect(evaluateInventoryStatus(21, 50, 20)).toBe("low_stock");
    });

    it("classifies in stock correctly", () => {
      expect(evaluateInventoryStatus(51, 50, 20)).toBe("in_stock");
      expect(evaluateInventoryStatus(100, 50, 20)).toBe("in_stock");
      expect(evaluateInventoryStatus(1000, 50, 20)).toBe("in_stock");
    });

    it("handles edge case at exact ROP", () => {
      // At ROP is considered low_stock
      expect(evaluateInventoryStatus(50, 50, 20)).toBe("low_stock");
    });

    it("handles edge case at exact safety stock", () => {
      // At safety stock is considered urgent
      expect(evaluateInventoryStatus(20, 50, 20)).toBe("urgent_reorder");
    });
  });

  describe("calculateDaysOfCover", () => {
    it("calculates days of cover correctly", () => {
      expect(calculateDaysOfCover(100, 10)).toBe(10.0);
      expect(calculateDaysOfCover(50, 5)).toBe(10.0);
      expect(calculateDaysOfCover(83, 7)).toBe(11.86);
    });

    it("returns null for zero sales", () => {
      expect(calculateDaysOfCover(100, 0)).toBeNull();
    });

    it("returns null for negative sales", () => {
      expect(calculateDaysOfCover(100, -5)).toBeNull();
    });

    it("handles fractional sales correctly", () => {
      expect(calculateDaysOfCover(100, 7.5)).toBe(13.33);
    });

    it("rounds to 2 decimal places", () => {
      expect(calculateDaysOfCover(100, 3)).toBe(33.33);
      expect(calculateDaysOfCover(100, 7)).toBe(14.29);
    });
  });

  describe("recommendOrderQuantity", () => {
    it("calculates order quantity without incoming stock", () => {
      const qty = recommendOrderQuantity({
        onHand: 30,
        reorderPoint: 60,
        safetyStock: 20,
      });

      // Target: 60 + 20 = 80
      // Current: 30
      // Order: 80 - 30 = 50
      expect(qty).toBe(50);
    });

    it("accounts for incoming stock", () => {
      const qty = recommendOrderQuantity({
        onHand: 40,
        incoming: 10,
        reorderPoint: 60,
        safetyStock: 20,
      });

      // Target: 80
      // Current: 40 + 10 = 50
      // Order: 80 - 50 = 30
      expect(qty).toBe(30);
    });

    it("returns 0 when stock is sufficient", () => {
      const qty = recommendOrderQuantity({
        onHand: 100,
        incoming: 0,
        reorderPoint: 50,
        safetyStock: 10,
      });

      expect(qty).toBe(0);
    });

    it("floors fractional results", () => {
      const qty = recommendOrderQuantity({
        onHand: 30.5,
        incoming: 10.3,
        reorderPoint: 60,
        safetyStock: 20,
      });

      // Target: 80
      // Current: 30.5 + 10.3 = 40.8
      // Order: 80 - 40.8 = 39.2 → 39
      expect(qty).toBe(39);
    });
  });

  describe("getInventoryStatus", () => {
    it("returns complete status assessment", () => {
      const status = getInventoryStatus({
        onHand: 40,
        reorderPoint: 60,
        safetyStock: 20,
        averageDailySales: 8,
        incoming: 10,
      });

      expect(status.status).toBe("low_stock");
      expect(status.daysOfCover).toBe(5.0); // 40 / 8
      expect(status.recommendedOrderQuantity).toBe(30); // (60+20) - (40+10)
      expect(status.onHand).toBe(40);
      expect(status.reorderPoint).toBe(60);
      expect(status.safetyStock).toBe(20);
    });

    it("handles missing optional parameters", () => {
      const status = getInventoryStatus({
        onHand: 100,
        reorderPoint: 50,
        safetyStock: 20,
      });

      expect(status.status).toBe("in_stock");
      expect(status.daysOfCover).toBeNull(); // No sales data
      expect(status.recommendedOrderQuantity).toBe(0);
    });

    it("works with out of stock scenario", () => {
      const status = getInventoryStatus({
        onHand: 0,
        reorderPoint: 50,
        safetyStock: 20,
        averageDailySales: 10,
      });

      expect(status.status).toBe("out_of_stock");
      expect(status.daysOfCover).toBe(0); // 0 stock = 0 days
      expect(status.recommendedOrderQuantity).toBe(70); // (50+20) - 0
    });
  });

  describe("getReorderRecommendation", () => {
    it("returns critical urgency for out of stock", () => {
      const rec = getReorderRecommendation("out_of_stock", 0, 100);

      expect(rec.shouldReorder).toBe(true);
      expect(rec.urgency).toBe("critical");
      expect(rec.message).toContain("OUT OF STOCK");
      expect(rec.orderQuantity).toBe(100);
    });

    it("returns critical urgency for urgent reorder", () => {
      const rec = getReorderRecommendation("urgent_reorder", 2.5, 50);

      expect(rec.shouldReorder).toBe(true);
      expect(rec.urgency).toBe("critical");
      expect(rec.message).toContain("CRITICAL");
      expect(rec.orderQuantity).toBe(50);
    });

    it("returns high urgency for low stock with <7 days cover", () => {
      const rec = getReorderRecommendation("low_stock", 5.0, 40);

      expect(rec.shouldReorder).toBe(true);
      expect(rec.urgency).toBe("high");
      expect(rec.message).toContain("Less than 5.0 days");
      expect(rec.orderQuantity).toBe(40);
    });

    it("returns medium urgency for low stock with >=7 days cover", () => {
      const rec = getReorderRecommendation("low_stock", 10.0, 30);

      expect(rec.shouldReorder).toBe(true);
      expect(rec.urgency).toBe("medium");
      expect(rec.message).toContain("Below reorder point");
      expect(rec.orderQuantity).toBe(30);
    });

    it("returns medium urgency for low stock with no days cover data", () => {
      const rec = getReorderRecommendation("low_stock", null, 30);

      expect(rec.shouldReorder).toBe(true);
      expect(rec.urgency).toBe("medium");
      expect(rec.orderQuantity).toBe(30);
    });

    it("returns no urgency for in stock", () => {
      const rec = getReorderRecommendation("in_stock", 20.0, 0);

      expect(rec.shouldReorder).toBe(false);
      expect(rec.urgency).toBe("none");
      expect(rec.message).toContain("healthy");
      expect(rec.orderQuantity).toBe(0);
    });
  });

  describe("filterByStatus", () => {
    const items = [
      { id: 1, status: "in_stock" as InventoryStatus },
      { id: 2, status: "low_stock" as InventoryStatus },
      { id: 3, status: "in_stock" as InventoryStatus },
      { id: 4, status: "urgent_reorder" as InventoryStatus },
      { id: 5, status: "out_of_stock" as InventoryStatus },
    ];

    it("filters in_stock items", () => {
      const filtered = filterByStatus(items, "in_stock");
      expect(filtered).toHaveLength(2);
      expect(filtered.map((i) => i.id)).toEqual([1, 3]);
    });

    it("filters low_stock items", () => {
      const filtered = filterByStatus(items, "low_stock");
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(2);
    });

    it("filters urgent_reorder items", () => {
      const filtered = filterByStatus(items, "urgent_reorder");
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(4);
    });

    it("filters out_of_stock items", () => {
      const filtered = filterByStatus(items, "out_of_stock");
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(5);
    });
  });

  describe("groupByStatus", () => {
    const items = [
      { id: 1, status: "in_stock" as InventoryStatus },
      { id: 2, status: "low_stock" as InventoryStatus },
      { id: 3, status: "in_stock" as InventoryStatus },
      { id: 4, status: "urgent_reorder" as InventoryStatus },
      { id: 5, status: "out_of_stock" as InventoryStatus },
    ];

    it("groups items by status", () => {
      const grouped = groupByStatus(items);

      expect(grouped.in_stock).toHaveLength(2);
      expect(grouped.low_stock).toHaveLength(1);
      expect(grouped.urgent_reorder).toHaveLength(1);
      expect(grouped.out_of_stock).toHaveLength(1);
    });

    it("returns empty arrays for unused buckets", () => {
      const singleItem = [{ id: 1, status: "in_stock" as InventoryStatus }];
      const grouped = groupByStatus(singleItem);

      expect(grouped.in_stock).toHaveLength(1);
      expect(grouped.low_stock).toHaveLength(0);
      expect(grouped.urgent_reorder).toHaveLength(0);
      expect(grouped.out_of_stock).toHaveLength(0);
    });
  });

  describe("calculateInventoryMetrics", () => {
    const items = [
      { id: 1, status: "in_stock" as InventoryStatus },
      { id: 2, status: "low_stock" as InventoryStatus },
      { id: 3, status: "in_stock" as InventoryStatus },
      { id: 4, status: "urgent_reorder" as InventoryStatus },
      { id: 5, status: "out_of_stock" as InventoryStatus },
      { id: 6, status: "in_stock" as InventoryStatus },
    ];

    it("calculates metrics correctly", () => {
      const metrics = calculateInventoryMetrics(items);

      expect(metrics.total).toBe(6);
      expect(metrics.inStock).toBe(3);
      expect(metrics.lowStock).toBe(1);
      expect(metrics.urgentReorder).toBe(1);
      expect(metrics.outOfStock).toBe(1);
      expect(metrics.healthPercentage).toBe(50.0); // 3/6 = 50%
    });

    it("handles empty array", () => {
      const metrics = calculateInventoryMetrics([]);

      expect(metrics.total).toBe(0);
      expect(metrics.inStock).toBe(0);
      expect(metrics.healthPercentage).toBe(0);
    });

    it("handles 100% healthy inventory", () => {
      const allGood = [
        { id: 1, status: "in_stock" as InventoryStatus },
        { id: 2, status: "in_stock" as InventoryStatus },
      ];

      const metrics = calculateInventoryMetrics(allGood);
      expect(metrics.healthPercentage).toBe(100.0);
    });

    it("handles 0% healthy inventory", () => {
      const allBad = [
        { id: 1, status: "out_of_stock" as InventoryStatus },
        { id: 2, status: "urgent_reorder" as InventoryStatus },
      ];

      const metrics = calculateInventoryMetrics(allBad);
      expect(metrics.healthPercentage).toBe(0);
    });
  });

  describe("real-world Hot Rod AN scenarios", () => {
    it("handles healthy salsa inventory", () => {
      const status = getInventoryStatus({
        onHand: 500,
        reorderPoint: 252,
        safetyStock: 84,
        averageDailySales: 12,
      });

      expect(status.status).toBe("in_stock");
      expect(status.daysOfCover).toBe(41.67); // ~42 days
      expect(status.recommendedOrderQuantity).toBe(0);
    });

    it("handles critical hot sauce inventory", () => {
      const status = getInventoryStatus({
        onHand: 15,
        reorderPoint: 100,
        safetyStock: 30,
        averageDailySales: 8,
        incoming: 0,
      });

      expect(status.status).toBe("urgent_reorder");
      expect(status.daysOfCover).toBe(1.88); // < 2 days!
      expect(status.recommendedOrderQuantity).toBe(115);

      const rec = getReorderRecommendation(
        status.status,
        status.daysOfCover,
        status.recommendedOrderQuantity,
      );
      expect(rec.urgency).toBe("critical");
    });

    it("handles variety pack below ROP", () => {
      const status = getInventoryStatus({
        onHand: 40,
        reorderPoint: 60,
        safetyStock: 20,
        averageDailySales: 5,
        incoming: 10,
      });

      expect(status.status).toBe("low_stock");
      expect(status.daysOfCover).toBe(8.0);
      expect(status.recommendedOrderQuantity).toBe(30);

      const rec = getReorderRecommendation(
        status.status,
        status.daysOfCover,
        status.recommendedOrderQuantity,
      );
      expect(rec.urgency).toBe("medium"); // > 7 days
    });
  });
});
