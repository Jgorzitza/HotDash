/**
 * Inventory Risk Detection Service
 * 
 * Detects stockout and overstock risks
 * Provides early warning for inventory issues
 */

import type { ROPResult } from './rop';
import { recordDashboardFact } from '../facts.server';
import { toInputJson } from '../json';
import type { ShopifyServiceContext } from '../shopify/types';

export interface StockoutRisk {
  sku: string;
  productId: string;
  variantId: string;
  currentQuantity: number;
  averageDailySales: number;
  daysUntilStockout: number | null;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  projectedStockoutDate: string | null;
  recommendedAction: string;
  detectedAt: string;
}

export interface OverstockRisk {
  sku: string;
  productId: string;
  variantId: string;
  currentQuantity: number;
  averageDailySales: number;
  weeksOfStock: number | null;
  riskLevel: 'low' | 'medium' | 'high';
  excessQuantity: number;
  estimatedCarryingCost?: number;
  recommendedAction: string;
  detectedAt: string;
}

export interface RiskThresholds {
  stockout: {
    criticalDays: number; // Default: 3
    highDays: number; // Default: 7
    mediumDays: number; // Default: 14
  };
  overstock: {
    highWeeks: number; // Default: 26 (6 months)
    mediumWeeks: number; // Default: 13 (3 months)
  };
}

const DEFAULT_THRESHOLDS: RiskThresholds = {
  stockout: {
    criticalDays: 3,
    highDays: 7,
    mediumDays: 14,
  },
  overstock: {
    highWeeks: 26,
    mediumWeeks: 13,
  },
};

/**
 * Calculate days until stockout
 */
function calculateDaysUntilStockout(
  currentQuantity: number,
  averageDailySales: number
): number | null {
  if (averageDailySales <= 0) {
    return null; // Can't calculate without sales data
  }

  return Number((currentQuantity / averageDailySales).toFixed(1));
}

/**
 * Calculate projected stockout date
 */
function calculateStockoutDate(daysUntilStockout: number | null): string | null {
  if (daysUntilStockout === null) {
    return null;
  }

  const date = new Date();
  date.setDate(date.getDate() + Math.floor(daysUntilStockout));
  return date.toISOString().split('T')[0];
}

/**
 * Determine stockout risk level
 */
function getStockoutRiskLevel(
  daysUntilStockout: number | null,
  thresholds: RiskThresholds['stockout']
): 'low' | 'medium' | 'high' | 'critical' {
  if (daysUntilStockout === null) {
    return 'low';
  }

  if (daysUntilStockout <= thresholds.criticalDays) {
    return 'critical';
  } else if (daysUntilStockout <= thresholds.highDays) {
    return 'high';
  } else if (daysUntilStockout <= thresholds.mediumDays) {
    return 'medium';
  }

  return 'low';
}

/**
 * Determine overstock risk level
 */
function getOverstockRiskLevel(
  weeksOfStock: number | null,
  thresholds: RiskThresholds['overstock']
): 'low' | 'medium' | 'high' {
  if (weeksOfStock === null) {
    return 'low';
  }

  if (weeksOfStock >= thresholds.highWeeks) {
    return 'high';
  } else if (weeksOfStock >= thresholds.mediumWeeks) {
    return 'medium';
  }

  return 'low';
}

/**
 * Detect stockout risk from ROP result
 */
