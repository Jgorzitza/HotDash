/**
 * Unit Tests for Vendor Service Enhancement (INVENTORY-016)
 *
 * Tests:
 * - Reliability score calculation
 * - Best vendor selection (all 3 criteria)
 * - Vendor options formatting
 * - Score update on PO receipt
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";

// Mock Prisma Client
vi.mock("@prisma/client", () => {
  const mockPrisma = {
    vendor: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    vendorProductMapping: {
      findMany: vi.fn(),
    },
    purchaseOrder: {
      findMany: vi.fn(),
    },
  };

  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

// Import after mocking
const prismaClient = new PrismaClient();
import * as vendorService from "~/services/inventory/vendor-service";

describe("Vendor Service - INVENTORY-016", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getVendorWithMetrics", () => {
    it("should return vendor with calculated reliability score", async () => {
      const mockVendor = {
        id: "vendor-123",
        name: "Premium Suppliers",
        totalOrders: 100,
        onTimeDeliveries: 92,
        lateDeliveries: 8,
        leadTimeDays: 7,
        reliabilityScore: null,
        productMappings: [],
      };

      const mockPurchaseOrders = [
        {
          id: "po-1",
          vendorId: "vendor-123",
          orderDate: new Date("2025-10-01"),
          actualDeliveryDate: new Date("2025-10-08"),
        },
        {
          id: "po-2",
          vendorId: "vendor-123",
          orderDate: new Date("2025-10-05"),
          actualDeliveryDate: new Date("2025-10-12"),
        },
      ];

      vi.mocked(prismaClient.vendor.findUnique).mockResolvedValue(mockVendor);
      vi.mocked(prismaClient.purchaseOrder.findMany).mockResolvedValue(
        mockPurchaseOrders,
      );

      const result = await vendorService.getVendorWithMetrics("vendor-123");

      expect(result).not.toBeNull();
      expect(result?.reliabilityScore).toBe(92); // (92 / 100) * 100
      expect(result?.avgLeadTimeDays).toBe(7); // Average of 7 and 7 days
    });

    it("should return null for non-existent vendor", async () => {
      vi.mocked(prismaClient.vendor.findUnique).mockResolvedValue(null);

      const result = await vendorService.getVendorWithMetrics("invalid-id");

      expect(result).toBeNull();
    });

    it("should handle vendor with no orders", async () => {
      const mockVendor = {
        id: "vendor-123",
        name: "New Vendor",
        totalOrders: 0,
        onTimeDeliveries: 0,
        lateDeliveries: 0,
        leadTimeDays: 14,
        reliabilityScore: null,
        productMappings: [],
      };

      vi.mocked(prismaClient.vendor.findUnique).mockResolvedValue(mockVendor);
      vi.mocked(prismaClient.purchaseOrder.findMany).mockResolvedValue([]);

      const result = await vendorService.getVendorWithMetrics("vendor-123");

      expect(result).not.toBeNull();
      expect(result?.reliabilityScore).toBe(0);
      expect(result?.avgLeadTimeDays).toBe(0);
    });
  });

  describe("updateVendorReliability", () => {
    it("should increment onTimeDeliveries when delivery is on time", async () => {
      const mockVendor = {
        totalOrders: 10,
        onTimeDeliveries: 8,
        lateDeliveries: 2,
      };

      vi.mocked(prismaClient.vendor.findUnique).mockResolvedValue(mockVendor);
      vi.mocked(prismaClient.vendor.update).mockResolvedValue({
        ...mockVendor,
        totalOrders: 11,
        onTimeDeliveries: 9,
        reliabilityScore: 81.82,
      });

      const expectedDate = new Date("2025-10-15");
      const actualDate = new Date("2025-10-14"); // 1 day early

      const result = await vendorService.updateVendorReliability(
        "vendor-123",
        expectedDate,
        actualDate,
      );

      expect(result.onTime).toBe(true);
      expect(result.reliabilityScore).toBe(81.82);
      expect(result.totalOrders).toBe(11);
      expect(result.onTimeDeliveries).toBe(9);

      expect(prismaClient.vendor.update).toHaveBeenCalledWith({
        where: { id: "vendor-123" },
        data: {
          totalOrders: 11,
          onTimeDeliveries: 9,
          lateDeliveries: 2,
          reliabilityScore: 81.82,
        },
      });
    });

    it("should increment lateDeliveries when delivery is late", async () => {
      const mockVendor = {
        totalOrders: 10,
        onTimeDeliveries: 8,
        lateDeliveries: 2,
      };

      vi.mocked(prismaClient.vendor.findUnique).mockResolvedValue(mockVendor);
      vi.mocked(prismaClient.vendor.update).mockResolvedValue({
        ...mockVendor,
        totalOrders: 11,
        lateDeliveries: 3,
        reliabilityScore: 72.73,
      });

      const expectedDate = new Date("2025-10-15");
      const actualDate = new Date("2025-10-18"); // 3 days late (beyond grace period)

      const result = await vendorService.updateVendorReliability(
        "vendor-123",
        expectedDate,
        actualDate,
      );

      expect(result.onTime).toBe(false);
      expect(result.reliabilityScore).toBe(72.73);

      expect(prismaClient.vendor.update).toHaveBeenCalledWith({
        where: { id: "vendor-123" },
        data: {
          totalOrders: 11,
          onTimeDeliveries: 8,
          lateDeliveries: 3,
          reliabilityScore: 72.73,
        },
      });
    });

    it("should allow 1 day grace period", async () => {
      const mockVendor = {
        totalOrders: 10,
        onTimeDeliveries: 8,
        lateDeliveries: 2,
      };

      vi.mocked(prismaClient.vendor.findUnique).mockResolvedValue(mockVendor);
      vi.mocked(prismaClient.vendor.update).mockResolvedValue({
        ...mockVendor,
        totalOrders: 11,
        onTimeDeliveries: 9,
      });

      const expectedDate = new Date("2025-10-15");
      const actualDate = new Date("2025-10-16"); // 1 day late (within grace period)

      const result = await vendorService.updateVendorReliability(
        "vendor-123",
        expectedDate,
        actualDate,
      );

      expect(result.onTime).toBe(true); // Within grace period
    });
  });

  describe("getBestVendorForProduct", () => {
    const mockMappings = [
      {
        id: "mapping-1",
        vendorId: "vendor-1",
        variantId: "variant-123",
        costPerUnit: 25.0,
        vendor: {
          id: "vendor-1",
          name: "Fast Vendor",
          leadTimeDays: 3,
          reliabilityScore: 85.0,
        },
      },
      {
        id: "mapping-2",
        vendorId: "vendor-2",
        variantId: "variant-123",
        costPerUnit: 20.0,
        vendor: {
          id: "vendor-2",
          name: "Cheap Vendor",
          leadTimeDays: 14,
          reliabilityScore: 70.0,
        },
      },
      {
        id: "mapping-3",
        vendorId: "vendor-3",
        variantId: "variant-123",
        costPerUnit: 30.0,
        vendor: {
          id: "vendor-3",
          name: "Reliable Vendor",
          leadTimeDays: 7,
          reliabilityScore: 95.0,
        },
      },
    ];

    it("should return best vendor by reliability (default)", async () => {
      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockMappings,
      );

      const result = await vendorService.getBestVendorForProduct("variant-123");

      expect(result).not.toBeNull();
      expect(result?.vendor.name).toBe("Reliable Vendor");
      expect(result?.vendor.reliabilityScore).toBe(95.0);
    });

    it("should return best vendor by cost", async () => {
      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockMappings,
      );

      const result = await vendorService.getBestVendorForProduct(
        "variant-123",
        "cost",
      );

      expect(result).not.toBeNull();
      expect(result?.vendor.name).toBe("Cheap Vendor");
      expect(result?.costPerUnit).toBe(20.0);
    });

    it("should return best vendor by speed", async () => {
      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue(
        mockMappings,
      );

      const result = await vendorService.getBestVendorForProduct(
        "variant-123",
        "speed",
      );

      expect(result).not.toBeNull();
      expect(result?.vendor.name).toBe("Fast Vendor");
      expect(result?.vendor.leadTimeDays).toBe(3);
    });

    it("should return null when no vendors found", async () => {
      vi.mocked(prismaClient.vendorProductMapping.findMany).mockResolvedValue([]);

      const result = await vendorService.getBestVendorForProduct("invalid-variant");

      expect(result).toBeNull();
    });
  });

  describe("getVendorOptions", () => {
    it("should format vendor options for UI dropdown", async () => {
      const mockVendors = [
        {
          id: "vendor-1",
          name: "Premium Suppliers",
          leadTimeDays: 7,
          reliabilityScore: 92.5,
          isActive: true,
          productMappings: [
            {
              costPerUnit: 24.99,
            },
          ],
        },
        {
          id: "vendor-2",
          name: "Budget Wholesalers",
          leadTimeDays: 14,
          reliabilityScore: 78.0,
          isActive: true,
          productMappings: [
            {
              costPerUnit: 19.99,
            },
          ],
        },
      ];

      vi.mocked(prismaClient.vendor.findMany).mockResolvedValue(mockVendors);

      const result = await vendorService.getVendorOptions("variant-123");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "vendor-1",
        label: "Premium Suppliers (93% reliable, 7d lead, $24.99/unit)", // 92.5 rounds to 93
        name: "Premium Suppliers",
        reliabilityScore: 92.5,
        leadTimeDays: 7,
        costPerUnit: 24.99,
      });
      expect(result[1]).toEqual({
        id: "vendor-2",
        label: "Budget Wholesalers (78% reliable, 14d lead, $19.99/unit)",
        name: "Budget Wholesalers",
        reliabilityScore: 78.0,
        leadTimeDays: 14,
        costPerUnit: 19.99,
      });
    });

    it("should get all active vendors when variantId not provided", async () => {
      const mockVendors = [
        {
          id: "vendor-1",
          name: "Vendor A",
          leadTimeDays: 5,
          reliabilityScore: 90.0,
          isActive: true,
        },
      ];

      vi.mocked(prismaClient.vendor.findMany).mockResolvedValue(mockVendors);

      await vendorService.getVendorOptions();

      expect(prismaClient.vendor.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it("should handle vendor with no cost mapping", async () => {
      const mockVendors = [
        {
          id: "vendor-1",
          name: "New Vendor",
          leadTimeDays: 10,
          reliabilityScore: 0,
          isActive: true,
        },
      ];

      vi.mocked(prismaClient.vendor.findMany).mockResolvedValue(mockVendors);

      const result = await vendorService.getVendorOptions();

      expect(result[0].costPerUnit).toBe(0);
      expect(result[0].label).toBe("New Vendor (0% reliable, 10d lead, $0.00/unit)");
    });
  });

  describe("getVendorReliabilityTiers", () => {
    it("should categorize vendors by reliability score", async () => {
      const mockVendors = [
        { reliabilityScore: 97.0 }, // excellent
        { reliabilityScore: 95.0 }, // excellent
        { reliabilityScore: 90.0 }, // good
        { reliabilityScore: 85.0 }, // good
        { reliabilityScore: 75.0 }, // fair
        { reliabilityScore: 65.0 }, // poor
        { reliabilityScore: null }, // poor (0)
      ];

      vi.mocked(prismaClient.vendor.findMany).mockResolvedValue(mockVendors);

      const result = await vendorService.getVendorReliabilityTiers();

      expect(result).toEqual({
        excellent: 2,
        good: 2,
        fair: 1,
        poor: 2,
      });
    });
  });
});

