/**
 * Integration Tests: ROP Calculation Engine (INVENTORY-100)
 *
 * Tests ROP calculation engine with all acceptance criteria:
 * - Daily velocity calculation from order history
 * - Lead time demand = velocity × vendor days
 * - Safety stock = Z-score × demand variance
 * - ROP suggestions stored in reorder_suggestions table
 * - Seasonal trends and promotional uplift handling
 * - Vendor + qty + ETA + cost impact recommendations
 */

import { describe, it, expect } from "vitest";
import { 
  calculateROPEngine,
  batchCalculateROP,
  calculateDailyVelocity,
  calculateLeadTimeDemand,
  calculateSafetyStock,
  getVendorRecommendation,
  updateROPSuggestionStatus
} from "~/services/inventory/rop-engine";

describe("ROP Calculation Engine - Daily Velocity", () => {
  it("should calculate daily velocity from order history", async () => {
    const result = await calculateDailyVelocity("prod_001", "variant_001", 30);

    expect(result.dailyVelocity).toBeGreaterThan(0);
    expect(result.orderCount).toBeGreaterThan(0);
    expect(result.totalQuantitySold).toBeGreaterThan(0);
    expect(result.demandVariance).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeGreaterThan(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(1);
  });

  it("should handle different historical periods", async () => {
    const result30 = await calculateDailyVelocity("prod_001", "variant_001", 30);
    const result60 = await calculateDailyVelocity("prod_001", "variant_001", 60);

    expect(result30.dailyVelocity).toBeGreaterThan(0);
    expect(result60.dailyVelocity).toBeGreaterThan(0);
    // 60 days should have more data points
    expect(result60.orderCount).toBeGreaterThanOrEqual(result30.orderCount);
  });

  it("should calculate confidence score based on data quality", async () => {
    const result = await calculateDailyVelocity("prod_001", "variant_001", 30);

    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.5);
    expect(result.confidenceScore).toBeLessThanOrEqual(0.95);
  });
});

describe("ROP Calculation Engine - Lead Time Demand", () => {
  it("should calculate lead time demand = velocity × vendor days", async () => {
    const dailyVelocity = 3.5;
    const result = await calculateLeadTimeDemand(dailyVelocity, "vendor_001");

    expect(result.leadTimeDays).toBeGreaterThan(0);
    expect(result.leadTimeDemand).toBeGreaterThanOrEqual(dailyVelocity * result.leadTimeDays);
    expect(result.vendorReliability).toBeGreaterThan(0);
    expect(result.vendorReliability).toBeLessThanOrEqual(1);
  });

  it("should handle different vendors", async () => {
    const dailyVelocity = 3.5;
    const result1 = await calculateLeadTimeDemand(dailyVelocity, "vendor_001");
    const result2 = await calculateLeadTimeDemand(dailyVelocity, "vendor_002");

    expect(result1.leadTimeDays).toBeGreaterThan(0);
    expect(result2.leadTimeDays).toBeGreaterThan(0);
    // Different vendors may have different lead times
    expect(result1.leadTimeDemand).toBeGreaterThan(0);
    expect(result2.leadTimeDemand).toBeGreaterThan(0);
  });
});

describe("ROP Calculation Engine - Safety Stock", () => {
  it("should calculate safety stock = Z-score × demand variance", () => {
    const dailyVelocity = 3.5;
    const leadTimeDays = 14;
    const demandVariance = 2.5;
    const serviceLevel = 0.95;

    const safetyStock = calculateSafetyStock(dailyVelocity, leadTimeDays, demandVariance, serviceLevel);

    expect(safetyStock).toBeGreaterThan(0);
    expect(safetyStock).toBeGreaterThanOrEqual(demandVariance); // Should be at least the variance
  });

  it("should handle different service levels", () => {
    const dailyVelocity = 3.5;
    const leadTimeDays = 14;
    const demandVariance = 2.5;

    const safetyStock90 = calculateSafetyStock(dailyVelocity, leadTimeDays, demandVariance, 0.90);
    const safetyStock95 = calculateSafetyStock(dailyVelocity, leadTimeDays, demandVariance, 0.95);
    const safetyStock99 = calculateSafetyStock(dailyVelocity, leadTimeDays, demandVariance, 0.99);

    expect(safetyStock90).toBeGreaterThan(0);
    expect(safetyStock95).toBeGreaterThan(safetyStock90);
    expect(safetyStock99).toBeGreaterThan(safetyStock95);
  });

  it("should handle zero demand variance", () => {
    const dailyVelocity = 3.5;
    const leadTimeDays = 14;
    const demandVariance = 0;

    const safetyStock = calculateSafetyStock(dailyVelocity, leadTimeDays, demandVariance, 0.95);

    expect(safetyStock).toBeGreaterThanOrEqual(0);
  });
});

