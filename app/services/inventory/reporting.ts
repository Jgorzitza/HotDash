/**
 * Inventory Reporting & Metrics Service
 * 
 * Generates forecast vs actuals reports and tracks stockout reduction KPIs
 * Provides performance metrics for inventory management
 */

import type { ROPResult } from './rop';
import { recordDashboardFact } from '../facts.server';
import { toInputJson } from '../json';
import type { ShopifyServiceContext } from '../shopify/types';

export interface ForecastActual {
  sku: string;
  productId: string;
  period: string; // YYYY-MM-DD
  forecastQuantity: number;
  actualQuantity: number;
  variance: number;
  variancePercent: number;
  accuracy: number; // 0-100%
}

export interface StockoutMetrics {
  period: string;
  totalProducts: number;
  stockoutCount: number;
  stockoutRate: number; // Percentage
  stockoutDays: number; // Total days products were out of stock
  averageStockoutDuration: number; // Days
  preventedStockouts: number; // Estimated based on ROP
  reductionRate: number; // Percentage improvement
}

export interface InventoryPerformance {
  period: string;
  averageDaysOfCover: number;
  averageWeeksOfStock: number;
  turnoverRate: number;
  fillRate: number; // Percentage of orders fulfilled
  inventoryAccuracy: number; // Percentage
  carryingCost: number;
  stockoutCost: number;
}

export interface KPISnapshot {
  date: string;
  stockoutRate: number;
  fillRate: number;
  inventoryTurnover: number;
  daysOfCover: number;
  forecastAccuracy: number;
  ropEffectiveness: number; // Percentage of stockouts prevented
}

/**
 * Calculate forecast variance
 */
export function calculateForecastVariance(
  forecast: number,
  actual: number
): {
  variance: number;
  variancePercent: number;
  accuracy: number;
} {
  const variance = actual - forecast;
  const variancePercent = forecast > 0 ? (variance / forecast) * 100 : 0;
  const accuracy = forecast > 0 ? Math.max(0, 100 - Math.abs(variancePercent)) : 0;

  return {
    variance,
    variancePercent: Number(variancePercent.toFixed(2)),
    accuracy: Number(accuracy.toFixed(2)),
  };
}

/**
 * Generate forecast vs actuals report
 */
export function generateForecastReport(
  forecasts: Array<{
    sku: string;
    productId: string;
    period: string;
    forecastQuantity: number;
    actualQuantity: number;
  }>
): ForecastActual[] {
  return forecasts.map(f => {
    const { variance, variancePercent, accuracy } = calculateForecastVariance(
      f.forecastQuantity,
      f.actualQuantity
    );

    return {
      sku: f.sku,
      productId: f.productId,
      period: f.period,
      forecastQuantity: f.forecastQuantity,
      actualQuantity: f.actualQuantity,
      variance,
      variancePercent,
      accuracy,
    };
  });
}

/**
 * Calculate forecast accuracy summary
 */
export function getForecastAccuracySummary(
  forecasts: ForecastActual[]
): {
  averageAccuracy: number;
  medianAccuracy: number;
  totalVariance: number;
  overForecastCount: number;
  underForecastCount: number;
  perfectForecastCount: number;
} {
  if (forecasts.length === 0) {
    return {
      averageAccuracy: 0,
      medianAccuracy: 0,
      totalVariance: 0,
      overForecastCount: 0,
      underForecastCount: 0,
      perfectForecastCount: 0,
    };
  }

  const accuracies = forecasts.map(f => f.accuracy).sort((a, b) => a - b);
  const averageAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  const medianAccuracy = accuracies[Math.floor(accuracies.length / 2)];
  const totalVariance = forecasts.reduce((sum, f) => sum + Math.abs(f.variance), 0);

  return {
    averageAccuracy: Number(averageAccuracy.toFixed(2)),
    medianAccuracy: Number(medianAccuracy.toFixed(2)),
    totalVariance,
    overForecastCount: forecasts.filter(f => f.variance < 0).length,
    underForecastCount: forecasts.filter(f => f.variance > 0).length,
    perfectForecastCount: forecasts.filter(f => f.variance === 0).length,
  };
}

/**
 * Calculate stockout metrics
 */
export function calculateStockoutMetrics(
  period: string,
  stockoutEvents: Array<{
    sku: string;
    startDate: string;
    endDate: string;
    preventable: boolean;
  }>,
  totalProducts: number
): StockoutMetrics {
  const stockoutCount = stockoutEvents.length;
  const stockoutRate = totalProducts > 0 ? (stockoutCount / totalProducts) * 100 : 0;

  // Calculate total stockout days
  let stockoutDays = 0;
  for (const event of stockoutEvents) {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    stockoutDays += days;
  }

  const averageStockoutDuration = stockoutCount > 0 ? stockoutDays / stockoutCount : 0;
  const preventedStockouts = stockoutEvents.filter(e => e.preventable).length;
  const reductionRate = stockoutCount > 0 ? (preventedStockouts / stockoutCount) * 100 : 0;

  return {
    period,
    totalProducts,
    stockoutCount,
    stockoutRate: Number(stockoutRate.toFixed(2)),
    stockoutDays,
    averageStockoutDuration: Number(averageStockoutDuration.toFixed(1)),
    preventedStockouts,
    reductionRate: Number(reductionRate.toFixed(2)),
  };
}

