/**
 * Stock Risk Classification
 *
 * Classifies inventory into risk categories based on days of stock remaining
 * Categories: Critical (<7 days), Warning (<14 days), OK (>14 days)
 *
 * Manager-specified path: app/lib/inventory/risk-classifier.ts
 */

import {
  calculateDaysOfCover,
  type InventoryStatus,
} from "../../services/inventory/status";

export type RiskLevel = "critical" | "warning" | "ok";

export interface RiskClassification {
  level: RiskLevel;
  daysRemaining: number | null;
  message: string;
  inventoryStatus: InventoryStatus;
}

/**
 * Classify stock risk based on days of cover
 *
 * @param daysOfCover - Days of stock remaining (null if unknown)
 * @param inventoryStatus - Current inventory status bucket
 * @returns Risk classification with level and message
 */
export function classifyStockRisk(
  daysOfCover: number | null,
  inventoryStatus: InventoryStatus,
): RiskClassification {
  // Out of stock or urgent reorder is always critical
  if (
    inventoryStatus === "out_of_stock" ||
    inventoryStatus === "urgent_reorder"
  ) {
    return {
      level: "critical",
      daysRemaining: daysOfCover,
      message:
        inventoryStatus === "out_of_stock"
          ? "OUT OF STOCK - Emergency action required"
          : "URGENT REORDER - Stock at or below safety level",
      inventoryStatus,
    };
  }

  // Days-based classification
  if (daysOfCover === null) {
    return {
      level: inventoryStatus === "low_stock" ? "warning" : "ok",
      daysRemaining: null,
      message:
        inventoryStatus === "low_stock"
          ? "Low stock - Insufficient data for days calculation"
          : "Stock level healthy - Insufficient data for days calculation",
      inventoryStatus,
    };
  }

  if (daysOfCover < 7) {
    return {
      level: "critical",
      daysRemaining: daysOfCover,
      message: `CRITICAL - Less than 7 days stock remaining (${daysOfCover.toFixed(1)} days)`,
      inventoryStatus,
    };
  }

  if (daysOfCover < 14) {
    return {
      level: "warning",
      daysRemaining: daysOfCover,
      message: `WARNING - Less than 14 days stock remaining (${daysOfCover.toFixed(1)} days)`,
      inventoryStatus,
    };
  }

  return {
    level: "ok",
    daysRemaining: daysOfCover,
    message: `Stock level OK (${daysOfCover.toFixed(1)} days remaining)`,
    inventoryStatus,
  };
}

/**
 * Get products at critical risk level
 */
export function getCriticalItems<
  T extends { daysOfCover: number | null; status: InventoryStatus },
>(items: T[]): Array<T & { risk: RiskClassification }> {
  return items
    .map((item) => ({
      ...item,
      risk: classifyStockRisk(item.daysOfCover, item.status),
    }))
    .filter((item) => item.risk.level === "critical")
    .sort((a, b) => {
      // Sort by days remaining (nulls last, lowest days first)
      if (a.daysOfCover === null) return 1;
      if (b.daysOfCover === null) return -1;
      return a.daysOfCover - b.daysOfCover;
    });
}

/**
 * Get products at warning risk level
 */
export function getWarningItems<
  T extends { daysOfCover: number | null; status: InventoryStatus },
>(items: T[]): Array<T & { risk: RiskClassification }> {
  return items
    .map((item) => ({
      ...item,
      risk: classifyStockRisk(item.daysOfCover, item.status),
    }))
    .filter((item) => item.risk.level === "warning")
    .sort((a, b) => {
      if (a.daysOfCover === null) return 1;
      if (b.daysOfCover === null) return -1;
      return a.daysOfCover - b.daysOfCover;
    });
}

// Re-export status calculation for convenience
export { calculateDaysOfCover } from "../../services/inventory/status";
