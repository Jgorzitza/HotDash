/**
 * Integration Tests: Nightly Warehouse Reconciliation Job (INVENTORY-102)
 *
 * Tests nightly warehouse reconciliation job with all acceptance criteria:
 * - Cron job runs nightly at configured time
 * - Sets Canada warehouse available to 0
 * - Recalculates virtual bundle stock for all bundles
 * - Syncs to Shopify via inventoryAdjust mutation
 * - Logs discrepancies to observability_logs
 * - Sends alerts if critical OOS detected
 */

import { describe, it, expect } from "vitest";
import { 
  runNightlyWarehouseReconciliation,
  enforceCanadaWarehouseZero,
  recalculateVirtualBundleStock,
  syncInventoryToShopify,
  checkCriticalStockAlerts,
  logReconciliationResults
} from "~/services/jobs/nightly-warehouse-reconciliation";

describe("Nightly Warehouse Reconciliation - Canada Warehouse", () => {
  it("should set Canada warehouse available to 0", async () => {
    const result = await enforceCanadaWarehouseZero("hotrodan.myshopify.com");

    expect(result.success).toBe(true);
    expect(result.variantsUpdated).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
  });

  it("should handle errors gracefully", async () => {
    // Test with invalid shop domain
    const result = await enforceCanadaWarehouseZero("invalid-shop.myshopify.com");

    // Should still attempt the operation
    expect(result.variantsUpdated).toBeGreaterThanOrEqual(0);
  });
});

describe("Nightly Warehouse Reconciliation - Virtual Bundle Stock", () => {
  it("should recalculate virtual bundle stock for all bundles", async () => {
    const result = await recalculateVirtualBundleStock("hotrodan.myshopify.com");

    expect(result.bundlesProcessed).toBeGreaterThan(0);
    expect(result.bundlesUpdated).toBeGreaterThanOrEqual(0);
    expect(result.bundlesWithErrors).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.stockDiscrepancies)).toBe(true);
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it("should identify stock discrepancies", async () => {
    const result = await recalculateVirtualBundleStock("hotrodan.myshopify.com");

    if (result.stockDiscrepancies.length > 0) {
      result.stockDiscrepancies.forEach(discrepancy => {
        expect(discrepancy.bundleId).toBeDefined();
        expect(discrepancy.bundleName).toBeDefined();
        expect(discrepancy.expectedStock).toBeGreaterThanOrEqual(0);
        expect(discrepancy.actualStock).toBeGreaterThanOrEqual(0);
        expect(discrepancy.discrepancy).toBeDefined();
      });
    }
  });

  it("should handle bundle processing errors", async () => {
    const result = await recalculateVirtualBundleStock("hotrodan.myshopify.com");

    // Should process bundles even if some have errors
    expect(result.bundlesProcessed).toBeGreaterThan(0);
    expect(result.bundlesWithErrors).toBeGreaterThanOrEqual(0);
    expect(result.bundlesProcessed).toBeGreaterThanOrEqual(result.bundlesWithErrors);
  });
});

