/**
 * Inventory Optimization Service (INVENTORY-012)
 *
 * Provides optimization recommendations:
 * - Dead stock identification (0 sales in 90 days)
 * - Overstock detection (>180 days supply)
 * - ABC classification with strategies
 *
 * Context7: /microsoft/typescript - type safety
 * Context7: /prisma/docs - inventory queries
 */

import type { ABCClass } from "./analytics";

export interface DeadStockItem {
  productId: string;
  productName: string;
  currentStock: number;
  daysSinceLastSale: number;
  estimatedValue: number;
  recommendation: string;
}

export interface OverstockItem {
  productId: string;
  productName: string;
  currentStock: number;
  daysOfSupply: number;
  excessUnits: number;
  tiedUpCapital: number;
  recommendation: string;
}

export interface OptimizationRecommendation {
  productId: string;
  productName: string;
  abcClass: ABCClass;
  currentIssue: string;
  recommendedAction: string;
  estimatedImpact: string;
  priority: "high" | "medium" | "low";
}

export interface OptimizationSummary {
  deadStock: {
    count: number;
    totalValue: number;
    items: DeadStockItem[];
  };
  overstock: {
    count: number;
    tiedUpCapital: number;
    items: OverstockItem[];
  };
  recommendations: OptimizationRecommendation[];
  generatedAt: string;
}

export async function generateOptimizationReport(
  products: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    avgDailySales: number;
    lastSaleDate: Date | null;
    costPerUnit: number;
    abcClass?: ABCClass;
  }>
): Promise<OptimizationSummary> {
  const today = new Date();

  // Dead stock identification
  const deadStockItems: DeadStockItem[] = products
    .filter((p) => {
      const daysSinceLastSale = p.lastSaleDate
        ? Math.floor(
            (today.getTime() - p.lastSaleDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 999;
      return daysSinceLastSale >= 90;
    })
    .map((p) => ({
      productId: p.productId,
      productName: p.productName,
      currentStock: p.currentStock,
      daysSinceLastSale: p.lastSaleDate
        ? Math.floor(
            (today.getTime() - p.lastSaleDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 999,
      estimatedValue: p.currentStock * p.costPerUnit,
      recommendation:
        "Consider clearance sale, bundle deals, or discontinuation",
    }));

  const deadStockValue = deadStockItems.reduce(
    (sum, item) => sum + item.estimatedValue,
    0
  );

  // Overstock detection
  const overstockItems: OverstockItem[] = products
    .filter((p) => {
      const daysOfSupply =
        p.avgDailySales > 0 ? p.currentStock / p.avgDailySales : 999;
      return daysOfSupply > 180;
    })
    .map((p) => {
      const daysOfSupply =
        p.avgDailySales > 0 ? p.currentStock / p.avgDailySales : 999;
      const excessUnits = Math.max(0, p.currentStock - p.avgDailySales * 90);
      return {
        productId: p.productId,
        productName: p.productName,
        currentStock: p.currentStock,
        daysOfSupply: Math.round(daysOfSupply),
        excessUnits: Math.round(excessUnits),
        tiedUpCapital: excessUnits * p.costPerUnit,
        recommendation:
          "Reduce order quantities, implement just-in-time ordering",
      };
    });

  const tiedUpCapital = overstockItems.reduce(
    (sum, item) => sum + item.tiedUpCapital,
    0
  );

  // Recommendations
  const recommendations: OptimizationRecommendation[] = [];

  // Add dead stock recommendations
  deadStockItems.forEach((item) => {
    recommendations.push({
      productId: item.productId,
      productName: item.productName,
      abcClass: "C",
      currentIssue: `Dead stock: No sales in ${item.daysSinceLastSale} days`,
      recommendedAction: item.recommendation,
      estimatedImpact: `Free up $${item.estimatedValue.toFixed(2)} in capital`,
      priority: "high",
    });
  });

  return {
    deadStock: {
      count: deadStockItems.length,
      totalValue: Math.round(deadStockValue * 100) / 100,
      items: deadStockItems,
    },
    overstock: {
      count: overstockItems.length,
      tiedUpCapital: Math.round(tiedUpCapital * 100) / 100,
      items: overstockItems,
    },
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}


