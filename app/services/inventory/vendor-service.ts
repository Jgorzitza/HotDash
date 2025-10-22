/**
 * Vendor Service Enhancement (INVENTORY-016) - Phase 10
 *
 * Provides database-integrated vendor operations with reliability tracking:
 * - Vendor metrics with recent PO history
 * - Reliability score updates on PO receipt
 * - Best vendor selection (cost/speed/reliability)
 * - UI dropdown options with formatted display
 *
 * Context7 MCP: /prisma/docs
 * - Relations: include, select with nested queries
 * - Aggregations: _count for relationship counts
 * - Transactions: $transaction for atomic updates
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get vendor with reliability metrics and recent PO history
 *
 * @param vendorId - Vendor UUID
 * @returns Vendor with calculated metrics and recent orders
 */
export async function getVendorWithMetrics(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      productMappings: true,
    },
  });

  if (!vendor) return null;

  // Fetch recent purchase orders separately (no direct relation in schema)
  const recentPurchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      vendorId,
      actualDeliveryDate: { not: null },
    },
    orderBy: { actualDeliveryDate: "desc" },
    take: 10,
  });

  // Calculate current reliability score from counters
  const onTimeRate =
    vendor.totalOrders && vendor.totalOrders > 0
      ? ((vendor.onTimeDeliveries || 0) / vendor.totalOrders) * 100
      : 0;

  // Calculate average lead time from recent orders
  const avgLeadTimeDays = calculateAvgLeadTime(recentPurchaseOrders);

  // Get last order date
  const lastOrderDate =
    recentPurchaseOrders.length > 0 ? recentPurchaseOrders[0].orderDate : null;

  return {
    ...vendor,
    purchaseOrders: recentPurchaseOrders,
    reliabilityScore: Math.round(onTimeRate * 100) / 100,
    avgLeadTimeDays,
    lastOrderDate,
  };
}

/**
 * Calculate average lead time from purchase orders
 *
 * @param purchaseOrders - Array of purchase orders with delivery dates
 * @returns Average lead time in days
 */
function calculateAvgLeadTime(
  purchaseOrders: Array<{
    orderDate: Date;
    actualDeliveryDate: Date | null;
  }>,
): number {
  const ordersWithDelivery = purchaseOrders.filter(
    (po) => po.actualDeliveryDate,
  );

  if (ordersWithDelivery.length === 0) return 0;

  const totalLeadTime = ordersWithDelivery.reduce((sum, po) => {
    const leadTimeMs =
      po.actualDeliveryDate!.getTime() - po.orderDate.getTime();
    const leadTimeDays = leadTimeMs / (1000 * 60 * 60 * 24);
    return sum + leadTimeDays;
  }, 0);

  return Math.round((totalLeadTime / ordersWithDelivery.length) * 10) / 10;
}

/**
 * Update vendor reliability score when PO received
 *
 * Algorithm: Compare actual delivery date to expected date
 * - On time: increment onTimeDeliveries
 * - Late: increment lateDeliveries
 * - Always increment totalOrders
 * - Recalculate reliabilityScore: (onTimeDeliveries / totalOrders) * 100
 *
 * @param vendorId - Vendor UUID
 * @param expectedDate - Expected delivery date from PO
 * @param actualDate - Actual delivery date (when received)
 */
export async function updateVendorReliability(
  vendorId: string,
  expectedDate: Date,
  actualDate: Date,
) {
  // Determine if on time (1 day grace period)
  const gracePeriodMs = 1 * 24 * 60 * 60 * 1000;
  const expectedWithGrace = new Date(expectedDate.getTime() + gracePeriodMs);
  const onTime = actualDate <= expectedWithGrace;

  // Get current vendor to calculate new reliability score
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: {
      totalOrders: true,
      onTimeDeliveries: true,
      lateDeliveries: true,
    },
  });

  if (!vendor) {
    throw new Error(`Vendor not found: ${vendorId}`);
  }

  // Calculate new counts
  const newTotalOrders = (vendor.totalOrders || 0) + 1;
  const newOnTimeDeliveries = (vendor.onTimeDeliveries || 0) + (onTime ? 1 : 0);
  const newLateDeliveries = (vendor.lateDeliveries || 0) + (onTime ? 0 : 1);

  // Calculate new reliability score
  const newReliabilityScore = (newOnTimeDeliveries / newTotalOrders) * 100;

  // Update vendor with new counts and score
  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      totalOrders: newTotalOrders,
      onTimeDeliveries: newOnTimeDeliveries,
      lateDeliveries: newLateDeliveries,
      reliabilityScore: Math.round(newReliabilityScore * 100) / 100, // Round to 2 decimals
    },
  });

  return {
    onTime,
    reliabilityScore: Math.round(newReliabilityScore * 100) / 100,
    totalOrders: newTotalOrders,
    onTimeDeliveries: newOnTimeDeliveries,
  };
}

