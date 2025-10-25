import { generateOptimizationReport } from "./optimization";
import type {
  OptimizationSummary,
  ROPAlertItem,
} from "./optimization";

export type InventoryHealthStatus = "healthy" | "warning" | "critical";

export interface InventoryHealthMetrics {
  overallHealth: InventoryHealthStatus;
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  overstock: number;
  activeAlerts: number;
  criticalAlerts: number;
  ropCompliance: number;
  avgDaysToStockout: number;
  emergencySourcingNeeded: number;
  lastUpdated: string;
}

export interface InventoryHealthSnapshot {
  metrics: InventoryHealthMetrics;
  ropAlerts: ROPAlertItem[];
  summary: OptimizationSummary;
}

function determineOverallHealth({
  criticalAlerts,
  lowStock,
  ropCompliance,
  emergencySourcingNeeded,
}: {
  criticalAlerts: number;
  lowStock: number;
  ropCompliance: number;
  emergencySourcingNeeded: number;
}): InventoryHealthStatus {
  if (criticalAlerts > 0 || ropCompliance < 75) {
    return "critical";
  }

  if (lowStock > 10 || ropCompliance < 90 || emergencySourcingNeeded > 0) {
    return "warning";
  }

  return "healthy";
}

export async function getInventoryHealthSnapshot(): Promise<InventoryHealthSnapshot> {
  const report = await generateOptimizationReport();

  const totalProducts =
    report.abcBreakdown.products.length ||
    report.recommendations.length ||
    0;

  const ropAlerts = report.ropAlerts.items;

  const counts = ropAlerts.reduce(
    (acc, alert) => {
      if (alert.status === "out_of_stock") {
        acc.outOfStock += 1;
        acc.criticalAlerts += 1;
      }

      if (alert.status === "urgent_reorder") {
        acc.urgent += 1;
        acc.criticalAlerts += 1;
      }

      if (alert.status === "low_stock") {
        acc.lowStock += 1;
      }

      if ((alert.daysUntilStockout ?? 999) < 7) {
        acc.emergencySourcing += 1;
      }

      if (alert.status !== "in_stock") {
        acc.alerts += 1;
      }

      if (alert.daysUntilStockout !== null) {
        acc.stockoutDays.push(alert.daysUntilStockout);
      }

      return acc;
    },
    {
      urgent: 0,
      lowStock: 0,
      outOfStock: 0,
      alerts: 0,
      criticalAlerts: report.deadStock.count + report.overstock.count,
      emergencySourcing: 0,
      stockoutDays: [] as number[],
    },
  );

  const inStock = Math.max(
    totalProducts - (counts.lowStock + counts.urgent + counts.outOfStock),
    0,
  );

  const avgDaysToStockout =
    counts.stockoutDays.length > 0
      ?
          counts.stockoutDays.reduce((sum, days) => sum + days, 0) /
          counts.stockoutDays.length
      : 0;

  const ropCompliance =
    totalProducts > 0
      ?
          Math.max(0, ((totalProducts - report.ropAlerts.count) / totalProducts) * 100)
      : 100;

  const metrics: InventoryHealthMetrics = {
    overallHealth: determineOverallHealth({
      criticalAlerts: counts.criticalAlerts,
      lowStock: counts.lowStock,
      ropCompliance,
      emergencySourcingNeeded: counts.emergencySourcing,
    }),
    totalProducts,
    inStock,
    lowStock: counts.lowStock,
    outOfStock: counts.outOfStock,
    overstock: report.overstock.count,
    activeAlerts:
      report.ropAlerts.count +
      report.deadStock.count +
      report.overstock.count +
      report.slowMovers.count,
    criticalAlerts: counts.criticalAlerts,
    ropCompliance: Number(ropCompliance.toFixed(1)),
    avgDaysToStockout: Number(avgDaysToStockout.toFixed(1)),
    emergencySourcingNeeded: counts.emergencySourcing,
    lastUpdated: new Date().toISOString(),
  };

  return {
    metrics,
    ropAlerts,
    summary: report,
  };
}