describe("ROP Calculation Engine - Vendor Recommendations", () => {
  it("should get vendor recommendation with cost and ETA", async () => {
    const result = await getVendorRecommendation("prod_001", 50);

    expect(result.vendorId).toBeDefined();
    expect(result.vendorName).toBeDefined();
    expect(result.estimatedCost).toBeGreaterThan(0);
    expect(result.estimatedEtaDays).toBeGreaterThan(0);
    expect(result.costImpact).toBeGreaterThan(0);
  });

  it("should handle different quantities", async () => {
    const result10 = await getVendorRecommendation("prod_001", 10);
    const result100 = await getVendorRecommendation("prod_001", 100);

    expect(result10.estimatedCost).toBeGreaterThan(0);
    expect(result100.estimatedCost).toBeGreaterThan(result10.estimatedCost);
    expect(result100.estimatedCost).toBeCloseTo(result10.estimatedCost * 10, 1);
  });

  it("should handle preferred vendor", async () => {
    const result = await getVendorRecommendation("prod_001", 50, "vendor_002");

    expect(result.vendorId).toBe("vendor_002");
    expect(result.vendorName).toBeDefined();
    expect(result.estimatedCost).toBeGreaterThan(0);
  });
});

describe("ROP Calculation Engine - Complete ROP Calculation", () => {
  it("should calculate complete ROP with all criteria", async () => {
    const params = {
      productId: "prod_001",
      variantId: "variant_001",
      shopDomain: "hotrodan.myshopify.com",
      calculationMethod: "standard" as const,
      promotionalUplift: 0,
      seasonalAdjustment: 0,
      historicalDays: 30
    };

    const result = await calculateROPEngine(params);

    expect(result.suggestionId).toBeDefined();
    expect(result.productInfo.productId).toBe("prod_001");
    expect(result.ropCalculation.reorderPoint).toBeGreaterThan(0);
    expect(result.ropCalculation.safetyStock).toBeGreaterThan(0);
    expect(result.ropCalculation.leadTimeDemand).toBeGreaterThan(0);
    expect(result.ropCalculation.dailyVelocity).toBeGreaterThan(0);
    expect(result.ropCalculation.confidenceScore).toBeGreaterThan(0);
    expect(result.vendorRecommendation.vendorId).toBeDefined();
    expect(result.vendorRecommendation.estimatedCost).toBeGreaterThan(0);
  });

  it("should handle seasonal adjustments", async () => {
    const params = {
      productId: "prod_001",
      variantId: "variant_001",
      shopDomain: "hotrodan.myshopify.com",
      calculationMethod: "seasonal" as const,
      promotionalUplift: 0,
      seasonalAdjustment: 25, // 25% seasonal increase
      historicalDays: 30
    };

    const result = await calculateROPEngine(params);

    expect(result.ropCalculation.seasonalityFactor).toBeGreaterThan(1.0);
    expect(result.ropCalculation.adjustedDailyVelocity).toBeGreaterThan(result.ropCalculation.dailyVelocity);
    expect(result.calculationMetadata.seasonalAdjustment).toBe(25);
  });

  it("should handle promotional uplift", async () => {
    const params = {
      productId: "prod_001",
      variantId: "variant_001",
      shopDomain: "hotrodan.myshopify.com",
      calculationMethod: "promotional" as const,
      promotionalUplift: 50, // 50% promotional uplift
      seasonalAdjustment: 0,
      historicalDays: 30
    };

    const result = await calculateROPEngine(params);

    expect(result.ropCalculation.adjustedDailyVelocity).toBeGreaterThan(result.ropCalculation.dailyVelocity);
    expect(result.calculationMetadata.promotionalUplift).toBe(50);
    expect(result.calculationMetadata.calculationMethod).toBe("promotional");
  });

  it("should handle emergency calculations", async () => {
    const params = {
      productId: "prod_001",
      variantId: "variant_001",
      shopDomain: "hotrodan.myshopify.com",
      calculationMethod: "emergency" as const,
      promotionalUplift: 0,
      seasonalAdjustment: 0,
      historicalDays: 7 // Shorter history for emergency
    };

    const result = await calculateROPEngine(params);

    expect(result.calculationMetadata.calculationMethod).toBe("emergency");
    expect(result.calculationMetadata.historicalDays).toBe(7);
    expect(result.ropCalculation.reorderPoint).toBeGreaterThan(0);
  });
});

