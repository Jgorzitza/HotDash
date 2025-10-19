import { describe, expect, it } from "vitest";
import {
  classifyStockRisk,
  getCriticalItems,
  getWarningItems,
} from "../../../app/lib/inventory/risk-classifier";

describe("Stock Risk Classifier", () => {
  describe("classifyStockRisk", () => {
    it("classifies out_of_stock as critical", () => {
      const risk = classifyStockRisk(0, "out_of_stock");
      expect(risk.level).toBe("critical");
      expect(risk.message).toContain("OUT OF STOCK");
    });

    it("classifies urgent_reorder as critical", () => {
      const risk = classifyStockRisk(2, "urgent_reorder");
      expect(risk.level).toBe("critical");
      expect(risk.message).toContain("URGENT REORDER");
    });

    it("classifies <7 days as critical", () => {
      const risk = classifyStockRisk(5, "low_stock");
      expect(risk.level).toBe("critical");
      expect(risk.message).toContain("Less than 7 days");
    });

    it("classifies 7-13 days as warning", () => {
      const risk = classifyStockRisk(10, "low_stock");
      expect(risk.level).toBe("warning");
      expect(risk.message).toContain("Less than 14 days");
    });

    it("classifies >=14 days as ok", () => {
      const risk = classifyStockRisk(20, "in_stock");
      expect(risk.level).toBe("ok");
      expect(risk.message).toContain("Stock level OK");
    });
  });

  describe("getCriticalItems", () => {
    it("returns only critical items sorted by days", () => {
      const items = [
        { id: "1", daysOfCover: 20, status: "in_stock" as const },
        { id: "2", daysOfCover: 3, status: "low_stock" as const },
        { id: "3", daysOfCover: 1, status: "urgent_reorder" as const },
        { id: "4", daysOfCover: 10, status: "low_stock" as const },
      ];

      const critical = getCriticalItems(items);
      expect(critical).toHaveLength(2);
      expect(critical[0].id).toBe("3"); // 1 day
      expect(critical[1].id).toBe("2"); // 3 days
    });
  });
});
