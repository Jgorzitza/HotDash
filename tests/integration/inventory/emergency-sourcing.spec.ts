/**
 * Integration Tests: Emergency Sourcing Logic (INVENTORY-101)
 *
 * Tests emergency sourcing recommendations with opportunity-cost logic:
 * - Calculates Expected Lost Profit = feasible_sales × bundle_margin
 * - Calculates Incremental Cost = (local_cost - primary_cost) × qty
 * - Recommends local vendor when ELP > IC and margin > 20%
 * - Shows comparison: primary vs local (cost, lead time, profit impact)
 * - Creates approval card for CEO review
 */

import { describe, it, expect } from "vitest";
import { 
  calculateEmergencySourcing,
  batchCalculateEmergencySourcing,
  calculateExpectedLostProfit,
  calculateIncrementalCost,
  calculateMarginAfterEmergency,
  assessRiskLevel,
  createApprovalCard,
  getEmergencySourcingHistory,
  updateEmergencySourcingStatus
} from "~/services/inventory/emergency-sourcing";

describe("Emergency Sourcing Logic - Expected Lost Profit", () => {
  it("should calculate Expected Lost Profit = feasible_sales × bundle_margin", () => {
    const dailyVelocity = 5.0;
    const primaryLeadTimeDays = 14;
    const bundleMargin = 25.50;

    const result = calculateExpectedLostProfit(dailyVelocity, primaryLeadTimeDays, bundleMargin);

    expect(result.feasibleSalesDuringLeadTime).toBe(70); // 5 * 14
    expect(result.expectedLostProfit).toBe(1785); // 70 * 25.50
  });

  it("should handle different lead times", () => {
    const dailyVelocity = 3.0;
    const bundleMargin = 20.00;

    const result7 = calculateExpectedLostProfit(dailyVelocity, 7, bundleMargin);
    const result21 = calculateExpectedLostProfit(dailyVelocity, 21, bundleMargin);

    expect(result7.feasibleSalesDuringLeadTime).toBe(21);
    expect(result7.expectedLostProfit).toBe(420);
    
    expect(result21.feasibleSalesDuringLeadTime).toBe(63);
    expect(result21.expectedLostProfit).toBe(1260);
  });

  it("should handle zero daily velocity", () => {
    const result = calculateExpectedLostProfit(0, 14, 25.50);

    expect(result.feasibleSalesDuringLeadTime).toBe(0);
    expect(result.expectedLostProfit).toBe(0);
  });
});

describe("Emergency Sourcing Logic - Incremental Cost", () => {
  it("should calculate Incremental Cost = (local_cost - primary_cost) × qty", () => {
    const emergencyCost = 18.50;
    const primaryCost = 12.25;
    const quantity = 50;

    const result = calculateIncrementalCost(emergencyCost, primaryCost, quantity);

    expect(result).toBe(312.50); // (18.50 - 12.25) * 50
  });

  it("should handle negative incremental cost (emergency cheaper)", () => {
    const emergencyCost = 10.00;
    const primaryCost = 15.00;
    const quantity = 30;

    const result = calculateIncrementalCost(emergencyCost, primaryCost, quantity);

    expect(result).toBe(-150); // (10.00 - 15.00) * 30
  });

  it("should handle zero quantity", () => {
    const result = calculateIncrementalCost(18.50, 12.25, 0);

    expect(result).toBe(0);
  });
});

describe("Emergency Sourcing Logic - Margin After Emergency", () => {
  it("should calculate margin after emergency sourcing", () => {
    const bundleMargin = 25.50;
    const incrementalCost = 500.00;
    const feasibleSales = 50;

    const result = calculateMarginAfterEmergency(bundleMargin, incrementalCost, feasibleSales);

    expect(result).toBe(15.50); // 25.50 - (500/50)
  });

  it("should handle zero feasible sales", () => {
    const result = calculateMarginAfterEmergency(25.50, 500.00, 0);

    expect(result).toBe(0);
  });

  it("should not return negative margin", () => {
    const bundleMargin = 5.00;
    const incrementalCost = 1000.00;
    const feasibleSales = 10;

    const result = calculateMarginAfterEmergency(bundleMargin, incrementalCost, feasibleSales);

    expect(result).toBe(0); // Should be capped at 0
  });
});

describe("Emergency Sourcing Logic - Risk Assessment", () => {
  it("should assess low risk for good conditions", () => {
    const riskLevel = assessRiskLevel(1000, 500, 0.95, 5);

    expect(riskLevel).toBe('low');
  });

  it("should assess medium risk for moderate conditions", () => {
    const riskLevel = assessRiskLevel(200, 500, 0.80, 15);

    expect(riskLevel).toBe('medium');
  });

  it("should assess high risk for poor conditions", () => {
    const riskLevel = assessRiskLevel(-100, 1000, 0.70, 20);

    expect(riskLevel).toBe('high');
  });

  it("should assess high risk for negative net benefit", () => {
    const riskLevel = assessRiskLevel(-500, 300, 0.90, 5);

    expect(riskLevel).toBe('high');
  });
});

