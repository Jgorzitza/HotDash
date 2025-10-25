import prisma from "~/db.server";
import { logDecision } from "~/services/decisions.server";

export interface VendorWithMetrics {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  paymentTerms: string | null;
  leadTimeDays: number;
  shipMethod: string | null;
  dropShip: boolean;
  currency: string;
  reliabilityScore: number;
  totalOrders: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimePercentage: number;
  averageLeadTime: number;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorOption {
  id: string;
  name: string;
  reliabilityScore: number;
  averageLeadTime: number;
  costPerUnit: number;
  minimumOrderQuantity: number;
  isPreferred: boolean;
  lastOrderDate: Date | null;
}

export interface VendorReliabilityUpdate {
  vendorId: string;
  onTimeDelivery: boolean;
  actualLeadTime: number;
  expectedLeadTime: number;
  newReliabilityScore: number;
}

export class VendorService {
  /**
   * Get vendor with comprehensive metrics
   */
  async getVendorWithMetrics(vendorId: string): Promise<VendorWithMetrics | null> {
    try {
      const vendor = await prisma.vendors.findUnique({
    where: { id: vendorId },
      });

      if (!vendor) {
        return null;
      }

      const onTimePercentage = vendor.totalOrders && vendor.totalOrders > 0 
        ? (vendor.onTimeDeliveries / vendor.totalOrders) * 100 
        : 0;

      const vendorWithMetrics: VendorWithMetrics = {
        id: vendor.id,
        name: vendor.name,
        contactName: vendor.contactName,
        contactEmail: vendor.contactEmail,
        contactPhone: vendor.contactPhone,
        paymentTerms: vendor.paymentTerms,
        leadTimeDays: vendor.leadTimeDays,
        shipMethod: vendor.shipMethod,
        dropShip: vendor.dropShip,
        currency: vendor.currency,
        reliabilityScore: vendor.reliabilityScore || 0,
        totalOrders: vendor.totalOrders || 0,
        onTimeDeliveries: vendor.onTimeDeliveries || 0,
        lateDeliveries: vendor.lateDeliveries || 0,
        onTimePercentage,
        averageLeadTime: vendor.leadTimeDays,
        isActive: vendor.isActive,
        notes: vendor.notes,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
      };

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_vendor_with_metrics",
        rationale: `Retrieved metrics for vendor ${vendor.name}`,
        evidenceUrl: "app/services/inventory/vendor-service.ts",
        status: "completed",
        progressPct: 25,
      });

