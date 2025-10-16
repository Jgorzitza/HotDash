/**
 * Inventory Tile UI Hooks
 * 
 * Provides data hooks for dashboard tiles
 * Formats data for UI consumption
 */

import type { ROPResult } from './rop';
import type { StockAlert } from './alerts';
import type { ReorderSuggestion } from './suggestions';
import type { StockoutRisk, OverstockRisk } from './risk-detection';

export interface InventoryTileData {
  summary: {
    totalProducts: number;
    inStock: number;
    lowStock: number;
    urgentReorder: number;
    outOfStock: number;
    averageWOS: number;
  };
  alerts: {
    total: number;
    critical: number;
    high: number;
    recentAlerts: StockAlert[];
  };
  suggestions: {
    total: number;
    highPriority: number;
    estimatedValue: number;
    topSuggestions: ReorderSuggestion[];
  };
  risks: {
    stockoutRisks: number;
    overstockRisks: number;
    criticalStockouts: number;
  };
  trends: {
    stockoutRate: number;
    stockoutTrend: 'up' | 'down' | 'stable';
    fillRate: number;
    fillRateTrend: 'up' | 'down' | 'stable';
  };
}

export interface HeatmapData {
  sku: string;
  productTitle: string;
  currentQuantity: number;
  rop: number;
  statusBucket: 'in_stock' | 'low_stock' | 'urgent_reorder' | 'out_of_stock';
  weeksOfStock: number | null;
  color: string; // Hex color for heatmap
  priority: number; // 1-10 for sorting
}

export interface AlertWidgetData {
  alert: StockAlert;
  actionLabel: string;
  actionUrl: string;
  icon: string;
  colorClass: string;
}

/**
 * Generate inventory tile data
 */
export function generateInventoryTileData(
  ropResults: ROPResult[],
  alerts: StockAlert[],
  suggestions: ReorderSuggestion[],
  stockoutRisks: StockoutRisk[],
  overstockRisks: OverstockRisk[]
): InventoryTileData {
  // Summary
  const summary = {
    totalProducts: ropResults.length,
    inStock: ropResults.filter(r => r.statusBucket === 'in_stock').length,
    lowStock: ropResults.filter(r => r.statusBucket === 'low_stock').length,
    urgentReorder: ropResults.filter(r => r.statusBucket === 'urgent_reorder').length,
    outOfStock: ropResults.filter(r => r.statusBucket === 'out_of_stock').length,
    averageWOS: calculateAverageWOS(ropResults),
  };

  // Alerts
  const alertsData = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    recentAlerts: alerts.slice(0, 5), // Top 5 most recent
  };

  // Suggestions
  const suggestionsData = {
    total: suggestions.length,
    highPriority: suggestions.filter(s => s.priority >= 7).length,
    estimatedValue: suggestions.reduce((sum, s) => sum + (s.estimatedCost || 0), 0),
    topSuggestions: suggestions.slice(0, 5), // Top 5 by priority
  };

  // Risks
  const risksData = {
    stockoutRisks: stockoutRisks.length,
    overstockRisks: overstockRisks.length,
    criticalStockouts: stockoutRisks.filter(r => r.riskLevel === 'critical').length,
  };

  // Trends (placeholder - would need historical data)
  const trendsData = {
    stockoutRate: (summary.outOfStock / summary.totalProducts) * 100,
    stockoutTrend: 'stable' as const,
    fillRate: 95.5,
    fillRateTrend: 'up' as const,
  };

  return {
    summary,
    alerts: alertsData,
    suggestions: suggestionsData,
    risks: risksData,
    trends: trendsData,
  };
}

/**
 * Calculate average weeks of stock
 */
function calculateAverageWOS(ropResults: ROPResult[]): number {
  const resultsWithWOS = ropResults.filter(r => r.weeksOfStock !== null);
  if (resultsWithWOS.length === 0) return 0;

  const sum = resultsWithWOS.reduce((acc, r) => acc + (r.weeksOfStock || 0), 0);
  return Number((sum / resultsWithWOS.length).toFixed(2));
}

