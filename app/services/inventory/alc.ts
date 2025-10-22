/**
 * Average Landed Cost (ALC) Calculation Service (INVENTORY-017) - Phase 10
 *
 * Calculates ALC with freight/duty distribution BY WEIGHT:
 * - Freight distributed proportionally by total weight
 * - Duty distributed proportionally by total weight
 * - ALC includes existing inventory (weighted average)
 * - Cost history snapshots for audit trail
 *
 * Formula:
 * New_ALC = ((Previous_ALC × On_Hand_Qty) + New_Receipt_Total) / (On_Hand_Qty + New_Receipt_Qty)
 *
 * Receipt Total:
 * New_Receipt_Total = Vendor_Invoice + Freight_By_Weight + Duty_By_Weight
 *
 * Context7 MCP: /microsoft/typescript
 * - Algorithms: Weighted averages, proportional distribution
 * - Type safety: Strong typing for currency calculations
 * - Decimal precision: Proper rounding for money
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Receipt input for a single line item
 */
export interface ReceiptInput {
  variantId: string;
  qtyReceived: number;
  vendorInvoiceAmount: number; // Per unit cost from vendor
  weight: number; // Weight per unit (kg)
}

/**
 * Receipt cost breakdown after freight/duty distribution
 */
export interface ReceiptCostBreakdown {
  variantId: string;
  qtyReceived: number;
  vendorInvoiceAmount: number;
  allocatedFreight: number; // Distributed by weight
  allocatedDuty: number; // Distributed by weight
  totalReceiptCost: number; // Invoice + freight + duty
  costPerUnit: number; // totalReceiptCost / qtyReceived
}

/**
 * ALC calculation result
 */
export interface ALCResult {
  previousALC: number;
  newALC: number;
  previousOnHand: number;
  newOnHand: number;
}

/**
 * Complete receipt processing result
 */
export interface ReceiptProcessingResult {
  receiptBreakdowns: ReceiptCostBreakdown[];
  alcUpdates: Array<{
    variantId: string;
    previousALC: number;
    newALC: number;
  }>;
}

/**
 * Calculate freight distribution by weight
 *
 * Algorithm: Distribute total freight proportionally by weight
 * Weight ratio = (item total weight) / (total weight of all items)
 * Allocated freight = total freight × weight ratio
 *
 * @param receipts - Array of receipt inputs
 * @param totalFreight - Total freight cost for shipment
 * @returns Map of variantId to allocated freight
 */
function distributeFreightByWeight(
  receipts: ReceiptInput[],
  totalFreight: number,
): Map<string, number> {
  // Calculate total weight across all items
  const totalWeight = receipts.reduce(
    (sum, r) => sum + r.weight * r.qtyReceived,
    0,
  );

  // Prevent division by zero
  if (totalWeight === 0) {
    return new Map(receipts.map((r) => [r.variantId, 0]));
  }

  // Distribute freight by weight ratio
  const distribution = new Map<string, number>();
  receipts.forEach((receipt) => {
    const itemTotalWeight = receipt.weight * receipt.qtyReceived;
    const weightRatio = itemTotalWeight / totalWeight;
    const allocatedFreight = totalFreight * weightRatio;
    distribution.set(receipt.variantId, allocatedFreight);
  });

  return distribution;
}

/**
 * Calculate duty distribution by weight
 *
 * Algorithm: Same as freight - distribute proportionally by weight
 *
 * @param receipts - Array of receipt inputs
 * @param totalDuty - Total duty cost for shipment
 * @returns Map of variantId to allocated duty
 */
function distributeDutyByWeight(
  receipts: ReceiptInput[],
  totalDuty: number,
): Map<string, number> {
  // Calculate total weight across all items
  const totalWeight = receipts.reduce(
    (sum, r) => sum + r.weight * r.qtyReceived,
    0,
  );

  // Prevent division by zero
  if (totalWeight === 0) {
    return new Map(receipts.map((r) => [r.variantId, 0]));
  }

  // Distribute duty by weight ratio
  const distribution = new Map<string, number>();
  receipts.forEach((receipt) => {
    const itemTotalWeight = receipt.weight * receipt.qtyReceived;
    const weightRatio = itemTotalWeight / totalWeight;
    const allocatedDuty = totalDuty * weightRatio;
    distribution.set(receipt.variantId, allocatedDuty);
  });

  return distribution;
}

/**
 * Calculate receipt cost breakdown
 *
 * For each item:
 * 1. Vendor invoice cost (per unit × qty)
 * 2. Add allocated freight (by weight)
 * 3. Add allocated duty (by weight)
 * 4. Calculate cost per unit
 *
 * @param receipts - Array of receipt inputs
 * @param totalFreight - Total freight cost
 * @param totalDuty - Total duty cost
 * @returns Array of receipt cost breakdowns
 */
export function calculateReceiptCosts(
  receipts: ReceiptInput[],
  totalFreight: number,
  totalDuty: number,
): ReceiptCostBreakdown[] {
  const freightDistribution = distributeFreightByWeight(receipts, totalFreight);
  const dutyDistribution = distributeDutyByWeight(receipts, totalDuty);

  return receipts.map((receipt) => {
    const allocatedFreight = freightDistribution.get(receipt.variantId) || 0;
    const allocatedDuty = dutyDistribution.get(receipt.variantId) || 0;

    // Total receipt cost = vendor invoice + freight + duty
    const totalReceiptCost =
      receipt.vendorInvoiceAmount * receipt.qtyReceived +
      allocatedFreight +
      allocatedDuty;

    // Cost per unit
    const costPerUnit = totalReceiptCost / receipt.qtyReceived;

    return {
      variantId: receipt.variantId,
      qtyReceived: receipt.qtyReceived,
      vendorInvoiceAmount: receipt.vendorInvoiceAmount,
      allocatedFreight: Math.round(allocatedFreight * 100) / 100, // Round to 2 decimals
      allocatedDuty: Math.round(allocatedDuty * 100) / 100,
      totalReceiptCost: Math.round(totalReceiptCost * 100) / 100,
      costPerUnit: Math.round(costPerUnit * 100) / 100,
    };
  });
}