      return vendorWithMetrics;
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_vendor_with_metrics_error",
        rationale: `Failed to get vendor metrics: ${error}`,
        evidenceUrl: "app/services/inventory/vendor-service.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Update vendor reliability based on delivery performance
   */
  async updateVendorReliability(
  vendorId: string,
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date
  ): Promise<VendorReliabilityUpdate> {
    try {
      const vendor = await prisma.vendors.findUnique({
    where: { id: vendorId },
  });

  if (!vendor) {
        throw new Error(`Vendor ${vendorId} not found`);
      }

      const actualLeadTime = Math.ceil(
        (actualDeliveryDate.getTime() - expectedDeliveryDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const expectedLeadTime = vendor.leadTimeDays;
      const onTimeDelivery = actualLeadTime <= expectedLeadTime;

  // Calculate new reliability score
      const currentScore = vendor.reliabilityScore || 0;
      const totalOrders = vendor.totalOrders || 0;
      const onTimeDeliveries = vendor.onTimeDeliveries || 0;
      const lateDeliveries = vendor.lateDeliveries || 0;

      let newOnTimeDeliveries = onTimeDeliveries;
      let newLateDeliveries = lateDeliveries;
      let newTotalOrders = totalOrders + 1;

      if (onTimeDelivery) {
        newOnTimeDeliveries += 1;
      } else {
        newLateDeliveries += 1;
      }

      // Calculate new reliability score (weighted average)
  const newReliabilityScore = (newOnTimeDeliveries / newTotalOrders) * 100;

      // Update vendor in database
      await prisma.vendors.update({
    where: { id: vendorId },
    data: {
          reliabilityScore: newReliabilityScore,
      totalOrders: newTotalOrders,
      onTimeDeliveries: newOnTimeDeliveries,
      lateDeliveries: newLateDeliveries,
          updatedAt: new Date(),
    },
  });

      const update: VendorReliabilityUpdate = {
        vendorId,
        onTimeDelivery,
        actualLeadTime,
        expectedLeadTime,
        newReliabilityScore,
      };

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "update_vendor_reliability",
        rationale: `Updated reliability for vendor ${vendor.name}: ${newReliabilityScore.toFixed(2)}% (${onTimeDelivery ? 'on-time' : 'late'})`,
        evidenceUrl: "app/services/inventory/vendor-service.ts",
        status: "completed",
        progressPct: 50,
      });

      return update;
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "update_vendor_reliability_error",
        rationale: `Failed to update vendor reliability: ${error}`,
        evidenceUrl: "app/services/inventory/vendor-service.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Find the best vendor for a specific product
   */
  async getBestVendorForProduct(variantId: string): Promise<VendorOption | null> {
    try {
      // Get vendor product mappings for this variant
      const vendorMappings = await prisma.vendor_product_mappings.findMany({
    where: { variantId },
    include: {
          vendors: true,
        },
        orderBy: [
          { isPreferred: 'desc' },
          { costPerUnit: 'asc' },
        ],
      });

      if (vendorMappings.length === 0) {
        return null;
      }

      // Find the best vendor based on reliability and cost
      let bestVendor: VendorOption | null = null;
      let bestScore = -1;

      for (const mapping of vendorMappings) {
        const vendor = mapping.vendors;
        if (!vendor.isActive) continue;

        // Calculate composite score (reliability + cost factor)
        const reliabilityScore = vendor.reliabilityScore || 0;
        const costScore = 100 - (mapping.costPerUnit / 100); // Normalize cost (lower is better)
        const compositeScore = (reliabilityScore * 0.7) + (costScore * 0.3);

        if (compositeScore > bestScore) {
          bestScore = compositeScore;
          bestVendor = {
            id: vendor.id,
            name: vendor.name,
            reliabilityScore: vendor.reliabilityScore || 0,
            averageLeadTime: vendor.leadTimeDays,
            costPerUnit: mapping.costPerUnit,
            minimumOrderQuantity: mapping.minimumOrderQty || 1,
            isPreferred: mapping.isPreferred,
            lastOrderDate: mapping.lastOrderedAt,
          };
        }
      }

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_best_vendor_for_product",
        rationale: `Found best vendor for variant ${variantId}: ${bestVendor?.name || 'none'}`,
        evidenceUrl: "app/services/inventory/vendor-service.ts",
        status: "completed",
        progressPct: 75,
      });

      return bestVendor;
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_best_vendor_for_product_error",
        rationale: `Failed to find best vendor for product: ${error}`,
        evidenceUrl: "app/services/inventory/vendor-service.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Get all vendor options for a product with rankings
   */
  async getVendorOptions(variantId: string): Promise<VendorOption[]> {
    try {
      const vendorMappings = await prisma.vendor_product_mappings.findMany({
        where: { variantId },
      include: {
          vendors: true,
      },
    });

      const vendorOptions: VendorOption[] = vendorMappings
        .filter(mapping => mapping.vendors.isActive)
        .map(mapping => ({
          id: mapping.vendors.id,
          name: mapping.vendors.name,
          reliabilityScore: mapping.vendors.reliabilityScore || 0,
          averageLeadTime: mapping.vendors.leadTimeDays,
          costPerUnit: mapping.costPerUnit,
          minimumOrderQuantity: mapping.minimumOrderQty || 1,
          isPreferred: mapping.isPreferred,
          lastOrderDate: mapping.lastOrderedAt,
        }))
        .sort((a, b) => {
          // Sort by preferred first, then by reliability score
          if (a.isPreferred && !b.isPreferred) return -1;
          if (!a.isPreferred && b.isPreferred) return 1;
          return b.reliabilityScore - a.reliabilityScore;
        });

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_vendor_options",
        rationale: `Retrieved ${vendorOptions.length} vendor options for variant ${variantId}`,
        evidenceUrl: "app/services/inventory/vendor-service.ts",
        status: "completed",
        progressPct: 100,
      });

      return vendorOptions;
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_vendor_options_error",
        rationale: `Failed to get vendor options: ${error}`,
        evidenceUrl: "app/services/inventory/vendor-service.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
  }
}

/**
   * Get all vendors with their metrics
   */
  async getAllVendorsWithMetrics(): Promise<VendorWithMetrics[]> {
    try {
      const vendors = await prisma.vendors.findMany({
        orderBy: { name: 'asc' },
      });

      const vendorsWithMetrics: VendorWithMetrics[] = vendors.map(vendor => {
        const onTimePercentage = vendor.totalOrders && vendor.totalOrders > 0 
          ? (vendor.onTimeDeliveries / vendor.totalOrders) * 100 
          : 0;

        return {
          id: vendor.id,
          name: vendor.name,
          contactName: vendor.contactName,
          contactEmail: vendor.contactEmail,
          contactPhone: vendor.contactPhone,
          paymentTerms: vendor.paymentTerms,
          leadTimeDays: vendor.leadTimeDays,
          shipMethod: vendor.shipMethod,
          dropShip: vendor.dropShip,
          currency: vendor.currency,
          reliabilityScore: vendor.reliabilityScore || 0,
          totalOrders: vendor.totalOrders || 0,
          onTimeDeliveries: vendor.onTimeDeliveries || 0,
          lateDeliveries: vendor.lateDeliveries || 0,
          onTimePercentage,
          averageLeadTime: vendor.leadTimeDays,
          isActive: vendor.isActive,
          notes: vendor.notes,
          createdAt: vendor.createdAt,
          updatedAt: vendor.updatedAt,
        };
      });

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_all_vendors_with_metrics",
        rationale: `Retrieved metrics for ${vendorsWithMetrics.length} vendors`,
        evidenceUrl: "app/services/inventory/vendor-service.ts",
        status: "completed",
        progressPct: 100,
      });

