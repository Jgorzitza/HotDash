/**
 * Emergency Sourcing Service (INVENTORY-019) - Phase 11
 *
 * Recommends local fast vendor when opportunity cost of stockout exceeds incremental cost
 *
 * Algorithm:
 * ELP (Expected Lost Profit) = feasible_sales_during_leadtime × unit_margin_bundle
 * IC (Incremental Cost) = (local_vendor_cost − primary_vendor_cost) × qty_needed
 *
 * Recommend local vendor if:
 *   (ELP − IC) > 0  AND  resulting_bundle_margin ≥ 20%
 *
 * Example:
 * - Bundle sells 5/day, margin $15/unit
 * - Primary vendor: 14 days lead, $10/unit cost
 * - Local vendor: 3 days lead, $13/unit cost
 * - OOS component needed: 100 units
 *
 * ELP = (5 bundles/day × 11 days saved) × $15 margin = $825
 * IC = ($13 - $10) × 100 units = $300
 * Net benefit = $825 - $300 = $525 > 0 ✅ RECOMMEND
 *
 * Context7 MCP: /microsoft/typescript
 * - Business logic: Conditional calculations, type safety
 * - Algorithms: Opportunity cost, margin threshold
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Emergency sourcing input parameters
 */
export interface EmergencySourcingInput {
  variantId: string; // OOS component
  bundleProductId: string; // Blocked bundle
  bundleMargin: number; // $/unit profit margin
  avgBundleSalesPerDay: number; // From demand forecast
  qtyNeeded: number; // How many units to order
}

/**
 * Vendor comparison for emergency sourcing
 */
export interface VendorComparison {
  vendorId: string;
  vendorName: string;
  leadTimeDays: number;
  costPerUnit: number;
  totalCost: number;
  reliabilityScore: number;
}

/**
 * Emergency sourcing recommendation
 */
export interface EmergencySourcingRecommendation {
  shouldUseFastVendor: boolean;
  primaryVendor: VendorComparison;
  localVendor: VendorComparison;
  analysis: {
    daysSaved: number;
    feasibleSalesDuringSavedTime: number;
    expectedLostProfit: number;
    incrementalCost: number;
    netBenefit: number;
    resultingBundleMargin: number;
  };
  reason: string;
}

/**
 * Action Queue card for emergency sourcing
 */
export interface ActionQueueCard {
  type: string;
  title: string;
  description: string;
  expectedRevenue: number;
  confidence: number;
  ease: number;
  evidence: Record<string, unknown>;
}

/**
 * Analyze emergency sourcing recommendation
 *
 * Compares primary (reliable) vendor vs local (fast) vendor
 * Calculates ELP vs IC to determine if fast vendor is worth the extra cost
 *
 * @param input - Emergency sourcing parameters
 * @returns Sourcing recommendation
 */
