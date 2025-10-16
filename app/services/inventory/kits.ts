/**
 * Kit/Bundle Tracking Service
 * 
 * Tracks component inventory for bundles and kits
 * Detects bundles via BUNDLE:TRUE tag or app.inventory.is_bundle metafield
 * Tracks pack counts via PACK:X tag or app.inventory.pack_count metafield
 */

import type { ShopifyServiceContext } from '../shopify/types';
import { recordDashboardFact } from '../facts.server';
import { toInputJson } from '../json';

export interface BundleComponent {
  sku: string;
  productId: string;
  variantId: string;
  quantityRequired: number;
  currentQuantity: number;
  availableForBundle: number; // How many bundles can be made with this component
}

export interface BundleInfo {
  sku: string;
  productId: string;
  variantId: string;
  title: string;
  isBundle: boolean;
  packCount: number;
  components?: BundleComponent[];
  maxBundlesAvailable?: number; // Minimum of all component availabilities
  currentQuantity: number;
}

export interface BundleDetectionResult {
  sku: string;
  productId: string;
  variantId: string;
  isBundle: boolean;
  packCount: number;
  detectionMethod: 'tag' | 'metafield' | 'none';
}

/**
 * Detect if product is a bundle from tags
 * Looks for BUNDLE:TRUE tag
 */
export function detectBundleFromTags(tags: string[]): boolean {
  return tags.some(tag => 
    tag.toUpperCase() === 'BUNDLE:TRUE' || 
    tag.toUpperCase() === 'BUNDLE'
  );
}

/**
 * Extract pack count from tags
 * Looks for PACK:X tag (e.g., PACK:8)
 */
export function extractPackCountFromTags(tags: string[]): number {
  const packTag = tags.find(tag => tag.toUpperCase().startsWith('PACK:'));
  
  if (!packTag) {
    return 1; // Default to 1 if no pack tag
  }

  const parts = packTag.split(':');
  if (parts.length !== 2) {
    return 1;
  }

  const count = parseInt(parts[1], 10);
  return isNaN(count) ? 1 : count;
}

/**
 * Detect bundle and pack count from product data
 * Priority: metafields > tags > default
 */
export function detectBundle(
  tags: string[],
  metafields?: {
    isBundle?: boolean;
    packCount?: number;
  }
): BundleDetectionResult {
  let isBundle = false;
  let packCount = 1;
  let detectionMethod: 'tag' | 'metafield' | 'none' = 'none';

  // Check metafields first (higher priority)
  if (metafields?.isBundle !== undefined) {
    isBundle = metafields.isBundle;
    detectionMethod = 'metafield';
  } else if (detectBundleFromTags(tags)) {
    isBundle = true;
    detectionMethod = 'tag';
  }

  // Check pack count
  if (metafields?.packCount !== undefined && metafields.packCount > 0) {
    packCount = metafields.packCount;
    detectionMethod = 'metafield';
  } else {
    const tagPackCount = extractPackCountFromTags(tags);
    if (tagPackCount > 1) {
      packCount = tagPackCount;
      if (detectionMethod === 'none') {
        detectionMethod = 'tag';
      }
    }
  }

  return {
    sku: '', // To be filled by caller
    productId: '', // To be filled by caller
    variantId: '', // To be filled by caller
    isBundle,
    packCount,
    detectionMethod,
  };
}

/**
 * Calculate how many bundles can be made from component inventory
 */
export function calculateBundleAvailability(
  components: BundleComponent[]
): number {
  if (components.length === 0) {
    return 0;
  }

  // Find the minimum availability across all components
  return Math.min(...components.map(c => c.availableForBundle));
}

/**
 * Calculate component availability for bundles
 */
export function calculateComponentAvailability(
  component: BundleComponent
): BundleComponent {
  const availableForBundle = Math.floor(
    component.currentQuantity / component.quantityRequired
  );

  return {
    ...component,
    availableForBundle,
  };
}

/**
 * Get bundle information with component tracking
 */