/**
 * Calculate inventory performance metrics
 */
export function calculateInventoryPerformance(
  period: string,
  ropResults: ROPResult[],
  salesData: {
    totalSales: number;
    totalOrders: number;
    fulfilledOrders: number;
  },
  costs: {
    averageInventoryValue: number;
    carryingCostRate: number; // e.g., 0.25 for 25%
    stockoutCostPerUnit: number;
  }
): InventoryPerformance {
  // Average days/weeks of cover
  const resultsWithCover = ropResults.filter(r => r.daysOfCover !== null);
  const averageDaysOfCover = resultsWithCover.length > 0
    ? resultsWithCover.reduce((sum, r) => sum + (r.daysOfCover || 0), 0) / resultsWithCover.length
    : 0;
  const averageWeeksOfStock = averageDaysOfCover / 7;

  // Turnover rate (COGS / Average Inventory Value)
  // Simplified: Total Sales / Average Inventory Value
  const turnoverRate = costs.averageInventoryValue > 0
    ? salesData.totalSales / costs.averageInventoryValue
    : 0;

  // Fill rate
  const fillRate = salesData.totalOrders > 0
    ? (salesData.fulfilledOrders / salesData.totalOrders) * 100
    : 100;

  // Inventory accuracy (simplified - would need cycle count data)
  const inventoryAccuracy = 95; // Placeholder

  // Carrying cost
  const carryingCost = costs.averageInventoryValue * costs.carryingCostRate;

  // Stockout cost (estimated)
  const stockoutCount = ropResults.filter(r => r.statusBucket === 'out_of_stock').length;
  const stockoutCost = stockoutCount * costs.stockoutCostPerUnit;

  return {
    period,
    averageDaysOfCover: Number(averageDaysOfCover.toFixed(1)),
    averageWeeksOfStock: Number(averageWeeksOfStock.toFixed(2)),
    turnoverRate: Number(turnoverRate.toFixed(2)),
    fillRate: Number(fillRate.toFixed(2)),
    inventoryAccuracy,
    carryingCost: Number(carryingCost.toFixed(2)),
    stockoutCost: Number(stockoutCost.toFixed(2)),
  };
}

/**
 * Generate KPI snapshot
 */
export function generateKPISnapshot(
  stockoutMetrics: StockoutMetrics,
  performance: InventoryPerformance,
  forecastAccuracy: number,
  ropEffectiveness: number
): KPISnapshot {
  return {
    date: new Date().toISOString().split('T')[0],
    stockoutRate: stockoutMetrics.stockoutRate,
    fillRate: performance.fillRate,
    inventoryTurnover: performance.turnoverRate,
    daysOfCover: performance.averageDaysOfCover,
    forecastAccuracy,
    ropEffectiveness,
  };
}

/**
 * Calculate ROP effectiveness
 * Percentage of potential stockouts prevented by ROP system
 */
export function calculateROPEffectiveness(
  totalReorderSuggestions: number,
  preventedStockouts: number
): number {
  if (totalReorderSuggestions === 0) {
    return 0;
  }

  return Number(((preventedStockouts / totalReorderSuggestions) * 100).toFixed(2));
}

/**
 * Get trend analysis
 */
export function getTrendAnalysis(
  snapshots: KPISnapshot[]
): {
  stockoutTrend: 'improving' | 'stable' | 'declining';
  fillRateTrend: 'improving' | 'stable' | 'declining';
  turnoverTrend: 'improving' | 'stable' | 'declining';
} {
  if (snapshots.length < 2) {
    return {
      stockoutTrend: 'stable',
      fillRateTrend: 'stable',
      turnoverTrend: 'stable',
    };
  }

  const recent = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2];

  const stockoutChange = recent.stockoutRate - previous.stockoutRate;
  const fillRateChange = recent.fillRate - previous.fillRate;
  const turnoverChange = recent.inventoryTurnover - previous.inventoryTurnover;

  return {
    stockoutTrend: stockoutChange < -1 ? 'improving' : stockoutChange > 1 ? 'declining' : 'stable',
    fillRateTrend: fillRateChange > 1 ? 'improving' : fillRateChange < -1 ? 'declining' : 'stable',
    turnoverTrend: turnoverChange > 0.1 ? 'improving' : turnoverChange < -0.1 ? 'declining' : 'stable',
  };
}

/**
 * Record metrics to Supabase
 */
export async function recordMetrics(
  context: ShopifyServiceContext,
  snapshot: KPISnapshot
): Promise<void> {
  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: 'inventory.metrics.snapshot',
    scope: 'ops',
    value: toInputJson(snapshot),
    metadata: toInputJson({
      date: snapshot.date,
      stockoutRate: snapshot.stockoutRate,
      fillRate: snapshot.fillRate,
    }),
  });
}

