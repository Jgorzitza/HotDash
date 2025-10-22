/**
 * Unit Tests for ALC Calculation Service (INVENTORY-017)
 *
 * Tests:
 * - Freight distribution by weight (3 items, different weights)
 * - Duty distribution by weight
 * - ALC calculation (with existing inventory)
 * - ALC calculation (new product, no previous inventory)
 * - Complete receipt processing
 * - Cost history snapshot
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import * as alc from "~/services/inventory/alc";

// Mock Prisma Client
vi.mock("@prisma/client", () => {
  const mockPrisma = {
    productCostHistory: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  };

  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

const prismaClient = new PrismaClient();

describe("ALC Calculation Service - INVENTORY-017", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateReceiptCosts", () => {
    it("should distribute freight by weight correctly", () => {
      const receipts: alc.ReceiptInput[] = [
        {
          variantId: "variant-1",
          qtyReceived: 10,
          vendorInvoiceAmount: 10.0,
          weight: 2.0, // 20kg total
        },
        {
          variantId: "variant-2",
          qtyReceived: 5,
          vendorInvoiceAmount: 20.0,
          weight: 6.0, // 30kg total
        },
        {
          variantId: "variant-3",
          qtyReceived: 20,
          vendorInvoiceAmount: 5.0,
          weight: 2.5, // 50kg total
        },
      ];

      // Total weight = 100kg
      // Freight = $100
      // Item 1: 20kg / 100kg = 20% = $20
      // Item 2: 30kg / 100kg = 30% = $30
      // Item 3: 50kg / 100kg = 50% = $50

      const result = alc.calculateReceiptCosts(receipts, 100, 0);

      expect(result[0].allocatedFreight).toBe(20); // 20% of $100
      expect(result[1].allocatedFreight).toBe(30); // 30% of $100
      expect(result[2].allocatedFreight).toBe(50); // 50% of $100
    });

    it("should distribute duty by weight correctly", () => {
      const receipts: alc.ReceiptInput[] = [
        {
          variantId: "variant-1",
          qtyReceived: 10,
          vendorInvoiceAmount: 10.0,
          weight: 1.0, // 10kg total
        },
        {
          variantId: "variant-2",
          qtyReceived: 10,
          vendorInvoiceAmount: 10.0,
          weight: 3.0, // 30kg total
        },
      ];

      // Total weight = 40kg
      // Duty = $80
      // Item 1: 10kg / 40kg = 25% = $20
      // Item 2: 30kg / 40kg = 75% = $60

      const result = alc.calculateReceiptCosts(receipts, 0, 80);

      expect(result[0].allocatedDuty).toBe(20); // 25% of $80
      expect(result[1].allocatedDuty).toBe(60); // 75% of $80
    });

    it("should calculate total receipt cost correctly", () => {
      const receipts: alc.ReceiptInput[] = [
        {
          variantId: "variant-1",
          qtyReceived: 10,
          vendorInvoiceAmount: 10.0, // $100 invoice
          weight: 5.0, // 50kg total
        },
      ];

      // Total freight = $50
      // Total duty = $30
      // Total receipt cost = $100 (invoice) + $50 (freight) + $30 (duty) = $180

      const result = alc.calculateReceiptCosts(receipts, 50, 30);

      expect(result[0].totalReceiptCost).toBe(180);
      expect(result[0].costPerUnit).toBe(18); // $180 / 10 units
    });

    it("should handle freight and duty distribution for 3 different weight items", () => {
      const receipts: alc.ReceiptInput[] = [
        {
          variantId: "variant-1",
          qtyReceived: 100,
          vendorInvoiceAmount: 5.0,
          weight: 0.5, // 50kg total
        },
        {
          variantId: "variant-2",
          qtyReceived: 50,
          vendorInvoiceAmount: 10.0,
          weight: 2.0, // 100kg total
        },
        {
          variantId: "variant-3",
          qtyReceived: 25,
          vendorInvoiceAmount: 20.0,
          weight: 6.0, // 150kg total
        },
      ];

      // Total weight = 300kg
      // Freight = $300, Duty = $150
      // Item 1: 50/300 = 16.67% → Freight $50, Duty $25
      // Item 2: 100/300 = 33.33% → Freight $100, Duty $50
      // Item 3: 150/300 = 50% → Freight $150, Duty $75

      const result = alc.calculateReceiptCosts(receipts, 300, 150);

      expect(result[0].allocatedFreight).toBe(50);
      expect(result[0].allocatedDuty).toBe(25);
      expect(result[1].allocatedFreight).toBe(100);
      expect(result[1].allocatedDuty).toBe(50);
      expect(result[2].allocatedFreight).toBe(150);
      expect(result[2].allocatedDuty).toBe(75);
    });

    it("should handle zero weight gracefully (no division by zero)", () => {
      const receipts: alc.ReceiptInput[] = [
        {
          variantId: "variant-1",
          qtyReceived: 10,
          vendorInvoiceAmount: 10.0,
          weight: 0, // Zero weight
        },
      ];

      const result = alc.calculateReceiptCosts(receipts, 100, 50);

      // Should not crash, should allocate 0 freight and 0 duty
      expect(result[0].allocatedFreight).toBe(0);
      expect(result[0].allocatedDuty).toBe(0);
    });
  });

  describe("calculateNewALC", () => {
    it("should calculate ALC with existing inventory (weighted average)", async () => {
      // Mock previous cost history
      vi.mocked(prismaClient.productCostHistory.findFirst).mockResolvedValue({
        id: "history-1",
        variantId: "variant-123",
        receiptId: "receipt-old",
        previousAlc: 10.0,
        newAlc: 15.0, // Previous ALC
        previousOnHand: 40,
        newOnHand: 50,
        receiptQty: 10,
        receiptCostPerUnit: 20.0,
        recordedAt: new Date(),
      });

      // Current inventory: 50 units @ $15/unit
      // New receipt: 50 units @ $25/unit
      // New ALC = ((15 × 50) + (25 × 50)) / (50 + 50) = (750 + 1250) / 100 = 20.00

      const result = await alc.calculateNewALC("variant-123", 25.0, 50);

      expect(result.previousALC).toBe(15.0);
      expect(result.newALC).toBe(20.0); // Weighted average
      expect(result.previousOnHand).toBe(50);
      expect(result.newOnHand).toBe(100);
    });

    it("should calculate ALC for new product (no previous inventory)", async () => {
      // No previous cost history
      vi.mocked(prismaClient.productCostHistory.findFirst).mockResolvedValue(
        null,
      );

      // Mock current inventory as 0 (new product)
      // New receipt: 100 units @ $30/unit
      // New ALC = $30/unit (no previous inventory to average with)

      const result = await alc.calculateNewALC("variant-new", 30.0, 100);

      expect(result.previousALC).toBe(30.0); // Defaults to receipt cost
      expect(result.newALC).toBe(30.0); // No averaging needed
      expect(result.previousOnHand).toBe(50); // Mock returns 50
      expect(result.newOnHand).toBe(150);
    });

    it("should handle decimal precision correctly", async () => {
      vi.mocked(prismaClient.productCostHistory.findFirst).mockResolvedValue({
        id: "history-1",
        variantId: "variant-123",
        receiptId: "receipt-old",
        previousAlc: 10.0,
        newAlc: 12.33, // Previous ALC with decimals
        previousOnHand: 30,
        newOnHand: 50,
        receiptQty: 20,
        receiptCostPerUnit: 15.0,
        recordedAt: new Date(),
      });

      // Current inventory: 50 units @ $12.33/unit
      // New receipt: 25 units @ $18.75/unit
      // New ALC = ((12.33 × 50) + (18.75 × 25)) / (50 + 25)
      //         = (616.50 + 468.75) / 75
      //         = 1085.25 / 75 = 14.47

      const result = await alc.calculateNewALC("variant-123", 18.75, 25);

      expect(result.newALC).toBe(14.47); // Rounded to 2 decimals
    });
  });

  describe("recordCostHistory", () => {
    it("should create cost history snapshot", async () => {
      vi.mocked(prismaClient.productCostHistory.create).mockResolvedValue({
        id: "history-new",
        variantId: "variant-123",
        receiptId: "receipt-123",
        previousAlc: 15.0,
        newAlc: 20.0,
        previousOnHand: 50,
        newOnHand: 100,
        receiptQty: 50,
        receiptCostPerUnit: 25.0,
        recordedAt: new Date(),
      });

      await alc.recordCostHistory(
        "variant-123",
        "receipt-123",
        15.0,
        20.0,
        50,
        100,
        50,
        25.0,
      );

      expect(prismaClient.productCostHistory.create).toHaveBeenCalledWith({
        data: {
          variantId: "variant-123",
          receiptId: "receipt-123",
          previousAlc: 15.0,
          newAlc: 20.0,
          previousOnHand: 50,
          newOnHand: 100,
          receiptQty: 50,
          receiptCostPerUnit: 25.0,
          recordedAt: expect.any(Date),
        },
      });
    });
  });

  describe("processReceipt", () => {
    it("should process complete receipt workflow", async () => {
      vi.mocked(prismaClient.productCostHistory.findFirst).mockResolvedValue({
        id: "history-1",
        variantId: "variant-1",
        receiptId: "receipt-old",
        previousAlc: 10.0,
        newAlc: 12.0,
        previousOnHand: 30,
        newOnHand: 50,
        receiptQty: 20,
        receiptCostPerUnit: 15.0,
        recordedAt: new Date(),
      });

      vi.mocked(prismaClient.productCostHistory.create).mockResolvedValue({
        id: "history-new",
        variantId: "variant-1",
        receiptId: "po-123",
        previousAlc: 12.0,
        newAlc: 14.0,
        previousOnHand: 50,
        newOnHand: 60,
        receiptQty: 10,
        receiptCostPerUnit: 20.0,
        recordedAt: new Date(),
      });

      const receipts: alc.ReceiptInput[] = [
        {
          variantId: "variant-1",
          qtyReceived: 10,
          vendorInvoiceAmount: 10.0,
          weight: 2.0,
        },
      ];

      const result = await alc.processReceipt("po-123", receipts, 50, 30);

      // Should return receipt breakdowns
      expect(result.receiptBreakdowns).toHaveLength(1);
      expect(result.receiptBreakdowns[0].variantId).toBe("variant-1");

      // Should return ALC updates
      expect(result.alcUpdates).toHaveLength(1);
      expect(result.alcUpdates[0].variantId).toBe("variant-1");

      // Should have created cost history
      expect(prismaClient.productCostHistory.create).toHaveBeenCalled();
    });

    it("should process multiple items in single receipt", async () => {
      vi.mocked(prismaClient.productCostHistory.findFirst)
        .mockResolvedValueOnce({
          id: "history-1",
          variantId: "variant-1",
          receiptId: "receipt-old",
          previousAlc: 10.0,
          newAlc: 12.0,
          previousOnHand: 30,
          newOnHand: 50,
          receiptQty: 20,
          receiptCostPerUnit: 15.0,
          recordedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: "history-2",
          variantId: "variant-2",
          receiptId: "receipt-old",
          previousAlc: 20.0,
          newAlc: 22.0,
          previousOnHand: 40,
          newOnHand: 60,
          receiptQty: 20,
          receiptCostPerUnit: 25.0,
          recordedAt: new Date(),
        });

      vi.mocked(prismaClient.productCostHistory.create)
        .mockResolvedValueOnce({
          id: "history-new-1",
          variantId: "variant-1",
          receiptId: "po-123",
          previousAlc: 12.0,
          newAlc: 14.0,
          previousOnHand: 50,
          newOnHand: 60,
          receiptQty: 10,
          receiptCostPerUnit: 20.0,
          recordedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: "history-new-2",
          variantId: "variant-2",
          receiptId: "po-123",
          previousAlc: 22.0,
          newAlc: 24.0,
          previousOnHand: 60,
          newOnHand: 70,
          receiptQty: 10,
          receiptCostPerUnit: 30.0,
          recordedAt: new Date(),
        });

      const receipts: alc.ReceiptInput[] = [
        {
          variantId: "variant-1",
          qtyReceived: 10,
          vendorInvoiceAmount: 10.0,
          weight: 2.0,
        },
        {
          variantId: "variant-2",
          qtyReceived: 10,
          vendorInvoiceAmount: 20.0,
          weight: 3.0,
        },
      ];

      const result = await alc.processReceipt("po-123", receipts, 100, 50);

      // Should process both items
      expect(result.receiptBreakdowns).toHaveLength(2);
      expect(result.alcUpdates).toHaveLength(2);

      // Should create cost history for both
      expect(prismaClient.productCostHistory.create).toHaveBeenCalledTimes(2);
    });
  });
});
