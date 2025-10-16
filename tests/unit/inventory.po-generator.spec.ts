/**
 * Unit tests for PO (Purchase Order) Generation Service
 */

import { describe, it, expect } from 'vitest';
import {
  generatePO,
  poToCSV,
  generatePOEmail,
  getPOSummary,
  type POGenerationOptions,
} from '../../app/services/inventory/po-generator';
import type { ROPResult } from '../../app/services/inventory/rop';

describe('PO Generation Service', () => {
  const mockROPResults: ROPResult[] = [
    {
      sku: 'TEST-001',
      productId: 'gid://shopify/Product/1',
      variantId: 'gid://shopify/ProductVariant/1',
      currentQuantity: 10,
      averageDailySales: 3,
      leadTimeDays: 14,
      safetyStock: 5,
      rop: 47, // (3 × 14) + 5
      statusBucket: 'urgent_reorder',
      daysOfCover: 3.33,
      weeksOfStock: 0.48,
      shouldReorder: true,
      calculatedAt: '2025-10-15T00:00:00Z',
    },
    {
      sku: 'TEST-002',
      productId: 'gid://shopify/Product/2',
      variantId: 'gid://shopify/ProductVariant/2',
      currentQuantity: 0,
      averageDailySales: 2,
      leadTimeDays: 21,
      safetyStock: 10,
      rop: 52, // (2 × 21) + 10
      statusBucket: 'out_of_stock',
      daysOfCover: null,
      weeksOfStock: null,
      shouldReorder: true,
      calculatedAt: '2025-10-15T00:00:00Z',
    },
    {
      sku: 'TEST-003',
      productId: 'gid://shopify/Product/3',
      variantId: 'gid://shopify/ProductVariant/3',
      currentQuantity: 100,
      averageDailySales: 1,
      leadTimeDays: 14,
      safetyStock: 5,
      rop: 19, // (1 × 14) + 5
      statusBucket: 'in_stock',
      daysOfCover: 100,
      weeksOfStock: 14.29,
      shouldReorder: false,
      calculatedAt: '2025-10-15T00:00:00Z',
    },
  ];

  describe('generatePO', () => {
    it('should generate PO with only products that need reordering', () => {
      const po = generatePO(mockROPResults);

      expect(po.lineItems).toHaveLength(2); // Only TEST-001 and TEST-002
      expect(po.lineItems[0].sku).toBe('TEST-001');
      expect(po.lineItems[1].sku).toBe('TEST-002');
      expect(po.totalItems).toBe(2);
    });

    it('should calculate recommended order quantities', () => {
      const po = generatePO(mockROPResults);

      // TEST-001: ROP 47 - Current 10 = 37
      expect(po.lineItems[0].recommendedOrderQuantity).toBe(37);

      // TEST-002: ROP 52 - Current 0 = 52
      expect(po.lineItems[1].recommendedOrderQuantity).toBe(52);
    });

    it('should apply order multiplier', () => {
      const options: POGenerationOptions = {
        orderMultiplier: 1.5,
      };

      const po = generatePO(mockROPResults, options);

      // TEST-001: (47 - 10) × 1.5 = 37 × 1.5 = 55.5 → 56 (rounded up)
      expect(po.lineItems[0].recommendedOrderQuantity).toBe(56);

      // TEST-002: (52 - 0) × 1.5 = 52 × 1.5 = 78
      expect(po.lineItems[1].recommendedOrderQuantity).toBe(78);
    });

    it('should apply minimum order quantity', () => {
      const options: POGenerationOptions = {
        minOrderQuantity: 50,
      };

      const po = generatePO(mockROPResults, options);

      // TEST-001: 37 < 50, so use 50
      expect(po.lineItems[0].recommendedOrderQuantity).toBe(50);

      // TEST-002: 52 > 50, so use 52
      expect(po.lineItems[1].recommendedOrderQuantity).toBe(52);
    });

    it('should round up to nearest multiple', () => {
      const options: POGenerationOptions = {
        roundUpTo: 10,
      };

      const po = generatePO(mockROPResults, options);

      // TEST-001: 37 → round up to 40
      expect(po.lineItems[0].recommendedOrderQuantity).toBe(40);

      // TEST-002: 52 → round up to 60
      expect(po.lineItems[1].recommendedOrderQuantity).toBe(60);
    });

    it('should include vendor and notes', () => {
      const options: POGenerationOptions = {
        vendor: 'Acme Supplier',
        notes: 'Rush order - expedite shipping',
      };

      const po = generatePO(mockROPResults, options);

      expect(po.vendor).toBe('Acme Supplier');
      expect(po.notes).toBe('Rush order - expedite shipping');
    });

    it('should generate PO number', () => {
      const po = generatePO(mockROPResults);

      expect(po.poNumber).toMatch(/^PO-\d{8}-\d{6}$/);
    });

    it('should calculate expected delivery date', () => {
      const po = generatePO(mockROPResults);

      // Should use earliest delivery date (TEST-001: 14 days)
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 14);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      expect(po.expectedDeliveryDate).toBe(expectedDateStr);
    });

    it('should calculate total quantity', () => {
      const po = generatePO(mockROPResults);

      // TEST-001: 37 + TEST-002: 52 = 89
      expect(po.totalQuantity).toBe(89);
    });
  });

  describe('poToCSV', () => {
    it('should convert PO to CSV format', () => {
      const po = generatePO(mockROPResults);
      const csv = poToCSV(po);

      const lines = csv.split('\n');

      // Should have header + 2 data rows
      expect(lines).toHaveLength(3);

      // Check header
      expect(lines[0]).toContain('SKU');
      expect(lines[0]).toContain('Product Title');
      expect(lines[0]).toContain('Order Quantity');

      // Check data rows
      expect(lines[1]).toContain('TEST-001');
      expect(lines[2]).toContain('TEST-002');
    });

    it('should properly escape CSV values', () => {
      const po = generatePO(mockROPResults);
      const csv = poToCSV(po);

      // Values should be quoted
      expect(csv).toContain('"TEST-001"');
      expect(csv).toContain('"TEST-002"');
    });
  });

  describe('generatePOEmail', () => {
    it('should generate email with subject and body', () => {
      const po = generatePO(mockROPResults, { vendor: 'Acme Supplier' });
      const email = generatePOEmail(po);

      expect(email.subject).toContain(po.poNumber);
      expect(email.subject).toContain('Acme Supplier');

      expect(email.body).toContain(po.poNumber);
      expect(email.body).toContain('Total Items: 2');
      expect(email.body).toContain('Total Quantity: 89');
    });

    it('should include notes in email body', () => {
      const po = generatePO(mockROPResults, {
        notes: 'Rush order - expedite shipping',
      });
      const email = generatePOEmail(po);

      expect(email.body).toContain('Rush order - expedite shipping');
    });

    it('should include CSV attachment', () => {
      const po = generatePO(mockROPResults);
      const email = generatePOEmail(po);

      expect(email.attachmentName).toBe(`${po.poNumber}.csv`);
      expect(email.attachmentContent).toContain('TEST-001');
      expect(email.attachmentContent).toContain('TEST-002');
    });
  });

  describe('getPOSummary', () => {
    it('should calculate PO summary statistics', () => {
      const po = generatePO(mockROPResults);
      const summary = getPOSummary(po);

      expect(summary.totalItems).toBe(2);
      expect(summary.totalQuantity).toBe(89);
      expect(summary.totalCost).toBe(0); // No costs provided

      // Both items are urgent (urgent_reorder and out_of_stock)
      expect(summary.urgentItems).toBe(2);

      // Average lead time: (14 + 21) / 2 = 17.5
      expect(summary.averageLeadTime).toBe(17.5);
    });

    it('should identify urgent items correctly', () => {
      const results: ROPResult[] = [
        {
          ...mockROPResults[0],
          currentQuantity: 25, // Above ROP × 0.5 (23.5), not urgent
          statusBucket: 'low_stock',
        },
        {
          ...mockROPResults[1],
          currentQuantity: 0, // Out of stock, urgent
          statusBucket: 'out_of_stock',
        },
      ];

      const po = generatePO(results);
      const summary = getPOSummary(po);

      // Only TEST-002 is urgent (out of stock)
      expect(summary.urgentItems).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty ROP results', () => {
      const po = generatePO([]);

      expect(po.lineItems).toHaveLength(0);
      expect(po.totalItems).toBe(0);
      expect(po.totalQuantity).toBe(0);
    });

    it('should handle all products in stock', () => {
      const results: ROPResult[] = [
        {
          ...mockROPResults[2], // in_stock, shouldReorder: false
        },
      ];

      const po = generatePO(results);

      expect(po.lineItems).toHaveLength(0);
      expect(po.totalItems).toBe(0);
    });

    it('should handle zero current quantity', () => {
      const results: ROPResult[] = [
        {
          ...mockROPResults[1],
          currentQuantity: 0,
          rop: 50,
        },
      ];

      const po = generatePO(results);

      // Should order full ROP amount
      expect(po.lineItems[0].recommendedOrderQuantity).toBe(50);
    });
  });
});