describe("ROP Calculation Engine - Batch Processing", () => {
  it("should calculate ROP for multiple products", async () => {
    const productIds = ["prod_001", "prod_002", "prod_003"];
    const results = await batchCalculateROP(productIds, "hotrodan.myshopify.com", "standard");

    expect(results).toHaveLength(3);
    results.forEach((result, index) => {
      expect(result.productInfo.productId).toBe(productIds[index]);
      expect(result.ropCalculation.reorderPoint).toBeGreaterThan(0);
      expect(result.vendorRecommendation.estimatedCost).toBeGreaterThan(0);
    });
  });

  it("should handle different calculation methods in batch", async () => {
    const productIds = ["prod_001", "prod_002"];
    const results = await batchCalculateROP(productIds, "hotrodan.myshopify.com", "seasonal");

    expect(results).toHaveLength(2);
    results.forEach(result => {
      expect(result.calculationMetadata.calculationMethod).toBe("seasonal");
      expect(result.ropCalculation.seasonalityFactor).toBeGreaterThanOrEqual(1.0);
    });
  });
});

describe("ROP Calculation Engine - Status Management", () => {
  it("should update suggestion status", async () => {
    const success = await updateROPSuggestionStatus(
      "suggestion_123",
      "approved",
      "operator_001",
      "Approved for immediate ordering"
    );

    expect(success).toBe(true);
  });

  it("should handle different status updates", async () => {
    const statuses = ["pending", "approved", "rejected", "ordered", "cancelled"];
    
    for (const status of statuses) {
      const success = await updateROPSuggestionStatus(
        `suggestion_${status}`,
        status as any,
        "operator_001",
        `Updated to ${status}`
      );
      expect(success).toBe(true);
    }
  });
});

describe("ROP Calculation Engine - Integration", () => {
  it("should meet all acceptance criteria", async () => {
    const params = {
      productId: "prod_001",
      variantId: "variant_001",
      shopDomain: "hotrodan.myshopify.com",
      calculationMethod: "standard" as const,
      promotionalUplift: 10,
      seasonalAdjustment: 15,
      historicalDays: 30
    };

    const result = await calculateROPEngine(params);

    // Acceptance Criteria 1: Daily velocity calculation from order history
    expect(result.ropCalculation.dailyVelocity).toBeGreaterThan(0);
    expect(result.calculationMetadata.orderCount).toBeGreaterThan(0);
    expect(result.calculationMetadata.totalQuantitySold).toBeGreaterThan(0);

    // Acceptance Criteria 2: Lead time demand = velocity × vendor days
    expect(result.ropCalculation.leadTimeDemand).toBeGreaterThan(0);
    expect(result.ropCalculation.leadTimeDemand).toBeGreaterThanOrEqual(
      result.ropCalculation.adjustedDailyVelocity * (result.vendorRecommendation.estimatedEtaDays || 14)
    );

    // Acceptance Criteria 3: Safety stock = Z-score × demand variance
    expect(result.ropCalculation.safetyStock).toBeGreaterThan(0);
    expect(result.calculationMetadata.demandVolatility).toBeGreaterThanOrEqual(0);

    // Acceptance Criteria 4: ROP suggestions stored (suggestion ID exists)
    expect(result.suggestionId).toBeDefined();

    // Acceptance Criteria 5: Handles seasonal trends and promotional uplift
    expect(result.ropCalculation.seasonalityFactor).toBeGreaterThan(1.0);
    expect(result.calculationMetadata.promotionalUplift).toBe(10);
    expect(result.calculationMetadata.seasonalAdjustment).toBe(15);

    // Acceptance Criteria 6: Recommends vendor + qty + ETA + cost impact
    expect(result.vendorRecommendation.vendorId).toBeDefined();
    expect(result.vendorRecommendation.vendorName).toBeDefined();
    expect(result.vendorRecommendation.estimatedCost).toBeGreaterThan(0);
    expect(result.vendorRecommendation.estimatedEtaDays).toBeGreaterThan(0);
    expect(result.vendorRecommendation.costImpact).toBeGreaterThan(0);
  });
});