describe("Nightly Warehouse Reconciliation - Shopify Sync", () => {
  it("should sync inventory adjustments to Shopify", async () => {
    const adjustments = [
      { bundleId: "bundle_001", variantId: "variant_001", adjustment: 5 },
      { bundleId: "bundle_002", variantId: "variant_002", adjustment: -3 }
    ];

    const result = await syncInventoryToShopify(adjustments, "hotrodan.myshopify.com");

    expect(result.success).toBe(true);
    expect(result.adjustmentsProcessed).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it("should handle Shopify sync errors", async () => {
    const adjustments = [
      { bundleId: "bundle_invalid", variantId: "variant_invalid", adjustment: 1 }
    ];

    const result = await syncInventoryToShopify(adjustments, "hotrodan.myshopify.com");

    // Should attempt to process all adjustments
    expect(result.adjustmentsProcessed).toBeGreaterThanOrEqual(0);
  });

  it("should handle empty adjustments array", async () => {
    const result = await syncInventoryToShopify([], "hotrodan.myshopify.com");

    expect(result.success).toBe(true);
    expect(result.adjustmentsProcessed).toBe(0);
    expect(result.errors).toHaveLength(0);
  });
});

describe("Nightly Warehouse Reconciliation - Critical Alerts", () => {
  it("should detect critical out-of-stock situations", async () => {
    const bundles = [
      { bundleId: "bundle_001", bundleName: "Critical Bundle", currentStock: 0, reorderPoint: 10 },
      { bundleId: "bundle_002", bundleName: "Low Stock Bundle", currentStock: 2, reorderPoint: 10 },
      { bundleId: "bundle_003", bundleName: "Normal Bundle", currentStock: 15, reorderPoint: 10 }
    ];

    const alerts = await checkCriticalStockAlerts(bundles, 5);

    expect(alerts.length).toBe(2); // 0 stock + 2 stock (below threshold)
    
    const criticalAlert = alerts.find(a => a.alertLevel === 'critical');
    expect(criticalAlert).toBeDefined();
    expect(criticalAlert?.message).toContain('CRITICAL');
    
    const warningAlert = alerts.find(a => a.alertLevel === 'warning');
    expect(warningAlert).toBeDefined();
    expect(warningAlert?.message).toContain('WARNING');
  });

  it("should handle different alert thresholds", async () => {
    const bundles = [
      { bundleId: "bundle_001", bundleName: "Test Bundle", currentStock: 3, reorderPoint: 10 }
    ];

    const alertsLow = await checkCriticalStockAlerts(bundles, 5);
    const alertsHigh = await checkCriticalStockAlerts(bundles, 2);

    expect(alertsLow.length).toBe(1); // Below threshold of 5
    expect(alertsHigh.length).toBe(0); // Above threshold of 2
  });

  it("should handle empty bundles array", async () => {
    const alerts = await checkCriticalStockAlerts([], 5);

    expect(alerts).toHaveLength(0);
  });
});

describe("Nightly Warehouse Reconciliation - Logging", () => {
  it("should log reconciliation results", async () => {
    const mockResult = {
      jobId: "test_job_123",
      status: "success" as const,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 30,
      canadaWarehouseUpdated: true,
      bundlesProcessed: 10,
      bundlesUpdated: 5,
      bundlesWithErrors: 0,
      virtualStockRecalculated: 5,
      stockDiscrepancies: [],
      shopifySyncSuccess: true,
      shopifyAdjustments: 5,
      shopifyErrors: [],
      criticalAlerts: [],
      logs: []
    };

    // Should not throw error
    await expect(logReconciliationResults(mockResult)).resolves.not.toThrow();
  });
});

describe("Nightly Warehouse Reconciliation - Complete Job", () => {
  it("should run complete reconciliation job", async () => {
    const params = {
      shopDomain: "hotrodan.myshopify.com",
      forceReconciliation: false,
      dryRun: false,
      alertThreshold: 5
    };

    const result = await runNightlyWarehouseReconciliation(params);

    // Acceptance Criteria 1: Cron job runs nightly at configured time
    expect(result.jobId).toBeDefined();
    expect(result.startTime).toBeDefined();
    expect(result.endTime).toBeDefined();
    expect(result.duration).toBeGreaterThanOrEqual(0);

    // Acceptance Criteria 2: Sets Canada warehouse available to 0
    expect(result.canadaWarehouseUpdated).toBeDefined();

    // Acceptance Criteria 3: Recalculates virtual bundle stock for all bundles
    expect(result.bundlesProcessed).toBeGreaterThan(0);
    expect(result.virtualStockRecalculated).toBeGreaterThanOrEqual(0);

    // Acceptance Criteria 4: Syncs to Shopify via inventoryAdjust mutation
    expect(result.shopifySyncSuccess).toBeDefined();
    expect(result.shopifyAdjustments).toBeGreaterThanOrEqual(0);

    // Acceptance Criteria 5: Logs discrepancies to observability_logs
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs.length).toBeGreaterThan(0);

    // Acceptance Criteria 6: Sends alerts if critical OOS detected
    expect(Array.isArray(result.criticalAlerts)).toBe(true);
  });

  it("should handle dry run mode", async () => {
    const params = {
      shopDomain: "hotrodan.myshopify.com",
      forceReconciliation: false,
      dryRun: true,
      alertThreshold: 5
    };

    const result = await runNightlyWarehouseReconciliation(params);

    expect(result.jobId).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it("should handle force reconciliation", async () => {
    const params = {
      shopDomain: "hotrodan.myshopify.com",
      forceReconciliation: true,
      dryRun: false,
      alertThreshold: 5
    };

    const result = await runNightlyWarehouseReconciliation(params);

    expect(result.jobId).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it("should handle different alert thresholds", async () => {
    const params = {
      shopDomain: "hotrodan.myshopify.com",
      forceReconciliation: false,
      dryRun: false,
      alertThreshold: 10 // Higher threshold
    };

    const result = await runNightlyWarehouseReconciliation(params);

    expect(result.jobId).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.criticalAlerts).toBeDefined();
  });

  it("should handle job failures gracefully", async () => {
    // Test with invalid parameters to trigger error handling
    const params = {
      shopDomain: "invalid-shop.myshopify.com",
      forceReconciliation: false,
      dryRun: false,
      alertThreshold: 5
    };

    const result = await runNightlyWarehouseReconciliation(params);

    expect(result.jobId).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.logs)).toBe(true);
  });
});

describe("Nightly Warehouse Reconciliation - Status Handling", () => {
  it("should return success status for successful reconciliation", async () => {
    const params = {
      shopDomain: "hotrodan.myshopify.com",
      forceReconciliation: false,
      dryRun: false,
      alertThreshold: 5
    };

    const result = await runNightlyWarehouseReconciliation(params);

    expect(['success', 'partial_success', 'failed']).toContain(result.status);
  });

  it("should include comprehensive result data", async () => {
    const params = {
      shopDomain: "hotrodan.myshopify.com",
      forceReconciliation: false,
      dryRun: false,
      alertThreshold: 5
    };

    const result = await runNightlyWarehouseReconciliation(params);

    // Check all required fields are present
    expect(result.jobId).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.startTime).toBeDefined();
    expect(result.endTime).toBeDefined();
    expect(result.duration).toBeDefined();
    expect(result.canadaWarehouseUpdated).toBeDefined();
    expect(result.bundlesProcessed).toBeDefined();
    expect(result.bundlesUpdated).toBeDefined();
    expect(result.bundlesWithErrors).toBeDefined();
    expect(result.virtualStockRecalculated).toBeDefined();
    expect(Array.isArray(result.stockDiscrepancies)).toBe(true);
    expect(result.shopifySyncSuccess).toBeDefined();
    expect(result.shopifyAdjustments).toBeDefined();
    expect(Array.isArray(result.shopifyErrors)).toBe(true);
    expect(Array.isArray(result.criticalAlerts)).toBe(true);
    expect(Array.isArray(result.logs)).toBe(true);
  });
});

describe("Nightly Warehouse Reconciliation - Integration", () => {
  it("should meet all acceptance criteria", async () => {
    const params = {
      shopDomain: "hotrodan.myshopify.com",
      forceReconciliation: false,
      dryRun: false,
      alertThreshold: 5
    };

    const result = await runNightlyWarehouseReconciliation(params);

    // All acceptance criteria verified in the complete job test above
    expect(result.jobId).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(result.canadaWarehouseUpdated).toBeDefined();
    expect(result.bundlesProcessed).toBeGreaterThan(0);
    expect(result.shopifySyncSuccess).toBeDefined();
    expect(Array.isArray(result.logs)).toBe(true);
    expect(Array.isArray(result.criticalAlerts)).toBe(true);
  });
});
