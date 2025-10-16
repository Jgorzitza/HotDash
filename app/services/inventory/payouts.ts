/**
 * Picker Payout Calculation Service
 * 
 * Calculates picker compensation based on total pick quantity per order
 * Brackets: 1-4 pcs ($2), 5-10 pcs ($4), 11+ pcs ($7)
 */

import { calculatePickerPayout, calculatePickerPieces, getPickerPayoutBracket } from './kits';
import { recordDashboardFact } from '../facts.server';
import { toInputJson } from '../json';
import type { ShopifyServiceContext } from '../shopify/types';

export interface PayoutLineItem {
  sku: string;
  quantity: number;
  packCount: number;
  pieces: number;
}

export interface PayoutCalculation {
  orderId: string;
  pickerId?: string;
  totalPieces: number;
  bracket: '1-4' | '5-10' | '11+';
  payoutAmount: number;
  lineItems: PayoutLineItem[];
  calculatedAt: string;
}

/**
 * Calculate payout for a single order
 */
export function calculateOrderPayout(
  orderId: string,
  lineItems: Array<{
    sku: string;
    quantity: number;
    packCount: number;
  }>,
  pickerId?: string
): PayoutCalculation {
  const result = calculatePickerPayout(lineItems);

  return {
    orderId,
    pickerId,
    totalPieces: result.totalPieces,
    bracket: result.bracket,
    payoutAmount: result.payoutAmount,
    lineItems: result.lineItemBreakdown,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate payouts for multiple orders
 */
export function calculateBulkPayouts(
  orders: Array<{
    orderId: string;
    pickerId?: string;
    lineItems: Array<{
      sku: string;
      quantity: number;
      packCount: number;
    }>;
  }>
): PayoutCalculation[] {
  return orders.map(order => 
    calculateOrderPayout(order.orderId, order.lineItems, order.pickerId)
  );
}

/**
 * Get payout summary for a picker
 */
export function getPickerPayoutSummary(
  payouts: PayoutCalculation[],
  pickerId: string
): {
  pickerId: string;
  totalOrders: number;
  totalPieces: number;
  totalPayout: number;
  averagePayoutPerOrder: number;
  bracketBreakdown: {
    '1-4': number;
    '5-10': number;
    '11+': number;
  };
} {
  const pickerPayouts = payouts.filter(p => p.pickerId === pickerId);

  const totalOrders = pickerPayouts.length;
  const totalPieces = pickerPayouts.reduce((sum, p) => sum + p.totalPieces, 0);
  const totalPayout = pickerPayouts.reduce((sum, p) => sum + p.payoutAmount, 0);
  const averagePayoutPerOrder = totalOrders > 0 ? totalPayout / totalOrders : 0;

  const bracketBreakdown = {
    '1-4': pickerPayouts.filter(p => p.bracket === '1-4').length,
    '5-10': pickerPayouts.filter(p => p.bracket === '5-10').length,
    '11+': pickerPayouts.filter(p => p.bracket === '11+').length,
  };

  return {
    pickerId,
    totalOrders,
    totalPieces,
    totalPayout: Number(totalPayout.toFixed(2)),
    averagePayoutPerOrder: Number(averagePayoutPerOrder.toFixed(2)),
    bracketBreakdown,
  };
}

/**
 * Record payout calculation to Supabase
 */
export async function recordPayoutCalculation(
  context: ShopifyServiceContext,
  payout: PayoutCalculation
): Promise<void> {
  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: 'inventory.payout.calculated',
    scope: 'ops',
    value: toInputJson(payout),
    metadata: toInputJson({
      orderId: payout.orderId,
      pickerId: payout.pickerId,
      bracket: payout.bracket,
      payoutAmount: payout.payoutAmount,
      calculatedAt: payout.calculatedAt,
    }),
  });
}

// Re-export from kits for convenience
export { calculatePickerPieces, getPickerPayoutBracket };