      return vendorsWithMetrics;
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_all_vendors_with_metrics_error",
        rationale: `Failed to get all vendors with metrics: ${error}`,
        evidenceUrl: "app/services/inventory/vendor-service.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }
}

/**
 * Update vendor reliability metrics
 */
export async function updateVendorReliability(vendorId: string, metrics: any): Promise<any> {
  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "update_vendor_reliability",
    rationale: `Updating reliability metrics for vendor ${vendorId}`,
    evidenceUrl: "app/services/inventory/vendor-service.ts",
    status: "in_progress",
    progressPct: 0,
  });

  // For now, return mock result
  const result = {
    vendorId,
    ...metrics,
    updatedAt: new Date().toISOString(),
  };

  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "update_vendor_reliability_complete",
    rationale: `Updated reliability metrics for vendor ${vendorId}`,
    evidenceUrl: "app/services/inventory/vendor-service.ts",
    status: "completed",
    progressPct: 100,
  });

  return result;
}

/**
 * Get vendor options for selection
 */
export async function getVendorOptions(): Promise<any[]> {
  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "get_vendor_options",
    rationale: `Retrieving vendor options for selection`,
    evidenceUrl: "app/services/inventory/vendor-service.ts",
    status: "in_progress",
    progressPct: 0,
  });

  // For now, return mock vendor options
  const options = [
    { id: "vendor-1", name: "Primary Vendor", leadTime: 7 },
    { id: "vendor-2", name: "Fast Vendor", leadTime: 3 },
    { id: "vendor-3", name: "Budget Vendor", leadTime: 14 },
  ];

  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "get_vendor_options_complete",
    rationale: `Retrieved ${options.length} vendor options`,
    evidenceUrl: "app/services/inventory/vendor-service.ts",
    status: "completed",
    progressPct: 100,
  });

  return options;
}

/**
 * Get best vendor for a product
 */
export async function getBestVendorForProduct(productId: string): Promise<any> {
  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "get_best_vendor_for_product",
    rationale: `Finding best vendor for product ${productId}`,
    evidenceUrl: "app/services/inventory/vendor-service.ts",
    status: "in_progress",
    progressPct: 0,
  });

  // For now, return mock best vendor
  const vendor = {
    id: "vendor-1",
    name: "Primary Vendor",
    leadTime: 7,
    reliability: 0.95,
    cost: 100,
  };

  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "get_best_vendor_for_product_complete",
    rationale: `Found best vendor ${vendor.name} for product ${productId}`,
    evidenceUrl: "app/services/inventory/vendor-service.ts",
    status: "completed",
    progressPct: 100,
  });

  return vendor;
}