/**
 * Kits & Bundles Support Service (INVENTORY-008)
 *
 * Handles inventory calculations for bundle products where:
 * - BUNDLE:TRUE indicates a product is composed of multiple components
 * - COMPONENTS:SKU1:2,SKU2:3 defines the component SKUs and quantities
 *
 * Bundle ROP Calculation:
 * ROP = min(component_stock / component_qty_per_bundle)
 * This ensures we can't sell more bundles than we can assemble.
 *
 * Context7: /microsoft/typescript - type guards, async/Promise
 * Context7: /websites/reactrouter - API patterns
 */

import { calculateReorderPoint } from "./rop";
import type { ProductCategory } from "~/lib/inventory/seasonality";

export interface BundleComponent {
  componentProductId: string;
  quantity: number;
}

export interface BundleInfo {
  productId: string;
  productName: string;
  isBundle: boolean;
  components: BundleComponent[];
  availableBundles?: number; // How many complete bundles can be assembled
  limitingComponent?: string; // Which component is limiting bundle production
}

/**
 * Parse bundle components from metafield value
 *
 * Expected format: "BUNDLE:TRUE,COMPONENTS:SKU1:2,SKU2:3"
 * - BUNDLE:TRUE = This is a bundle
 * - COMPONENTS:SKU1:2 = Component SKU1, quantity 2 per bundle
 *
 * @param metafieldValue - Raw metafield string from product
 * @returns Array of bundle components
 */
export function parseBundleMetafield(
  metafieldValue: string
): BundleComponent[] {
  if (!metafieldValue || !metafieldValue.includes("BUNDLE:TRUE")) {
    return [];
  }

  // Extract COMPONENTS section
  const componentsMatch = metafieldValue.match(/COMPONENTS:([^,\s]+)/);
  if (!componentsMatch || !componentsMatch[1]) {
    return [];
  }

  const componentsStr = componentsMatch[1];

  // Parse individual components: SKU1:2,SKU2:3
  const components = componentsStr.split(",").map((part) => {
    const [sku, qtyStr] = part.trim().split(":");
    const quantity = parseInt(qtyStr, 10);

    if (!sku || isNaN(quantity)) {
      throw new Error(`Invalid component format: ${part}`);
    }

    return {
      componentProductId: sku,
      quantity,
    };
  });

  return components;
}

/**
 * Get bundle components for a product
 *
 * In production: fetch product from Shopify and parse metafield
 * For now: uses mock data
 *
 * @param bundleProductId - Bundle product identifier
 * @returns Promise resolving to array of components (empty if not a bundle)
 */
export async function getBundleComponents(
  bundleProductId: string
): Promise<BundleComponent[]> {
  // In production: fetch from Shopify API
  // const product = await getProduct(context, bundleProductId);
  // const metafield = product.metafield?.value || '';

  // Mock data - example bundle product
  if (bundleProductId === "bundle_001") {
    return [
      { componentProductId: "component_A", quantity: 2 },
      { componentProductId: "component_B", quantity: 3 },
    ];
  }

  return []; // Not a bundle
}

/**
 * Get stock level for a product
 *
 * In production: fetch from Shopify inventory API
 * For now: mock data
 *
 * @param productId - Product identifier
 * @returns Promise resolving to current stock quantity
 */
async function getProductStock(productId: string): Promise<number> {
  // Mock stock data
  const mockStock: Record<string, number> = {
    component_A: 50,
    component_B: 90,
    component_C: 30,
  };

  return mockStock[productId] || 0;
}

/**
 * Calculate reorder point for a bundle product
 *
 * For bundles, ROP is calculated based on the limiting component:
 * - Get ROP for each component individually
 * - Divide each component stock by its quantity per bundle
 * - Bundle ROP = minimum across all components
 *
 * Example:
 * - Bundle requires 2x Component A, 3x Component B
 * - Component A stock: 50 → can make 25 bundles
 * - Component B stock: 90 → can make 30 bundles
 * - Bundle stock effectively: min(25, 30) = 25 bundles
 *
 * INVENTORY-008: Kits & Bundles Support
 *
 * @param bundleProductId - Bundle product identifier
 * @param params - ROP calculation parameters
 * @returns Promise resolving to bundle ROP
 */
export async function calculateBundleROP(
  bundleProductId: string,
  params: {
    avgDailySales: number;
    leadTimeDays: number;
    maxDailySales: number;
    maxLeadDays: number;
    category?: ProductCategory;
    currentMonth?: number;
  }
): Promise<{
  reorderPoint: number;
  isBundle: boolean;
  components?: Array<{
    componentId: string;
    stock: number;
    availableBundles: number;
  }>;
  limitingComponent?: string;
}> {
  const components = await getBundleComponents(bundleProductId);

  // Not a bundle - use regular ROP calculation
  if (components.length === 0) {
    const ropResult = calculateReorderPoint(params);
    return {
      reorderPoint: ropResult.reorderPoint,
      isBundle: false,
    };
  }

  // Bundle: calculate how many bundles each component can support
  const componentCapacities = await Promise.all(
    components.map(async (c) => {
      const componentStock = await getProductStock(c.componentProductId);
      const availableBundles = Math.floor(componentStock / c.quantity);

      return {
        componentId: c.componentProductId,
        stock: componentStock,
        availableBundles,
      };
    })
  );

  // Find the limiting component (lowest available bundles)
  componentCapacities.sort((a, b) => a.availableBundles - b.availableBundles);
  const limitingComponent = componentCapacities[0];

  // Bundle ROP = minimum available bundles across all components
  const bundleROP = limitingComponent.availableBundles;

  return {
    reorderPoint: bundleROP,
    isBundle: true,
    components: componentCapacities,
    limitingComponent: limitingComponent.componentId,
  };
}

/**
 * Get bundle information including component availability
 *
 * API helper for INVENTORY-008
 *
 * @param productId - Product identifier
 * @returns Promise resolving to bundle information
 */
export async function getBundleInfo(productId: string): Promise<BundleInfo> {
  const components = await getBundleComponents(productId);

  if (components.length === 0) {
    return {
      productId,
      productName: "Regular Product",
      isBundle: false,
      components: [],
    };
  }

  // Calculate available bundles based on component stock
  const componentCapacities = await Promise.all(
    components.map(async (c) => {
      const stock = await getProductStock(c.componentProductId);
      return {
        component: c,
        availableBundles: Math.floor(stock / c.quantity),
      };
    })
  );

  const minAvailable = Math.min(
    ...componentCapacities.map((cc) => cc.availableBundles)
  );
  const limitingComponent = componentCapacities.find(
    (cc) => cc.availableBundles === minAvailable
  );

  return {
    productId,
    productName: "Bundle Product",
    isBundle: true,
    components,
    availableBundles: minAvailable,
    limitingComponent: limitingComponent?.component.componentProductId,
  };
}