/**
 * Calculate new ALC (includes existing inventory)
 *
 * Formula: New_ALC = ((Previous_ALC × On_Hand_Qty) + New_Receipt_Total) / (On_Hand_Qty + New_Receipt_Qty)
 *
 * Steps:
 * 1. Get current on-hand qty from Shopify (or database)
 * 2. Get previous ALC from cost history
 * 3. Calculate weighted average
 *
 * @param variantId - Shopify variant ID
 * @param receiptCostPerUnit - Cost per unit from new receipt
 * @param receiptQty - Quantity received
 * @returns ALC calculation result
 */
export async function calculateNewALC(
  variantId: string,
  receiptCostPerUnit: number,
  receiptQty: number,
): Promise<ALCResult> {
  // Get current on-hand qty from database
  // TODO: In production, fetch from Shopify API
  // For now, use mock data or database
  const mockInventory = await getMockInventory(variantId);
  const previousOnHand = mockInventory.available || 0;

  // Get previous ALC from cost history
  const lastCostRecord = await prisma.productCostHistory.findFirst({
    where: { variantId },
    orderBy: { recordedAt: "desc" },
  });

  const previousALC = lastCostRecord
    ? Number(lastCostRecord.newAlc)
    : receiptCostPerUnit;

  // Calculate new ALC (weighted average)
  let newALC: number;

  if (previousOnHand === 0) {
    // No existing inventory - ALC is just the receipt cost
    newALC = receiptCostPerUnit;
  } else {
    // Weighted average: (prev_cost × prev_qty + new_cost × new_qty) / (prev_qty + new_qty)
    newALC =
      (previousALC * previousOnHand + receiptCostPerUnit * receiptQty) /
      (previousOnHand + receiptQty);
  }

  const newOnHand = previousOnHand + receiptQty;

  return {
    previousALC: Math.round(previousALC * 100) / 100,
    newALC: Math.round(newALC * 100) / 100,
    previousOnHand,
    newOnHand,
  };
}

/**
 * Record cost history snapshot
 *
 * Creates audit trail of ALC changes
 *
 * @param variantId - Variant ID
 * @param receiptId - Receipt/PO ID
 * @param previousALC - Previous ALC before receipt
 * @param newALC - New ALC after receipt
 * @param previousOnHand - Previous on-hand qty
 * @param newOnHand - New on-hand qty
 * @param receiptQty - Quantity received
 * @param receiptCostPerUnit - Cost per unit from receipt
 */
export async function recordCostHistory(
  variantId: string,
  receiptId: string,
  previousALC: number,
  newALC: number,
  previousOnHand: number,
  newOnHand: number,
  receiptQty: number,
  receiptCostPerUnit: number,
) {
  await prisma.productCostHistory.create({
    data: {
      variantId,
      receiptId,
      previousAlc: previousALC,
      newAlc: newALC,
      previousOnHand,
      newOnHand,
      receiptQty,
      receiptCostPerUnit,
      recordedAt: new Date(),
    },
  });
}

/**
 * Complete receiving workflow
 *
 * Process:
 * 1. Calculate receipt costs (with freight/duty distribution)
 * 2. Calculate new ALC for each variant
 * 3. Record cost history snapshots
 *
 * @param poId - Purchase order ID
 * @param receipts - Array of receipt inputs
 * @param totalFreight - Total freight cost
 * @param totalDuty - Total duty cost
 * @returns Receipt processing result
 */
export async function processReceipt(
  poId: string,
  receipts: ReceiptInput[],
  totalFreight: number,
  totalDuty: number,
): Promise<ReceiptProcessingResult> {
  // 1. Calculate receipt costs (with freight/duty distribution)
  const receiptBreakdowns = calculateReceiptCosts(
    receipts,
    totalFreight,
    totalDuty,
  );

  // 2. Calculate new ALC for each variant
  const alcUpdates: Array<{
    variantId: string;
    previousALC: number;
    newALC: number;
  }> = [];

  for (const breakdown of receiptBreakdowns) {
    const alc = await calculateNewALC(
      breakdown.variantId,
      breakdown.costPerUnit,
      breakdown.qtyReceived,
    );

    // 3. Record cost history snapshot
    await recordCostHistory(
      breakdown.variantId,
      poId, // Will be receipt ID after creation
      alc.previousALC,
      alc.newALC,
      alc.previousOnHand,
      alc.newOnHand,
      breakdown.qtyReceived,
      breakdown.costPerUnit,
    );

    alcUpdates.push({
      variantId: breakdown.variantId,
      previousALC: alc.previousALC,
      newALC: alc.newALC,
    });
  }

  return { receiptBreakdowns, alcUpdates };
}

/**
 * Mock inventory function (replace with Shopify API in production)
 *
 * @param variantId - Variant ID
 * @returns Mock inventory data
 */
async function getMockInventory(variantId: string): Promise<{
  available: number;
}> {
  // TODO: Replace with actual Shopify inventory query
  // For now, return mock data
  return {
    available: 50, // Mock: 50 units on hand
  };
}
