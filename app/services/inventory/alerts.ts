/**
 * Low Stock Alerts Service
 * 
 * Generates alerts when WOS (Weeks of Stock) falls below threshold
 * Integrates with ROP calculations for proactive alerting
 */

import type { ROPResult } from './rop';
import { recordDashboardFact } from '../facts.server';
import { toInputJson } from '../json';
import type { ShopifyServiceContext } from '../shopify/types';

export interface StockAlert {
  sku: string;
  productId: string;
  variantId: string;
  alertType: 'low_stock' | 'urgent_reorder' | 'out_of_stock';
  currentQuantity: number;
  rop: number;
  daysOfCover: number | null;
  weeksOfStock: number | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  generatedAt: string;
}

export interface AlertThresholds {
  lowStockWeeks?: number; // Default: 2 weeks
  urgentWeeks?: number; // Default: 1 week
}

/**
 * Determine alert severity based on status bucket
 */
function getAlertSeverity(
  statusBucket: string
): 'low' | 'medium' | 'high' | 'critical' {
  switch (statusBucket) {
    case 'out_of_stock':
      return 'critical';
    case 'urgent_reorder':
      return 'high';
    case 'low_stock':
      return 'medium';
    default:
      return 'low';
  }
}

/**
 * Generate alert message
 */
function generateAlertMessage(
  sku: string,
  statusBucket: string,
  currentQuantity: number,
  rop: number,
  weeksOfStock: number | null
): string {
  switch (statusBucket) {
    case 'out_of_stock':
      return `${sku} is OUT OF STOCK. Reorder immediately.`;
    case 'urgent_reorder':
      return `${sku} is critically low (${currentQuantity} units, ${weeksOfStock?.toFixed(1) || 'N/A'} weeks). Urgent reorder needed.`;
    case 'low_stock':
      return `${sku} is below reorder point (${currentQuantity} units, ROP: ${rop}). Plan reorder soon.`;
    default:
      return `${sku} stock level requires attention.`;
  }
}

/**
 * Generate stock alert from ROP result
 */
export function generateStockAlert(ropResult: ROPResult): StockAlert | null {
  // Only generate alerts for products that need reordering
  if (!ropResult.shouldReorder) {
    return null;
  }

  const alertType = ropResult.statusBucket as 'low_stock' | 'urgent_reorder' | 'out_of_stock';
  const severity = getAlertSeverity(ropResult.statusBucket);
  const message = generateAlertMessage(
    ropResult.sku,
    ropResult.statusBucket,
    ropResult.currentQuantity,
    ropResult.rop,
    ropResult.weeksOfStock
  );

  return {
    sku: ropResult.sku,
    productId: ropResult.productId,
    variantId: ropResult.variantId,
    alertType,
    currentQuantity: ropResult.currentQuantity,
    rop: ropResult.rop,
    daysOfCover: ropResult.daysOfCover,
    weeksOfStock: ropResult.weeksOfStock,
    severity,
    message,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate alerts for multiple products
 */
export function generateBulkAlerts(ropResults: ROPResult[]): StockAlert[] {
  return ropResults
    .map(generateStockAlert)
    .filter((alert): alert is StockAlert => alert !== null);
}

/**
 * Filter alerts by severity
 */
export function filterAlertsBySeverity(
  alerts: StockAlert[],
  minSeverity: 'low' | 'medium' | 'high' | 'critical'
): StockAlert[] {
  const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
  const minLevel = severityOrder[minSeverity];

  return alerts.filter(alert => severityOrder[alert.severity] >= minLevel);
}

/**
 * Filter alerts by weeks of stock threshold
 */
export function filterAlertsByWOS(
  alerts: StockAlert[],
  maxWeeks: number
): StockAlert[] {
  return alerts.filter(alert => {
    if (alert.weeksOfStock === null) {
      return true; // Include if WOS can't be calculated (likely out of stock)
    }
    return alert.weeksOfStock <= maxWeeks;
  });
}

/**
 * Sort alerts by priority (severity, then WOS)
 */
export function sortAlertsByPriority(alerts: StockAlert[]): StockAlert[] {
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  return [...alerts].sort((a, b) => {
    // First sort by severity
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }

    // Then by weeks of stock (ascending, nulls first)
    if (a.weeksOfStock === null && b.weeksOfStock === null) return 0;
    if (a.weeksOfStock === null) return -1;
    if (b.weeksOfStock === null) return 1;
    return a.weeksOfStock - b.weeksOfStock;
  });
}

/**
 * Get alert summary statistics
 */
export function getAlertSummary(alerts: StockAlert[]): {
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byType: {
    out_of_stock: number;
    urgent_reorder: number;
    low_stock: number;
  };
  averageWOS: number | null;
} {
  const bySeverity = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
  };

  const byType = {
    out_of_stock: alerts.filter(a => a.alertType === 'out_of_stock').length,
    urgent_reorder: alerts.filter(a => a.alertType === 'urgent_reorder').length,
    low_stock: alerts.filter(a => a.alertType === 'low_stock').length,
  };

  const alertsWithWOS = alerts.filter(a => a.weeksOfStock !== null);
  const averageWOS = alertsWithWOS.length > 0
    ? alertsWithWOS.reduce((sum, a) => sum + (a.weeksOfStock || 0), 0) / alertsWithWOS.length
    : null;

  return {
    total: alerts.length,
    bySeverity,
    byType,
    averageWOS: averageWOS !== null ? Number(averageWOS.toFixed(2)) : null,
  };
}

/**
 * Record alerts to Supabase
 */
export async function recordStockAlerts(
  context: ShopifyServiceContext,
  alerts: StockAlert[]
): Promise<void> {
  const summary = getAlertSummary(alerts);

  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: 'inventory.alerts.generated',
    scope: 'ops',
    value: toInputJson(summary),
    metadata: toInputJson({
      totalAlerts: summary.total,
      criticalAlerts: summary.bySeverity.critical,
      generatedAt: new Date().toISOString(),
    }),
  });

  // Record individual critical alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  for (const alert of criticalAlerts) {
    await recordDashboardFact({
      shopDomain: context.shopDomain,
      factType: 'inventory.alert.critical',
      scope: 'ops',
      value: toInputJson(alert),
      metadata: toInputJson({
        sku: alert.sku,
        alertType: alert.alertType,
        generatedAt: alert.generatedAt,
      }),
    });
  }
}

/**
 * Check if alert should trigger notification
 */
export function shouldNotify(
  alert: StockAlert,
  thresholds: AlertThresholds = {}
): boolean {
  const { lowStockWeeks = 2, urgentWeeks = 1 } = thresholds;

  // Always notify for out of stock
  if (alert.alertType === 'out_of_stock') {
    return true;
  }

  // Notify for urgent if below urgent threshold
  if (alert.alertType === 'urgent_reorder') {
    return alert.weeksOfStock === null || alert.weeksOfStock <= urgentWeeks;
  }

  // Notify for low stock if below low stock threshold
  if (alert.alertType === 'low_stock') {
    return alert.weeksOfStock === null || alert.weeksOfStock <= lowStockWeeks;
  }

  return false;
}