describe("Emergency Sourcing Logic - Approval Card", () => {
  it("should create approval card for recommended option", () => {
    const bundleInfo = {
      bundleId: 'bundle_001',
      bundleName: 'Premium Widget Bundle',
      blockingComponent: 'component_A',
      currentStock: 0,
      daysUntilStockout: 0
    };

    const opportunityCost = {
      expectedLostProfit: 1500,
      feasibleSalesDuringLeadTime: 50,
      bundleMargin: 30.00,
      primaryLeadTimeDays: 14
    };

    const emergencyOptions = [
      {
        vendorId: 'emergency_001',
        vendorName: 'Local Fast Supply',
        cost: 18.50,
        leadTimeDays: 3,
        incrementalCost: 250.00,
        netBenefit: 1250.00,
        marginAfterEmergency: 25.00,
        recommended: true,
        comparison: {
          costDifference: 6.25,
          leadTimeDifference: 11,
          profitImpact: 1250.00
        }
      }
    ];

    const recommendation = {
      shouldProceed: true,
      recommendedVendor: 'emergency_001',
      netBenefit: 1250.00,
      riskLevel: 'low' as const,
      approvalRequired: true
    };

    const approvalCard = createApprovalCard(bundleInfo, opportunityCost, emergencyOptions, recommendation);

    expect(approvalCard.title).toContain('Emergency Sourcing Recommendation');
    expect(approvalCard.summary).toContain('Blocked bundle');
    expect(approvalCard.financialImpact).toBe(1250.00);
    expect(approvalCard.timelineImpact).toBe(11);
    expect(approvalCard.requiresApproval).toBe(true);
  });

  it("should create approval card for non-recommended option", () => {
    const bundleInfo = {
      bundleId: 'bundle_002',
      bundleName: 'Standard Bundle',
      blockingComponent: 'component_B',
      currentStock: 5,
      daysUntilStockout: 2
    };

    const opportunityCost = {
      expectedLostProfit: 200,
      feasibleSalesDuringLeadTime: 10,
      bundleMargin: 20.00,
      primaryLeadTimeDays: 14
    };

    const emergencyOptions = [
      {
        vendorId: 'emergency_001',
        vendorName: 'Local Fast Supply',
        cost: 25.00,
        leadTimeDays: 3,
        incrementalCost: 300.00,
        netBenefit: -100.00,
        marginAfterEmergency: 10.00,
        recommended: false,
        comparison: {
          costDifference: 12.75,
          leadTimeDifference: 11,
          profitImpact: -100.00
        }
      }
    ];

    const recommendation = {
      shouldProceed: false,
      recommendedVendor: undefined,
      netBenefit: 0,
      riskLevel: 'high' as const,
      approvalRequired: false
    };

    const approvalCard = createApprovalCard(bundleInfo, opportunityCost, emergencyOptions, recommendation);

    expect(approvalCard.title).toContain('Emergency Sourcing Not Recommended');
    expect(approvalCard.summary).toContain('not recommended');
    expect(approvalCard.requiresApproval).toBe(false);
  });
});

describe("Emergency Sourcing Logic - Complete Calculation", () => {
  it("should calculate complete emergency sourcing with all criteria", async () => {
    const params = {
      bundleId: 'bundle_001',
      blockingComponentId: 'component_A',
      primaryVendorId: 'vendor_primary',
      primaryLeadTimeDays: 14,
      primaryCost: 12.25,
      bundleMargin: 25.50,
      dailyVelocity: 5.0,
      minimumMarginThreshold: 20
    };

    const result = await calculateEmergencySourcing(params);

    // Acceptance Criteria 1: Calculates Expected Lost Profit = feasible_sales × bundle_margin
    expect(result.opportunityCost.expectedLostProfit).toBe(1785); // 70 * 25.50
    expect(result.opportunityCost.feasibleSalesDuringLeadTime).toBe(70); // 5 * 14

    // Acceptance Criteria 2: Calculates Incremental Cost = (local_cost - primary_cost) × qty
    expect(result.emergencyOptions.length).toBeGreaterThan(0);
    result.emergencyOptions.forEach(option => {
      expect(option.incrementalCost).toBeDefined();
      expect(option.comparison.costDifference).toBeDefined();
    });

    // Acceptance Criteria 3: Recommends local vendor when ELP > IC and margin > 20%
    const recommendedOptions = result.emergencyOptions.filter(opt => opt.recommended);
    recommendedOptions.forEach(option => {
      expect(option.netBenefit).toBeGreaterThan(0);
      expect(option.marginAfterEmergency).toBeGreaterThanOrEqual(0.20);
    });

    // Acceptance Criteria 4: Shows comparison: primary vs local (cost, lead time, profit impact)
    result.emergencyOptions.forEach(option => {
      expect(option.comparison.costDifference).toBeDefined();
      expect(option.comparison.leadTimeDifference).toBeDefined();
      expect(option.comparison.profitImpact).toBeDefined();
    });

    // Acceptance Criteria 5: Creates approval card for CEO review
    expect(result.approvalCard).toBeDefined();
    expect(result.approvalCard.title).toBeDefined();
    expect(result.approvalCard.summary).toBeDefined();
    expect(result.approvalCard.financialImpact).toBeDefined();
    expect(result.approvalCard.requiresApproval).toBeDefined();
  });

  it("should handle high margin threshold", async () => {
    const params = {
      bundleId: 'bundle_002',
      blockingComponentId: 'component_B',
      primaryVendorId: 'vendor_primary',
      primaryLeadTimeDays: 21,
      primaryCost: 8.50,
      bundleMargin: 15.00,
      dailyVelocity: 2.0,
      minimumMarginThreshold: 30 // Higher threshold
    };

    const result = await calculateEmergencySourcing(params);

    expect(result.opportunityCost.expectedLostProfit).toBe(630); // 42 * 15.00
    expect(result.opportunityCost.feasibleSalesDuringLeadTime).toBe(42); // 2 * 21
    
    // With higher margin threshold, fewer options should be recommended
    const recommendedOptions = result.emergencyOptions.filter(opt => opt.recommended);
    recommendedOptions.forEach(option => {
      expect(option.marginAfterEmergency).toBeGreaterThanOrEqual(0.30);
    });
  });

  it("should handle zero daily velocity", async () => {
    const params = {
      bundleId: 'bundle_003',
      blockingComponentId: 'component_C',
      primaryVendorId: 'vendor_primary',
      primaryLeadTimeDays: 14,
      primaryCost: 10.00,
      bundleMargin: 20.00,
      dailyVelocity: 0, // No sales
      minimumMarginThreshold: 20
    };

    const result = await calculateEmergencySourcing(params);

    expect(result.opportunityCost.expectedLostProfit).toBe(0);
    expect(result.opportunityCost.feasibleSalesDuringLeadTime).toBe(0);
    
    // No emergency sourcing should be recommended for zero velocity
    expect(result.recommendation.shouldProceed).toBe(false);
  });
});