export function getBundleInfo(
  sku: string,
  productId: string,
  variantId: string,
  title: string,
  currentQuantity: number,
  tags: string[],
  metafields?: {
    isBundle?: boolean;
    packCount?: number;
  },
  components?: Omit<BundleComponent, 'availableForBundle'>[]
): BundleInfo {
  const detection = detectBundle(tags, metafields);

  const bundleInfo: BundleInfo = {
    sku,
    productId,
    variantId,
    title,
    isBundle: detection.isBundle,
    packCount: detection.packCount,
    currentQuantity,
  };

  // If components provided, calculate availability
  if (components && components.length > 0) {
    const componentsWithAvailability = components.map(calculateComponentAvailability);
    bundleInfo.components = componentsWithAvailability;
    bundleInfo.maxBundlesAvailable = calculateBundleAvailability(componentsWithAvailability);
  }

  return bundleInfo;
}

/**
 * Check if bundle has sufficient component inventory
 */
export function hasSufficientComponents(
  bundle: BundleInfo,
  requiredQuantity: number = 1
): boolean {
  if (!bundle.components || bundle.components.length === 0) {
    // If no components tracked, assume sufficient
    return true;
  }

  return (bundle.maxBundlesAvailable ?? 0) >= requiredQuantity;
}

/**
 * Get bundles with low component inventory
 */
export function getBundlesWithLowComponents(
  bundles: BundleInfo[],
  threshold: number = 10
): BundleInfo[] {
  return bundles.filter(bundle => {
    if (!bundle.isBundle || !bundle.components) {
      return false;
    }

    return (bundle.maxBundlesAvailable ?? 0) < threshold;
  });
}

/**
 * Calculate total pieces for picker payout
 * 
 * For bundles: quantity × pack count
 * For regular products: quantity × pack count (default 1)
 */
export function calculatePickerPieces(
  orderQuantity: number,
  packCount: number
): number {
  return orderQuantity * packCount;
}

/**
 * Get picker payout bracket
 * 
 * Brackets:
 * - 1-4 pieces: $2.00
 * - 5-10 pieces: $4.00
 * - 11+ pieces: $7.00
 */
export function getPickerPayoutBracket(totalPieces: number): {
  bracket: '1-4' | '5-10' | '11+';
  amount: number;
} {
  if (totalPieces <= 4) {
    return { bracket: '1-4', amount: 2.00 };
  } else if (totalPieces <= 10) {
    return { bracket: '5-10', amount: 4.00 };
  } else {
    return { bracket: '11+', amount: 7.00 };
  }
}

/**
 * Calculate picker payout for an order
 */
export function calculatePickerPayout(
  lineItems: Array<{
    sku: string;
    quantity: number;
    packCount: number;
  }>
): {
  totalPieces: number;
  bracket: '1-4' | '5-10' | '11+';
  payoutAmount: number;
  lineItemBreakdown: Array<{
    sku: string;
    quantity: number;
    packCount: number;
    pieces: number;
  }>;
} {
  const lineItemBreakdown = lineItems.map(item => ({
    sku: item.sku,
    quantity: item.quantity,
    packCount: item.packCount,
    pieces: calculatePickerPieces(item.quantity, item.packCount),
  }));

  const totalPieces = lineItemBreakdown.reduce((sum, item) => sum + item.pieces, 0);
  const { bracket, amount } = getPickerPayoutBracket(totalPieces);

  return {
    totalPieces,
    bracket,
    payoutAmount: amount,
    lineItemBreakdown,
  };
}

/**
 * Record bundle tracking data to Supabase
 */
export async function recordBundleTracking(
  context: ShopifyServiceContext,
  bundles: BundleInfo[]
): Promise<void> {
  const summary = {
    totalBundles: bundles.length,
    bundlesWithComponents: bundles.filter(b => b.components && b.components.length > 0).length,
    lowComponentBundles: getBundlesWithLowComponents(bundles).length,
    recordedAt: new Date().toISOString(),
  };

  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: 'inventory.bundles.tracked',
    scope: 'ops',
    value: toInputJson(summary),
    metadata: toInputJson({
      totalBundles: summary.totalBundles,
      recordedAt: summary.recordedAt,
    }),
  });
}