export function detectStockoutRisk(
  ropResult: ROPResult,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS
): StockoutRisk | null {
  const daysUntilStockout = calculateDaysUntilStockout(
    ropResult.currentQuantity,
    ropResult.averageDailySales
  );

  const riskLevel = getStockoutRiskLevel(daysUntilStockout, thresholds.stockout);

  // Only report medium or higher risks
  if (riskLevel === 'low') {
    return null;
  }

  const projectedStockoutDate = calculateStockoutDate(daysUntilStockout);

  let recommendedAction = '';
  switch (riskLevel) {
    case 'critical':
      recommendedAction = 'URGENT: Expedite reorder immediately. Consider emergency supplier.';
      break;
    case 'high':
      recommendedAction = 'Place reorder within 24 hours to avoid stockout.';
      break;
    case 'medium':
      recommendedAction = 'Plan reorder within next few days.';
      break;
  }

  return {
    sku: ropResult.sku,
    productId: ropResult.productId,
    variantId: ropResult.variantId,
    currentQuantity: ropResult.currentQuantity,
    averageDailySales: ropResult.averageDailySales,
    daysUntilStockout,
    riskLevel,
    projectedStockoutDate,
    recommendedAction,
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Detect overstock risk from ROP result
 */
export function detectOverstockRisk(
  ropResult: ROPResult,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS,
  unitCost?: number
): OverstockRisk | null {
  const weeksOfStock = ropResult.weeksOfStock;

  if (weeksOfStock === null) {
    return null;
  }

  const riskLevel = getOverstockRiskLevel(weeksOfStock, thresholds.overstock);

  // Only report medium or higher risks
  if (riskLevel === 'low') {
    return null;
  }

  // Calculate excess quantity (anything above 12 weeks is considered excess)
  const targetWeeks = 12;
  const targetQuantity = ropResult.averageDailySales * targetWeeks * 7;
  const excessQuantity = Math.max(0, Math.floor(ropResult.currentQuantity - targetQuantity));

  // Estimate carrying cost (if unit cost provided)
  // Typical carrying cost: 20-30% of inventory value per year
  const estimatedCarryingCost = unitCost
    ? Number((excessQuantity * unitCost * 0.25).toFixed(2))
    : undefined;

  let recommendedAction = '';
  switch (riskLevel) {
    case 'high':
      recommendedAction = 'Consider promotional pricing or bundle deals to reduce excess inventory.';
      break;
    case 'medium':
      recommendedAction = 'Monitor closely. Reduce future order quantities.';
      break;
  }

  return {
    sku: ropResult.sku,
    productId: ropResult.productId,
    variantId: ropResult.variantId,
    currentQuantity: ropResult.currentQuantity,
    averageDailySales: ropResult.averageDailySales,
    weeksOfStock,
    riskLevel,
    excessQuantity,
    estimatedCarryingCost,
    recommendedAction,
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Detect all risks for multiple products
 */
export function detectBulkRisks(
  ropResults: ROPResult[],
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS,
  unitCosts?: Map<string, number>
): {
  stockoutRisks: StockoutRisk[];
  overstockRisks: OverstockRisk[];
} {
  const stockoutRisks: StockoutRisk[] = [];
  const overstockRisks: OverstockRisk[] = [];

  for (const result of ropResults) {
    const stockoutRisk = detectStockoutRisk(result, thresholds);
    if (stockoutRisk) {
      stockoutRisks.push(stockoutRisk);
    }

    const unitCost = unitCosts?.get(result.sku);
    const overstockRisk = detectOverstockRisk(result, thresholds, unitCost);
    if (overstockRisk) {
      overstockRisks.push(overstockRisk);
    }
  }

  return { stockoutRisks, overstockRisks };
}

/**
 * Get risk summary statistics
 */
export function getRiskSummary(
  stockoutRisks: StockoutRisk[],
  overstockRisks: OverstockRisk[]
): {
  stockout: {
    total: number;
    critical: number;
    high: number;
    medium: number;
  };
  overstock: {
    total: number;
    high: number;
    medium: number;
    totalExcessUnits: number;
    estimatedCarryingCost: number;
  };
} {
  return {
    stockout: {
      total: stockoutRisks.length,
      critical: stockoutRisks.filter(r => r.riskLevel === 'critical').length,
      high: stockoutRisks.filter(r => r.riskLevel === 'high').length,
      medium: stockoutRisks.filter(r => r.riskLevel === 'medium').length,
    },
    overstock: {
      total: overstockRisks.length,
      high: overstockRisks.filter(r => r.riskLevel === 'high').length,
      medium: overstockRisks.filter(r => r.riskLevel === 'medium').length,
      totalExcessUnits: overstockRisks.reduce((sum, r) => sum + r.excessQuantity, 0),
      estimatedCarryingCost: overstockRisks.reduce(
        (sum, r) => sum + (r.estimatedCarryingCost || 0),
        0
      ),
    },
  };
}

/**
 * Record risks to Supabase
 */
export async function recordRisks(
  context: ShopifyServiceContext,
  stockoutRisks: StockoutRisk[],
  overstockRisks: OverstockRisk[]
): Promise<void> {
  const summary = getRiskSummary(stockoutRisks, overstockRisks);

  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: 'inventory.risks.detected',
    scope: 'ops',
    value: toInputJson(summary),
    metadata: toInputJson({
      stockoutRisks: summary.stockout.total,
      overstockRisks: summary.overstock.total,
      detectedAt: new Date().toISOString(),
    }),
  });
}