/**
 * Get best vendor for product by selection criteria
 *
 * Criteria:
 * - 'cost': Lowest cost per unit
 * - 'speed': Shortest lead time
 * - 'reliability': Highest reliability score (default)
 *
 * @param variantId - Shopify variant ID
 * @param criteria - Selection criteria (cost/speed/reliability)
 * @returns Best vendor mapping or null
 */
export async function getBestVendorForProduct(
  variantId: string,
  criteria: "cost" | "speed" | "reliability" = "reliability",
) {
  // Get all vendor mappings for this variant
  const mappings = await prisma.vendorProductMapping.findMany({
    where: { variantId },
    include: {
      vendor: true,
    },
  });

  if (mappings.length === 0) return null;

  // Sort by criteria
  const sorted = [...mappings].sort((a, b) => {
    if (criteria === "cost") {
      // Lower cost is better
      return Number(a.costPerUnit) - Number(b.costPerUnit);
    }
    if (criteria === "speed") {
      // Shorter lead time is better
      return a.vendor.leadTimeDays - b.vendor.leadTimeDays;
    }
    // 'reliability' - higher score is better
    return (
      Number(b.vendor.reliabilityScore || 0) -
      Number(a.vendor.reliabilityScore || 0)
    );
  });

  return sorted[0];
}

/**
 * Get vendor dropdown options for UI (Engineer integration)
 *
 * Format: "Vendor Name (92% reliable, 7d lead, $24.99/unit)"
 *
 * @param variantId - Optional: filter to vendors for specific variant
 * @returns Array of vendor options for dropdown
 */
export async function getVendorOptions(variantId?: string) {
  // Build query based on whether variantId is provided
  if (variantId) {
    // Get vendors for specific variant
    const vendors = await prisma.vendor.findMany({
      where: {
        productMappings: { some: { variantId } },
      },
      include: {
        productMappings: {
          where: { variantId },
          take: 1,
        },
      },
    });

    // Format for UI dropdown
    return vendors.map((v) => {
      const mapping = v.productMappings[0];
      const reliabilityScore = Number(v.reliabilityScore || 0);
      const costPerUnit = Number(mapping.costPerUnit);

      const label = `${v.name} (${reliabilityScore.toFixed(0)}% reliable, ${v.leadTimeDays}d lead, $${costPerUnit.toFixed(2)}/unit)`;

      return {
        id: v.id,
        label,
        name: v.name,
        reliabilityScore,
        leadTimeDays: v.leadTimeDays,
        costPerUnit,
      };
    });
  } else {
    // Get all active vendors (no product mappings needed)
    const vendors = await prisma.vendor.findMany({
      where: { isActive: true },
    });

    // Format for UI dropdown (no cost per unit available)
    return vendors.map((v) => {
      const reliabilityScore = Number(v.reliabilityScore || 0);
      const costPerUnit = 0;

      const label = `${v.name} (${reliabilityScore.toFixed(0)}% reliable, ${v.leadTimeDays}d lead, $${costPerUnit.toFixed(2)}/unit)`;

      return {
        id: v.id,
        label,
        name: v.name,
        reliabilityScore,
        leadTimeDays: v.leadTimeDays,
        costPerUnit,
      };
    });
  }
}

/**
 * Get vendor count by reliability tier
 *
 * Tiers:
 * - Excellent: >= 95%
 * - Good: 85-94%
 * - Fair: 70-84%
 * - Poor: < 70%
 *
 * @returns Count by tier
 */
export async function getVendorReliabilityTiers() {
  const vendors = await prisma.vendor.findMany({
    select: {
      reliabilityScore: true,
    },
  });

  const tiers = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
  };

  vendors.forEach((v) => {
    const score = Number(v.reliabilityScore || 0);
    if (score >= 95) tiers.excellent++;
    else if (score >= 85) tiers.good++;
    else if (score >= 70) tiers.fair++;
    else tiers.poor++;
  });

  return tiers;
}
