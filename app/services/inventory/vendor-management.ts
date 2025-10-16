/**
 * Vendor Management Service
 * 
 * Manages vendor profiles with lead times, MOQ, and contact information
 * Supports vendor lead time ingestion and safety stock policy configuration
 */

import { recordDashboardFact } from '../facts.server';
import { toInputJson } from '../json';
import type { ShopifyServiceContext } from '../shopify/types';

export interface VendorProfile {
  vendorId: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  defaultLeadTimeDays: number;
  minLeadTimeDays?: number;
  maxLeadTimeDays?: number;
  minimumOrderQuantity?: number;
  minimumOrderValue?: number;
  paymentTerms?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorProduct {
  vendorId: string;
  sku: string;
  vendorSku?: string;
  leadTimeDays?: number; // Override vendor default
  unitCost?: number;
  moq?: number; // Minimum order quantity for this product
  isPrimary: boolean; // Primary vendor for this product
}

export interface SafetyStockPolicy {
  policyId: string;
  name: string;
  safetyFactor: number; // Multiplier for average daily sales
  minDays?: number; // Minimum days of safety stock
  maxDays?: number; // Maximum days of safety stock
  applyToCategories?: string[];
  applyToVendors?: string[];
  active: boolean;
}

export interface LeadTimeStats {
  vendorId: string;
  averageLeadTimeDays: number;
  minLeadTimeDays: number;
  maxLeadTimeDays: number;
  standardDeviation: number;
  sampleSize: number;
  lastUpdated: string;
}

/**
 * Create vendor profile
 */
export function createVendorProfile(
  name: string,
  defaultLeadTimeDays: number,
  options: Partial<VendorProfile> = {}
): VendorProfile {
  const now = new Date().toISOString();

  return {
    vendorId: `vendor_${Date.now()}`,
    name,
    defaultLeadTimeDays,
    active: true,
    createdAt: now,
    updatedAt: now,
    ...options,
  };
}

/**
 * Calculate lead time statistics from historical data
 */
export function calculateLeadTimeStats(
  vendorId: string,
  historicalLeadTimes: number[]
): LeadTimeStats {
  if (historicalLeadTimes.length === 0) {
    return {
      vendorId,
      averageLeadTimeDays: 0,
      minLeadTimeDays: 0,
      maxLeadTimeDays: 0,
      standardDeviation: 0,
      sampleSize: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  const sum = historicalLeadTimes.reduce((a, b) => a + b, 0);
  const average = sum / historicalLeadTimes.length;
  const min = Math.min(...historicalLeadTimes);
  const max = Math.max(...historicalLeadTimes);

  // Calculate standard deviation
  const squaredDiffs = historicalLeadTimes.map(lt => Math.pow(lt - average, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / historicalLeadTimes.length;
  const stdDev = Math.sqrt(variance);

  return {
    vendorId,
    averageLeadTimeDays: Number(average.toFixed(1)),
    minLeadTimeDays: min,
    maxLeadTimeDays: max,
    standardDeviation: Number(stdDev.toFixed(2)),
    sampleSize: historicalLeadTimes.length,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get recommended lead time based on stats
 * Uses average + 1 standard deviation for safety
 */
export function getRecommendedLeadTime(stats: LeadTimeStats): number {
  return Math.ceil(stats.averageLeadTimeDays + stats.standardDeviation);
}

/**
 * Create safety stock policy
 */
export function createSafetyStockPolicy(
  name: string,
  safetyFactor: number,
  options: Partial<SafetyStockPolicy> = {}
): SafetyStockPolicy {
  return {
    policyId: `policy_${Date.now()}`,
    name,
    safetyFactor,
    active: true,
    ...options,
  };
}

/**
 * Calculate safety stock using policy
 */
export function calculateSafetyStockWithPolicy(
  averageDailySales: number,
  policy: SafetyStockPolicy,
  leadTimeDays?: number
): number {
  // Base calculation: average daily sales × safety factor
  let safetyStock = averageDailySales * policy.safetyFactor;

  // Apply min/max constraints if specified
  if (policy.minDays !== undefined) {
    const minStock = averageDailySales * policy.minDays;
    safetyStock = Math.max(safetyStock, minStock);
  }

  if (policy.maxDays !== undefined) {
    const maxStock = averageDailySales * policy.maxDays;
    safetyStock = Math.min(safetyStock, maxStock);
  }

  return Math.ceil(safetyStock);
}

/**
 * Get vendor for product
 */
export function getPrimaryVendor(
  sku: string,
  vendorProducts: VendorProduct[]
): VendorProduct | null {
  return vendorProducts.find(vp => vp.sku === sku && vp.isPrimary) || null;
}

/**
 * Get all vendors for product
 */
export function getVendorsForProduct(
  sku: string,
  vendorProducts: VendorProduct[]
): VendorProduct[] {
  return vendorProducts.filter(vp => vp.sku === sku);
}

/**
 * Calculate total order value for vendor
 */
export function calculateVendorOrderValue(
  vendorProducts: VendorProduct[],
  orderQuantities: Map<string, number>
): number {
  let total = 0;

  for (const vp of vendorProducts) {
    const quantity = orderQuantities.get(vp.sku) || 0;
    const cost = vp.unitCost || 0;
    total += quantity * cost;
  }

  return Number(total.toFixed(2));
}

/**
 * Check if order meets vendor MOQ
 */
export function meetsMinimumOrder(
  vendor: VendorProfile,
  vendorProducts: VendorProduct[],
  orderQuantities: Map<string, number>
): {
  meetsQuantity: boolean;
  meetsValue: boolean;
  totalQuantity: number;
  totalValue: number;
} {
  const totalQuantity = Array.from(orderQuantities.values()).reduce((a, b) => a + b, 0);
  const totalValue = calculateVendorOrderValue(vendorProducts, orderQuantities);

  return {
    meetsQuantity: vendor.minimumOrderQuantity
      ? totalQuantity >= vendor.minimumOrderQuantity
      : true,
    meetsValue: vendor.minimumOrderValue
      ? totalValue >= vendor.minimumOrderValue
      : true,
    totalQuantity,
    totalValue,
  };
}

/**
 * Record vendor profile to Supabase
 */
export async function recordVendorProfile(
  context: ShopifyServiceContext,
  vendor: VendorProfile
): Promise<void> {
  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: 'inventory.vendor.created',
    scope: 'ops',
    value: toInputJson(vendor),
    metadata: toInputJson({
      vendorId: vendor.vendorId,
      name: vendor.name,
      createdAt: vendor.createdAt,
    }),
  });
}

/**
 * Record lead time statistics
 */
export async function recordLeadTimeStats(
  context: ShopifyServiceContext,
  stats: LeadTimeStats
): Promise<void> {
  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: 'inventory.vendor.lead_time_stats',
    scope: 'ops',
    value: toInputJson(stats),
    metadata: toInputJson({
      vendorId: stats.vendorId,
      averageLeadTimeDays: stats.averageLeadTimeDays,
      lastUpdated: stats.lastUpdated,
    }),
  });
}