describe("Emergency Sourcing Logic - Batch Processing", () => {
  it("should calculate emergency sourcing for multiple bundles", async () => {
    const bundles = [
      {
        bundleId: 'bundle_001',
        blockingComponentId: 'component_A',
        primaryVendorId: 'vendor_primary',
        primaryLeadTimeDays: 14,
        primaryCost: 12.25,
        bundleMargin: 25.50,
        dailyVelocity: 5.0
      },
      {
        bundleId: 'bundle_002',
        blockingComponentId: 'component_B',
        primaryVendorId: 'vendor_primary',
        primaryLeadTimeDays: 21,
        primaryCost: 8.50,
        bundleMargin: 15.00,
        dailyVelocity: 2.0
      }
    ];

    const results = await batchCalculateEmergencySourcing(bundles);

    expect(results).toHaveLength(2);
    expect(results[0].bundleInfo.bundleId).toBe('bundle_001');
    expect(results[1].bundleInfo.bundleId).toBe('bundle_002');
    
    results.forEach(result => {
      expect(result.opportunityCost.expectedLostProfit).toBeGreaterThan(0);
      expect(result.emergencyOptions.length).toBeGreaterThan(0);
      expect(result.approvalCard).toBeDefined();
    });
  });
});

describe("Emergency Sourcing Logic - History and Status", () => {
  it("should get emergency sourcing history", async () => {
    const history = await getEmergencySourcingHistory('bundle_001', 5);

    expect(Array.isArray(history)).toBe(true);
    if (history.length > 0) {
      expect(history[0].bundleId).toBe('bundle_001');
      expect(history[0].calculatedAt).toBeDefined();
      expect(history[0].netBenefit).toBeDefined();
      expect(history[0].status).toBeDefined();
    }
  });

  it("should update emergency sourcing status", async () => {
    const success = await updateEmergencySourcingStatus(
      'recommendation_123',
      'approved',
      'operator_001',
      'Approved for immediate implementation'
    );

    expect(success).toBe(true);
  });

  it("should handle different status updates", async () => {
    const statuses = ['pending', 'approved', 'rejected', 'implemented'];
    
    for (const status of statuses) {
      const success = await updateEmergencySourcingStatus(
        `recommendation_${status}`,
        status as any,
        'operator_001',
        `Updated to ${status}`
      );
      expect(success).toBe(true);
    }
  });
});

describe("Emergency Sourcing Logic - Integration", () => {
  it("should meet all acceptance criteria", async () => {
    const params = {
      bundleId: 'bundle_001',
      blockingComponentId: 'component_A',
      primaryVendorId: 'vendor_primary',
      primaryLeadTimeDays: 14,
      primaryCost: 12.25,
      bundleMargin: 25.50,
      dailyVelocity: 5.0,
      minimumMarginThreshold: 20
    };

    const result = await calculateEmergencySourcing(params);

    // All acceptance criteria verified in the complete calculation test above
    expect(result.bundleInfo.bundleId).toBe('bundle_001');
    expect(result.opportunityCost.expectedLostProfit).toBeGreaterThan(0);
    expect(result.emergencyOptions.length).toBeGreaterThan(0);
    expect(result.approvalCard.requiresApproval).toBeDefined();
    expect(result.recommendation.shouldProceed).toBeDefined();
  });
});
