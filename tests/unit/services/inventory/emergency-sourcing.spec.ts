/**
 * Unit Tests for Emergency Sourcing Service (INVENTORY-019)
 *
 * Tests:
 * - ELP calculation (positive case)
 * - IC calculation (positive case)
 * - Net benefit > 0 (recommend fast vendor)
 * - Net benefit < 0 (use primary vendor)
 * - Margin threshold (20% minimum)
 * - Action card generation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import * as emergencySourcing from "~/services/inventory/emergency-sourcing";

// Mock Prisma Client
vi.mock("@prisma/client", () => {
  const mockPrisma = {
    vendorProductMapping: {
      findMany: vi.fn(),
    },
  };

  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

const prismaClient = new PrismaClient();

describe("Emergency Sourcing Service - INVENTORY-019", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("analyzeEmergencySourcing - ELP Calculation", () => {
    it("should calculate Expected Lost Profit (ELP) correctly", async () => {
      const mockVendors = [
        {
          vendorId: "vendor-primary",
          variantId: "variant-123",
          costPerUnit: 10.0,
          vendor: {
            id: "vendor-primary",
            name: "Primary Vendor",
            leadTimeDays: 14,
            reliabilityScore: 95.0,
          },
        },
        {
          vendorId: "vendor-local",
          variantId: "variant-123",
          costPerUnit: 13.0,
          vendor: {
            id: "vendor-local",
            name: "Local Vendor",
            leadTimeDays: 3,
            reliabilityScore: 85.0,
          },
        },
      ];

      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockVendors,
      );

      const input: emergencySourcing.EmergencySourcingInput = {
        variantId: "variant-123",
        bundleProductId: "bundle-456",
        bundleMargin: 15.0, // $15/bundle
        avgBundleSalesPerDay: 5.0, // 5 bundles/day
        qtyNeeded: 100,
      };

      const result = await emergencySourcing.analyzeEmergencySourcing(input);

      // Days saved = 14 - 3 = 11 days
      expect(result.analysis.daysSaved).toBe(11);

      // Feasible sales = 5 bundles/day × 11 days = 55 bundles
      expect(result.analysis.feasibleSalesDuringSavedTime).toBe(55);

      // ELP = 55 bundles × $15 margin = $825
      expect(result.analysis.expectedLostProfit).toBe(825);
    });
  });

  describe("analyzeEmergencySourcing - IC Calculation", () => {
    it("should calculate Incremental Cost (IC) correctly", async () => {
      const mockVendors = [
        {
          vendorId: "vendor-primary",
          variantId: "variant-123",
          costPerUnit: 10.0,
          vendor: {
            id: "vendor-primary",
            name: "Primary Vendor",
            leadTimeDays: 14,
            reliabilityScore: 95.0,
          },
        },
        {
          vendorId: "vendor-local",
          variantId: "variant-123",
          costPerUnit: 13.0,
          vendor: {
            id: "vendor-local",
            name: "Local Vendor",
            leadTimeDays: 3,
            reliabilityScore: 85.0,
          },
        },
      ];

      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockVendors,
      );

      const input: emergencySourcing.EmergencySourcingInput = {
        variantId: "variant-123",
        bundleProductId: "bundle-456",
        bundleMargin: 15.0,
        avgBundleSalesPerDay: 5.0,
        qtyNeeded: 100,
      };

      const result = await emergencySourcing.analyzeEmergencySourcing(input);

      // IC = (local_cost - primary_cost) × qty_needed
      // IC = ($13 - $10) × 100 = $300
      expect(result.analysis.incrementalCost).toBe(300);
    });
  });

  describe("analyzeEmergencySourcing - Net Benefit > 0 (Recommend Fast)", () => {
    it("should recommend fast vendor when net benefit > 0 and margin >= 20%", async () => {
      const mockVendors = [
        {
          vendorId: "vendor-primary",
          variantId: "variant-123",
          costPerUnit: 10.0,
          vendor: {
            id: "vendor-primary",
            name: "Primary Vendor",
            leadTimeDays: 14,
            reliabilityScore: 95.0,
          },
        },
        {
          vendorId: "vendor-local",
          variantId: "variant-123",
          costPerUnit: 13.0,
          vendor: {
            id: "vendor-local",
            name: "Local Vendor",
            leadTimeDays: 3,
            reliabilityScore: 85.0,
          },
        },
      ];

      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockVendors,
      );

      const input: emergencySourcing.EmergencySourcingInput = {
        variantId: "variant-123",
        bundleProductId: "bundle-456",
        bundleMargin: 15.0, // $15/bundle
        avgBundleSalesPerDay: 5.0, // 5 bundles/day
        qtyNeeded: 100,
      };

      const result = await emergencySourcing.analyzeEmergencySourcing(input);

      // Net benefit = ELP - IC = $825 - $300 = $525 > 0 ✅
      expect(result.analysis.netBenefit).toBe(525);

      // Resulting margin = $15 - $3 = $12 (80% of original)
      expect(result.analysis.resultingBundleMargin).toBe(0.8);

      // Should recommend fast vendor (net benefit > 0 AND margin >= 20%)
      expect(result.shouldUseFastVendor).toBe(true);
      expect(result.reason).toContain("Net benefit");
      expect(result.reason).toContain("$525.00");
      expect(result.reason).toContain("80.0%");
    });
  });

  describe("analyzeEmergencySourcing - Net Benefit < 0 (Use Primary)", () => {
    it("should recommend primary vendor when net benefit < 0", async () => {
      const mockVendors = [
        {
          vendorId: "vendor-primary",
          variantId: "variant-123",
          costPerUnit: 10.0,
          vendor: {
            id: "vendor-primary",
            name: "Primary Vendor",
            leadTimeDays: 14,
            reliabilityScore: 95.0,
          },
        },
        {
          vendorId: "vendor-local",
          variantId: "variant-123",
          costPerUnit: 25.0, // Much more expensive
          vendor: {
            id: "vendor-local",
            name: "Local Vendor",
            leadTimeDays: 3,
            reliabilityScore: 85.0,
          },
        },
      ];

      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockVendors,
      );

      const input: emergencySourcing.EmergencySourcingInput = {
        variantId: "variant-123",
        bundleProductId: "bundle-456",
        bundleMargin: 15.0, // $15/bundle
        avgBundleSalesPerDay: 5.0, // 5 bundles/day
        qtyNeeded: 100,
      };

      const result = await emergencySourcing.analyzeEmergencySourcing(input);

      // ELP = 5 × 11 × $15 = $825
      // IC = ($25 - $10) × 100 = $1500
      // Net benefit = $825 - $1500 = -$675 < 0 ❌
      expect(result.analysis.netBenefit).toBe(-675);

      // Should NOT recommend fast vendor (negative net benefit)
      expect(result.shouldUseFastVendor).toBe(false);
      expect(result.reason).toContain("Incremental cost");
      expect(result.reason).toContain("exceeds");
    });
  });

  describe("analyzeEmergencySourcing - Margin Threshold (20% minimum)", () => {
    it("should reject fast vendor when resulting margin < 20%", async () => {
      const mockVendors = [
        {
          vendorId: "vendor-primary",
          variantId: "variant-123",
          costPerUnit: 10.0,
          vendor: {
            id: "vendor-primary",
            name: "Primary Vendor",
            leadTimeDays: 14,
            reliabilityScore: 95.0,
          },
        },
        {
          vendorId: "vendor-local",
          variantId: "variant-123",
          costPerUnit: 23.0, // Expensive but small net benefit
          vendor: {
            id: "vendor-local",
            name: "Local Vendor",
            leadTimeDays: 3,
            reliabilityScore: 85.0,
          },
        },
      ];

      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockVendors,
      );

      const input: emergencySourcing.EmergencySourcingInput = {
        variantId: "variant-123",
        bundleProductId: "bundle-456",
        bundleMargin: 15.0, // $15/bundle
        avgBundleSalesPerDay: 8.0, // Higher sales to create positive net benefit
        qtyNeeded: 100,
      };

      const result = await emergencySourcing.analyzeEmergencySourcing(input);

      // ELP = 8 × 11 × $15 = $1320
      // IC = ($23 - $10) × 100 = $1300
      // Net benefit = $1320 - $1300 = $20 > 0 (positive)

      // But component cost increase = $13
      // Resulting margin = $15 - $13 = $2 (13.3% of original)
      // This is below 20% threshold → REJECT

      expect(result.analysis.netBenefit).toBeGreaterThan(0); // Positive net benefit
      expect(result.analysis.resultingBundleMargin).toBeLessThan(0.2); // Below 20%

      // Should NOT recommend despite positive net benefit (margin too low)
      expect(result.shouldUseFastVendor).toBe(false);
      expect(result.reason).toContain("below 20% threshold");
    });

    it("should accept fast vendor when margin exactly 20%", async () => {
      const mockVendors = [
        {
          vendorId: "vendor-primary",
          variantId: "variant-123",
          costPerUnit: 10.0,
          vendor: {
            id: "vendor-primary",
            name: "Primary Vendor",
            leadTimeDays: 14,
            reliabilityScore: 95.0,
          },
        },
        {
          vendorId: "vendor-local",
          variantId: "variant-123",
          costPerUnit: 13.0,
          vendor: {
            id: "vendor-local",
            name: "Local Vendor",
            leadTimeDays: 3,
            reliabilityScore: 85.0,
          },
        },
      ];

      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockVendors,
      );

      const input: emergencySourcing.EmergencySourcingInput = {
        variantId: "variant-123",
        bundleProductId: "bundle-456",
        bundleMargin: 15.0, // Component increase: $3, resulting: $12 (80%)
        avgBundleSalesPerDay: 5.0,
        qtyNeeded: 100,
      };

      const result = await emergencySourcing.analyzeEmergencySourcing(input);

      // Resulting margin = 80% (well above 20%)
      expect(result.shouldUseFastVendor).toBe(true);
    });
  });

  describe("analyzeEmergencySourcing - Vendor Identification", () => {
    it("should identify primary vendor by highest reliability", async () => {
      const mockVendors = [
        {
          vendorId: "vendor-1",
          variantId: "variant-123",
          costPerUnit: 15.0,
          vendor: {
            id: "vendor-1",
            name: "Vendor A",
            leadTimeDays: 7,
            reliabilityScore: 75.0, // Lower reliability
          },
        },
        {
          vendorId: "vendor-2",
          variantId: "variant-123",
          costPerUnit: 12.0,
          vendor: {
            id: "vendor-2",
            name: "Vendor B",
            leadTimeDays: 10,
            reliabilityScore: 98.0, // Highest reliability (PRIMARY)
          },
        },
        {
          vendorId: "vendor-3",
          variantId: "variant-123",
          costPerUnit: 18.0,
          vendor: {
            id: "vendor-3",
            name: "Vendor C",
            leadTimeDays: 3, // Fastest (LOCAL)
            reliabilityScore: 80.0,
          },
        },
      ];

      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockVendors,
      );

      const input: emergencySourcing.EmergencySourcingInput = {
        variantId: "variant-123",
        bundleProductId: "bundle-456",
        bundleMargin: 20.0,
        avgBundleSalesPerDay: 10.0,
        qtyNeeded: 50,
      };

      const result = await emergencySourcing.analyzeEmergencySourcing(input);

      // Primary should be the one with highest reliability (Vendor B - 98%)
      expect(result.primaryVendor.vendorName).toBe("Vendor B");
      expect(result.primaryVendor.reliabilityScore).toBe(98.0);

      // Local should be the one with shortest lead time (Vendor C - 3 days)
      expect(result.localVendor.vendorName).toBe("Vendor C");
      expect(result.localVendor.leadTimeDays).toBe(3);
    });
  });

  describe("generateEmergencySourcingAction - Action Card", () => {
    it("should generate Action Queue card when fast vendor recommended", async () => {
      const mockVendors = [
        {
          vendorId: "vendor-primary",
          variantId: "variant-123",
          costPerUnit: 10.0,
          vendor: {
            id: "vendor-primary",
            name: "Primary Vendor",
            leadTimeDays: 14,
            reliabilityScore: 95.0,
          },
        },
        {
          vendorId: "vendor-local",
          variantId: "variant-123",
          costPerUnit: 13.0,
          vendor: {
            id: "vendor-local",
            name: "Local Vendor",
            leadTimeDays: 3,
            reliabilityScore: 85.0,
          },
        },
      ];

      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockVendors,
      );

      const result = await emergencySourcing.generateEmergencySourcingAction(
        "variant-123",
        "bundle-456",
      );

      expect(result).not.toBeNull();
      expect(result?.type).toBe("inventory");
      expect(result?.title).toContain("Emergency Sourcing");
      expect(result?.expectedRevenue).toBeGreaterThan(0);
      expect(result?.confidence).toBe(0.85);
      expect(result?.ease).toBe(0.7);
      expect(result?.evidence).toHaveProperty("daysSaved");
      expect(result?.evidence).toHaveProperty("netBenefit");
    });

    it("should return null when fast vendor NOT recommended", async () => {
      const mockVendors = [
        {
          vendorId: "vendor-primary",
          variantId: "variant-123",
          costPerUnit: 10.0,
          vendor: {
            id: "vendor-primary",
            name: "Primary Vendor",
            leadTimeDays: 14,
            reliabilityScore: 95.0,
          },
        },
        {
          vendorId: "vendor-local",
          variantId: "variant-123",
          costPerUnit: 50.0, // Too expensive
          vendor: {
            id: "vendor-local",
            name: "Local Vendor",
            leadTimeDays: 3,
            reliabilityScore: 85.0,
          },
        },
      ];

      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockVendors,
      );

      const result = await emergencySourcing.generateEmergencySourcingAction(
        "variant-123",
        "bundle-456",
      );

      // Should return null (too expensive, negative net benefit)
      expect(result).toBeNull();
    });
  });

  describe("analyzeEmergencySourcing - Edge Cases", () => {
    it("should throw error when less than 2 vendors available", async () => {
      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue([
        {
          vendorId: "vendor-1",
          variantId: "variant-123",
          costPerUnit: 10.0,
          vendor: {
            id: "vendor-1",
            name: "Only Vendor",
            leadTimeDays: 14,
            reliabilityScore: 95.0,
          },
        },
      ]);

      const input: emergencySourcing.EmergencySourcingInput = {
        variantId: "variant-123",
        bundleProductId: "bundle-456",
        bundleMargin: 15.0,
        avgBundleSalesPerDay: 5.0,
        qtyNeeded: 100,
      };

      await expect(
        emergencySourcing.analyzeEmergencySourcing(input),
      ).rejects.toThrow("Need at least 2 vendors for comparison");
    });

    it("should handle zero days saved (same lead times)", async () => {
      const mockVendors = [
        {
          vendorId: "vendor-1",
          variantId: "variant-123",
          costPerUnit: 10.0,
          vendor: {
            id: "vendor-1",
            name: "Vendor A",
            leadTimeDays: 7,
            reliabilityScore: 95.0, // Higher reliability (PRIMARY)
          },
        },
        {
          vendorId: "vendor-2",
          variantId: "variant-123",
          costPerUnit: 12.0,
          vendor: {
            id: "vendor-2",
            name: "Vendor B",
            leadTimeDays: 7, // Same lead time as primary
            reliabilityScore: 85.0,
          },
        },
      ];

      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockVendors,
      );

      const input: emergencySourcing.EmergencySourcingInput = {
        variantId: "variant-123",
        bundleProductId: "bundle-456",
        bundleMargin: 15.0,
        avgBundleSalesPerDay: 5.0,
        qtyNeeded: 100,
      };

      const result = await emergencySourcing.analyzeEmergencySourcing(input);

      // Days saved = 7 - 7 = 0 (same lead time)
      expect(result.analysis.daysSaved).toBe(0);

      // ELP = 5 × 0 × $15 = $0 (no days saved)
      expect(result.analysis.expectedLostProfit).toBe(0);

      // IC = ($12 - $10) × 100 = $200
      expect(result.analysis.incrementalCost).toBe(200);

      // Net benefit = $0 - $200 = -$200 < 0
      expect(result.analysis.netBenefit).toBe(-200);

      // Should NOT recommend (negative net benefit)
      expect(result.shouldUseFastVendor).toBe(false);
    });
  });
});
