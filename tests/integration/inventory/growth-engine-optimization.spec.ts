/**
 * Integration Tests: Growth Engine Inventory Optimization (INVENTORY-104)
 *
 * Tests advanced inventory optimization features for Growth Engine phases 9-12
 */

import { describe, it, expect } from "vitest";
import { 
  calculateAdvancedROP,
  calculateEmergencySourcing,
  optimizeVirtualBundleStock,
  analyzeVendorPerformance,
  getGrowthEngineInventoryOptimization
} from "~/services/inventory/growth-engine-optimization";

describe("Growth Engine Inventory Optimization - Advanced ROP", () => {
  it("should calculate advanced ROP with seasonal adjustments", async () => {
    const result = await calculateAdvancedROP("prod_001", {
      avgDailySales: 3.5,
      leadTimeDays: 14,
      maxDailySales: 8,
      maxLeadDays: 21,
      category: "general",
      currentMonth: 9, // October (0-based)
      seasonalFactors: {
        1: 0.8, 2: 0.9, 3: 1.1, 4: 1.2, 5: 1.0, 6: 0.9,
        7: 0.8, 8: 0.9, 9: 1.1, 10: 1.3, 11: 1.4, 12: 1.2
      },
      demandVolatility: 0.3,
    });

    expect(result.productId).toBe("prod_001");
    expect(result.optimizedROP).toBeGreaterThanOrEqual(result.currentROP);
    expect(result.seasonalAdjustment).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(1);
  });

  it("should handle high demand volatility", async () => {
    const result = await calculateAdvancedROP("prod_002", {
      avgDailySales: 5.0,
      leadTimeDays: 21,
      maxDailySales: 15,
      maxLeadDays: 30,
      category: "general", // Use general category to avoid seasonality issues
      currentMonth: 5, // June (0-based)
      demandVolatility: 0.8, // High volatility
    });

    expect(result.safetyStockOptimized).toBeGreaterThan(0);
    expect(result.confidenceScore).toBeLessThan(1);
  });
});

describe("Growth Engine Inventory Optimization - Emergency Sourcing", () => {
  it("should calculate emergency sourcing with opportunity-cost logic", async () => {
    const blockedBundles = [
      {
        bundleId: "bundle_001",
        bundleName: "Premium Widget Bundle",
        unitMargin: 25.50,
        dailyVelocity: 2.5,
        blockingComponent: "component_A",
      }
    ];

    const result = await calculateEmergencySourcing(blockedBundles);

    expect(result.blockedBundles).toHaveLength(1);
    expect(result.blockedBundles[0].expectedLostProfit).toBeGreaterThan(0);
    expect(result.blockedBundles[0].emergencyOptions).toHaveLength(2);
    
    // Check that recommendations are properly calculated
    const recommendedOptions = result.blockedBundles[0].emergencyOptions.filter(
      option => option.recommended
    );
    expect(recommendedOptions.length).toBeGreaterThan(0);
  });

  it("should prioritize fast delivery options", async () => {
    const blockedBundles = [
      {
        bundleId: "bundle_002",
        bundleName: "Deluxe Bundle",
        unitMargin: 45.00,
        dailyVelocity: 1.8,
        blockingComponent: "component_B",
      }
    ];

    const result = await calculateEmergencySourcing(blockedBundles);
    const emergencyOptions = result.blockedBundles[0].emergencyOptions;

    // Fast delivery options should be recommended
    const fastOptions = emergencyOptions.filter(option => option.leadTime <= 7);
    const recommendedFastOptions = fastOptions.filter(option => option.recommended);
    
    expect(recommendedFastOptions.length).toBeGreaterThan(0);
  });
});

describe("Growth Engine Inventory Optimization - Virtual Bundle Stock", () => {
  it("should optimize virtual bundle stock across components", async () => {
    const result = await optimizeVirtualBundleStock("bundle_001");

    expect(result.bundleId).toBe("bundle_001");
    expect(result.currentVirtualStock).toBeGreaterThanOrEqual(0);
    expect(result.optimizedVirtualStock).toBeGreaterThanOrEqual(0);
    expect(result.limitingComponents).toBeDefined();
    expect(result.stockOptimization).toBeDefined();
  });

  it("should identify bottleneck components", async () => {
    const result = await optimizeVirtualBundleStock("bundle_001");
    
    const bottlenecks = result.limitingComponents.filter(c => c.bottleneck);
    expect(bottlenecks.length).toBeGreaterThan(0);
  });

  it("should calculate required component orders", async () => {
    const result = await optimizeVirtualBundleStock("bundle_001");
    
    if (result.stockOptimization.canIncrease) {
      expect(result.stockOptimization.requiredComponentOrders).toBeDefined();
      expect(result.stockOptimization.requiredComponentOrders.length).toBeGreaterThan(0);
    }
  });
});

describe("Growth Engine Inventory Optimization - Vendor Performance", () => {
  it("should analyze vendor performance metrics", async () => {
    const result = await analyzeVendorPerformance("vendor_001");

    expect(result.vendorId).toBe("vendor_001");
    expect(result.reliabilityScore).toBeGreaterThanOrEqual(0);
    expect(result.reliabilityScore).toBeLessThanOrEqual(1);
    expect(result.averageLeadTime).toBeGreaterThan(0);
    expect(result.onTimeDeliveryRate).toBeGreaterThanOrEqual(0);
    expect(result.qualityScore).toBeGreaterThanOrEqual(0);
    expect(result.costCompetitiveness).toBeGreaterThanOrEqual(0);
  });

  it("should provide optimization recommendations", async () => {
    const result = await analyzeVendorPerformance("vendor_001");

    expect(result.recommendations).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);
    
    // Check recommendation types
    const recommendationTypes = result.recommendations.map(r => r.type);
    const validTypes = ['improve_leadtime', 'increase_reliability', 'cost_optimization'];
    
    recommendationTypes.forEach(type => {
      expect(validTypes).toContain(type);
    });
  });
});

describe("Growth Engine Inventory Optimization - Comprehensive", () => {
  it("should return complete optimization data", async () => {
    const result = await getGrowthEngineInventoryOptimization([
      "prod_001", "prod_002", "prod_003"
    ]);

    expect(result.advancedROP).toBeDefined();
    expect(result.emergencySourcing).toBeDefined();
    expect(result.virtualBundleStock).toBeDefined();
    expect(result.vendorPerformance).toBeDefined();
    expect(result.performanceMetrics).toBeDefined();
  });

  it("should include performance metrics", async () => {
    const result = await getGrowthEngineInventoryOptimization(["prod_001"]);

    expect(result.performanceMetrics.optimizationScore).toBeGreaterThan(0);
    expect(result.performanceMetrics.costSavings).toBeGreaterThanOrEqual(0);
    expect(result.performanceMetrics.stockoutRiskReduction).toBeGreaterThanOrEqual(0);
    expect(result.performanceMetrics.inventoryTurnoverImprovement).toBeGreaterThanOrEqual(0);
    expect(result.performanceMetrics.lastOptimized).toBeDefined();
  });

  it("should handle multiple products", async () => {
    const productIds = ["prod_001", "prod_002", "prod_003", "prod_004"];
    const result = await getGrowthEngineInventoryOptimization(productIds);

    expect(result).toBeDefined();
    expect(result.advancedROP).toBeDefined();
    // Should return optimization for first product in demo
    expect(result.advancedROP.productId).toBe("prod_001");
  });
});