/**
 * Generate heatmap data
 */
export function generateHeatmapData(
  ropResults: ROPResult[],
  productTitles?: Map<string, string>
): HeatmapData[] {
  return ropResults.map(result => {
    const title = productTitles?.get(result.sku) || result.sku;
    const color = getStatusColor(result.statusBucket);
    const priority = getStatusPriority(result.statusBucket);

    return {
      sku: result.sku,
      productTitle: title,
      currentQuantity: result.currentQuantity,
      rop: result.rop,
      statusBucket: result.statusBucket,
      weeksOfStock: result.weeksOfStock,
      color,
      priority,
    };
  }).sort((a, b) => b.priority - a.priority); // Sort by priority descending
}

/**
 * Get color for status bucket
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'in_stock':
      return '#10b981'; // Green
    case 'low_stock':
      return '#f59e0b'; // Yellow
    case 'urgent_reorder':
      return '#f97316'; // Orange
    case 'out_of_stock':
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
}

/**
 * Get priority for status bucket
 */
function getStatusPriority(status: string): number {
  switch (status) {
    case 'out_of_stock':
      return 10;
    case 'urgent_reorder':
      return 8;
    case 'low_stock':
      return 5;
    case 'in_stock':
      return 1;
    default:
      return 0;
  }
}

/**
 * Format alert for widget display
 */
export function formatAlertForWidget(alert: StockAlert): AlertWidgetData {
  let actionLabel = '';
  let actionUrl = '';
  let icon = '';
  let colorClass = '';

  switch (alert.severity) {
    case 'critical':
      actionLabel = 'Reorder Now';
      actionUrl = `/inventory/reorder/${alert.sku}`;
      icon = 'alert-circle';
      colorClass = 'text-red-600 bg-red-50';
      break;
    case 'high':
      actionLabel = 'Plan Reorder';
      actionUrl = `/inventory/reorder/${alert.sku}`;
      icon = 'alert-triangle';
      colorClass = 'text-orange-600 bg-orange-50';
      break;
    case 'medium':
      actionLabel = 'Review';
      actionUrl = `/inventory/product/${alert.sku}`;
      icon = 'info';
      colorClass = 'text-yellow-600 bg-yellow-50';
      break;
    default:
      actionLabel = 'View';
      actionUrl = `/inventory/product/${alert.sku}`;
      icon = 'info';
      colorClass = 'text-gray-600 bg-gray-50';
  }

  return {
    alert,
    actionLabel,
    actionUrl,
    icon,
    colorClass,
  };
}

/**
 * Get inventory health score (0-100)
 */
export function calculateInventoryHealthScore(
  ropResults: ROPResult[]
): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    stockoutRate: number;
    lowStockRate: number;
    averageWOS: number;
  };
} {
  const total = ropResults.length;
  if (total === 0) {
    return {
      score: 0,
      grade: 'F',
      factors: { stockoutRate: 0, lowStockRate: 0, averageWOS: 0 },
    };
  }

  const outOfStock = ropResults.filter(r => r.statusBucket === 'out_of_stock').length;
  const lowStock = ropResults.filter(r => r.statusBucket === 'low_stock').length;
  const urgentReorder = ropResults.filter(r => r.statusBucket === 'urgent_reorder').length;

  const stockoutRate = (outOfStock / total) * 100;
  const lowStockRate = ((lowStock + urgentReorder) / total) * 100;
  const averageWOS = calculateAverageWOS(ropResults);

  // Calculate score (0-100)
  let score = 100;
  score -= stockoutRate * 5; // -5 points per % stockout
  score -= lowStockRate * 2; // -2 points per % low stock
  score -= Math.max(0, (12 - averageWOS) * 2); // Penalty if WOS < 12 weeks

  score = Math.max(0, Math.min(100, score));

  // Assign grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return {
    score: Number(score.toFixed(1)),
    grade,
    factors: {
      stockoutRate: Number(stockoutRate.toFixed(2)),
      lowStockRate: Number(lowStockRate.toFixed(2)),
      averageWOS,
    },
  };
}

/**
 * Format number for display
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