export async function analyzeEmergencySourcing(
  input: EmergencySourcingInput,
): Promise<EmergencySourcingRecommendation> {
  // 1. Get vendor options for the OOS variant
  const vendors = await prisma.vendorProductMapping.findMany({
    where: { variantId: input.variantId },
    include: { vendor: true },
  });

  if (vendors.length < 2) {
    throw new Error(
      `Need at least 2 vendors for comparison. Found ${vendors.length} for variant ${input.variantId}`,
    );
  }

  // 2. Identify primary (best reliability) vendor
  const primaryVendor = vendors.reduce((best, v) =>
    Number(v.vendor.reliabilityScore || 0) >
    Number(best.vendor.reliabilityScore || 0)
      ? v
      : best,
  );

  // 3. Identify local fast (shortest lead time) vendor
  // If multiple vendors have same lead time, pick one different from primary
  let localVendor = vendors.reduce((fastest, v) =>
    v.vendor.leadTimeDays < fastest.vendor.leadTimeDays ? v : fastest,
  );

  // Edge case: If primary and local are the same (same lead time and highest reliability),
  // pick the next fastest vendor that's different
  if (localVendor.vendorId === primaryVendor.vendorId && vendors.length > 1) {
    const otherVendors = vendors.filter((v) => v.vendorId !== primaryVendor.vendorId);
    localVendor = otherVendors.reduce((fastest, v) =>
      v.vendor.leadTimeDays < fastest.vendor.leadTimeDays ? v : fastest,
    );
  }

  // 4. Calculate opportunity cost (Expected Lost Profit)
  const daysSaved = primaryVendor.vendor.leadTimeDays - localVendor.vendor.leadTimeDays;

  // Feasible sales = avg sales/day × days saved
  const feasibleSales = input.avgBundleSalesPerDay * daysSaved;

  // ELP = feasible sales × bundle margin
  const expectedLostProfit = feasibleSales * input.bundleMargin;

  // 5. Calculate incremental cost
  const primaryCost = Number(primaryVendor.costPerUnit);
  const localCost = Number(localVendor.costPerUnit);
  const incrementalCost = (localCost - primaryCost) * input.qtyNeeded;

  // 6. Calculate net benefit
  const netBenefit = expectedLostProfit - incrementalCost;

  // 7. Calculate resulting bundle margin (after paying more for component)
  const componentCostIncrease = localCost - primaryCost;
  const resultingBundleMargin = input.bundleMargin - componentCostIncrease;
  const resultingMarginPct = resultingBundleMargin / input.bundleMargin;

  // 8. Make recommendation (net benefit > 0 AND margin >= 20%)
  const shouldUseFast = netBenefit > 0 && resultingMarginPct >= 0.2;

  // 9. Generate reason
  const reason = shouldUseFast
    ? `✅ Net benefit of $${netBenefit.toFixed(2)} by saving ${daysSaved} days. Bundle margin remains ${(resultingMarginPct * 100).toFixed(1)}% (above 20% threshold).`
    : netBenefit <= 0
      ? `❌ Incremental cost ($${Math.abs(incrementalCost).toFixed(2)}) exceeds expected lost profit ($${expectedLostProfit.toFixed(2)}). Use primary vendor.`
      : `❌ Bundle margin would drop to ${(resultingMarginPct * 100).toFixed(1)}% (below 20% threshold). Use primary vendor.`;

  return {
    shouldUseFastVendor: shouldUseFast,
    primaryVendor: {
      vendorId: primaryVendor.vendorId,
      vendorName: primaryVendor.vendor.name,
      leadTimeDays: primaryVendor.vendor.leadTimeDays,
      costPerUnit: primaryCost,
      totalCost: primaryCost * input.qtyNeeded,
      reliabilityScore: Number(primaryVendor.vendor.reliabilityScore || 0),
    },
    localVendor: {
      vendorId: localVendor.vendorId,
      vendorName: localVendor.vendor.name,
      leadTimeDays: localVendor.vendor.leadTimeDays,
      costPerUnit: localCost,
      totalCost: localCost * input.qtyNeeded,
      reliabilityScore: Number(localVendor.vendor.reliabilityScore || 0),
    },
    analysis: {
      daysSaved,
      feasibleSalesDuringSavedTime: feasibleSales,
      expectedLostProfit: Math.round(expectedLostProfit * 100) / 100,
      incrementalCost: Math.round(incrementalCost * 100) / 100,
      netBenefit: Math.round(netBenefit * 100) / 100,
      resultingBundleMargin: Math.round(resultingMarginPct * 100) / 100,
    },
    reason,
  };
}

/**
 * Generate Action Queue card for emergency sourcing
 *
 * Creates actionable recommendation for operator if fast vendor is beneficial
 *
 * @param variantId - OOS component variant ID
 * @param bundleProductId - Bundle product ID being blocked
 * @returns Action card or null if not recommended
 */
export async function generateEmergencySourcingAction(
  variantId: string,
  bundleProductId: string,
): Promise<ActionQueueCard | null> {
  // Get bundle metrics (mock for now - TODO: integrate with demand forecast)
  const bundleMetrics = await getMockBundleMetrics(bundleProductId);
  const forecast = await getMockDemandForecast(bundleProductId);

  // Analyze emergency sourcing
  const recommendation = await analyzeEmergencySourcing({
    variantId,
    bundleProductId,
    bundleMargin: bundleMetrics.margin,
    avgBundleSalesPerDay: forecast.avgDailyDemand,
    qtyNeeded: 100, // Or calculate based on forecast (e.g., 14 days supply)
  });

  if (!recommendation.shouldUseFastVendor) {
    return null; // Don't create action if not recommended
  }

  // Create Action Queue card
  return {
    type: "inventory",
    title: `Emergency Sourcing: ${bundleMetrics.title}`,
    description: recommendation.reason,
    expectedRevenue: recommendation.analysis.netBenefit,
    confidence: 0.85, // High confidence (based on historical data)
    ease: 0.7, // Moderate ease (requires PO approval)
    evidence: {
      daysSaved: recommendation.analysis.daysSaved,
      netBenefit: recommendation.analysis.netBenefit,
      incrementalCost: recommendation.analysis.incrementalCost,
      expectedLostProfit: recommendation.analysis.expectedLostProfit,
      primaryVendor: recommendation.primaryVendor,
      localVendor: recommendation.localVendor,
      bundleMargin: bundleMetrics.margin,
      avgDailySales: forecast.avgDailyDemand,
    },
  };
}

/**
 * Mock bundle metrics (TODO: integrate with actual product/bundle service)
 */
async function getMockBundleMetrics(bundleProductId: string): Promise<{
  title: string;
  margin: number;
}> {
  return {
    title: "Premium Bundle Kit",
    margin: 15.0, // $15 profit per bundle
  };
}

/**
 * Mock demand forecast (TODO: integrate with demand-forecast.ts)
 */
async function getMockDemandForecast(bundleProductId: string): Promise<{
  avgDailyDemand: number;
}> {
  return {
    avgDailyDemand: 5.0, // 5 bundles/day
  };
}

