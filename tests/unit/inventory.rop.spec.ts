/**
 * Unit tests for ROP (Reorder Point) Calculation Service
 */

import { describe, it, expect } from 'vitest';
import {
  calculateROP,
  calculateBulkROP,
  getReorderList,
  type ROPInput,
  type SalesDataPoint,
} from '../../app/services/inventory/rop';

describe('ROP Calculation Service', () => {
  describe('calculateROP', () => {
    it('should calculate ROP with sales history', () => {
      const salesHistory: SalesDataPoint[] = [
        { date: '2025-10-01', quantity: 3 },
        { date: '2025-10-02', quantity: 2 },
        { date: '2025-10-03', quantity: 4 },
        { date: '2025-10-04', quantity: 3 },
        { date: '2025-10-05', quantity: 3 },
      ];

      const input: ROPInput = {
        sku: 'TEST-001',
        productId: 'gid://shopify/Product/1',
        variantId: 'gid://shopify/ProductVariant/1',
        currentQuantity: 100,
        salesHistory,
        leadTimeDays: 21,
        safetyStock: 10,
      };

      const result = calculateROP(input, { salesPeriodDays: 5 });

      // Total sales: 15 units over 5 days = 3 units/day
      // ROP = (3 × 21) + 10 = 63 + 10 = 73
      expect(result.averageDailySales).toBe(3);
      expect(result.leadTimeDays).toBe(21);
      expect(result.safetyStock).toBe(10);
      expect(result.rop).toBe(73);
      expect(result.statusBucket).toBe('in_stock'); // 100 > 73
      expect(result.shouldReorder).toBe(false);
    });

    it('should use default lead time when not provided', () => {
      const input: ROPInput = {
        sku: 'TEST-002',
        productId: 'gid://shopify/Product/2',
        variantId: 'gid://shopify/ProductVariant/2',
        currentQuantity: 50,
        salesHistory: [
          { date: '2025-10-01', quantity: 2 },
          { date: '2025-10-02', quantity: 2 },
        ],
      };

      const result = calculateROP(input, { salesPeriodDays: 2 });

      // Avg daily sales: 4 / 2 = 2 units/day
      // Default lead time: 14 days
      // Safety stock: 2 × 1.0 = 2 (calculated)
      // ROP = (2 × 14) + 2 = 28 + 2 = 30
      expect(result.leadTimeDays).toBe(14);
      expect(result.averageDailySales).toBe(2);
      expect(result.safetyStock).toBe(2);
      expect(result.rop).toBe(30);
    });

    it('should calculate safety stock from safety factor', () => {
      const input: ROPInput = {
        sku: 'TEST-003',
        productId: 'gid://shopify/Product/3',
        variantId: 'gid://shopify/ProductVariant/3',
        currentQuantity: 50,
        salesHistory: [
          { date: '2025-10-01', quantity: 10 },
        ],
        leadTimeDays: 7,
        safetyFactor: 2.0, // 2x safety factor
      };

      const result = calculateROP(input, { salesPeriodDays: 1 });

      // Avg daily sales: 10 units/day
      // Safety stock: 10 × 2.0 = 20
      // ROP = (10 × 7) + 20 = 70 + 20 = 90
      expect(result.averageDailySales).toBe(10);
      expect(result.safetyStock).toBe(20);
      expect(result.rop).toBe(90);
    });

    it('should handle zero sales history', () => {
      const input: ROPInput = {
        sku: 'TEST-004',
        productId: 'gid://shopify/Product/4',
        variantId: 'gid://shopify/ProductVariant/4',
        currentQuantity: 100,
        salesHistory: [],
        leadTimeDays: 14,
        safetyStock: 5,
      };

      const result = calculateROP(input);

      // No sales = 0 avg daily sales
      // ROP = (0 × 14) + 5 = 5
      expect(result.averageDailySales).toBe(0);
      expect(result.rop).toBe(5);
      expect(result.daysOfCover).toBeNull(); // Can't calculate with 0 sales
    });

    it('should calculate days of cover and weeks of stock', () => {
      const input: ROPInput = {
        sku: 'TEST-005',
        productId: 'gid://shopify/Product/5',
        variantId: 'gid://shopify/ProductVariant/5',
        currentQuantity: 45,
        salesHistory: [
          { date: '2025-10-01', quantity: 3 },
        ],
        leadTimeDays: 14,
        safetyStock: 5,
      };

      const result = calculateROP(input, { salesPeriodDays: 1 });

      // Avg daily sales: 3 units/day
      // Days of cover: 45 / 3 = 15 days
      // Weeks of stock: 15 / 7 = 2.14 weeks
      expect(result.daysOfCover).toBe(15);
      expect(result.weeksOfStock).toBe(2.14);
    });
  });

  describe('Status Buckets', () => {
    it('should classify as in_stock when quantity > ROP', () => {
      const input: ROPInput = {
        sku: 'TEST-006',
        productId: 'gid://shopify/Product/6',
        variantId: 'gid://shopify/ProductVariant/6',
        currentQuantity: 100,
        salesHistory: [{ date: '2025-10-01', quantity: 1 }],
        leadTimeDays: 14,
        safetyStock: 5,
      };

      const result = calculateROP(input, { salesPeriodDays: 1 });

      // ROP = (1 × 14) + 5 = 19
      // 100 > 19 = in_stock
      expect(result.rop).toBe(19);
      expect(result.statusBucket).toBe('in_stock');
      expect(result.shouldReorder).toBe(false);
    });

    it('should classify as low_stock when ROP >= quantity > (ROP × 0.5)', () => {
      const input: ROPInput = {
        sku: 'TEST-007',
        productId: 'gid://shopify/Product/7',
        variantId: 'gid://shopify/ProductVariant/7',
        currentQuantity: 15,
        salesHistory: [{ date: '2025-10-01', quantity: 1 }],
        leadTimeDays: 14,
        safetyStock: 5,
      };

      const result = calculateROP(input, { salesPeriodDays: 1 });

      // ROP = (1 × 14) + 5 = 19
      // 19 >= 15 > 9.5 = low_stock
      expect(result.rop).toBe(19);
      expect(result.statusBucket).toBe('low_stock');
      expect(result.shouldReorder).toBe(true);
    });

    it('should classify as urgent_reorder when (ROP × 0.5) >= quantity > 0', () => {
      const input: ROPInput = {
        sku: 'TEST-008',
        productId: 'gid://shopify/Product/8',
        variantId: 'gid://shopify/ProductVariant/8',
        currentQuantity: 5,
        salesHistory: [{ date: '2025-10-01', quantity: 1 }],
        leadTimeDays: 14,
        safetyStock: 5,
      };

      const result = calculateROP(input, { salesPeriodDays: 1 });

      // ROP = (1 × 14) + 5 = 19
      // 9.5 >= 5 > 0 = urgent_reorder
      expect(result.rop).toBe(19);
      expect(result.statusBucket).toBe('urgent_reorder');
      expect(result.shouldReorder).toBe(true);
    });

    it('should classify as out_of_stock when quantity = 0', () => {
      const input: ROPInput = {
        sku: 'TEST-009',
        productId: 'gid://shopify/Product/9',
        variantId: 'gid://shopify/ProductVariant/9',
        currentQuantity: 0,
        salesHistory: [{ date: '2025-10-01', quantity: 1 }],
        leadTimeDays: 14,
        safetyStock: 5,
      };

      const result = calculateROP(input, { salesPeriodDays: 1 });

      expect(result.statusBucket).toBe('out_of_stock');
      expect(result.shouldReorder).toBe(true);
    });
  });

  describe('calculateBulkROP', () => {
    it('should calculate ROP for multiple products', () => {
      const inputs: ROPInput[] = [
        {
          sku: 'BULK-001',
          productId: 'gid://shopify/Product/1',
          variantId: 'gid://shopify/ProductVariant/1',
          currentQuantity: 100,
          salesHistory: [{ date: '2025-10-01', quantity: 2 }],
          leadTimeDays: 14,
          safetyStock: 5,
        },
        {
          sku: 'BULK-002',
          productId: 'gid://shopify/Product/2',
          variantId: 'gid://shopify/ProductVariant/2',
          currentQuantity: 10,
          salesHistory: [{ date: '2025-10-01', quantity: 3 }],
          leadTimeDays: 7,
          safetyStock: 3,
        },
      ];

      const results = calculateBulkROP(inputs, { salesPeriodDays: 1 });

      expect(results).toHaveLength(2);
      expect(results[0].sku).toBe('BULK-001');
      expect(results[0].rop).toBe(33); // (2 × 14) + 5
      expect(results[1].sku).toBe('BULK-002');
      expect(results[1].rop).toBe(24); // (3 × 7) + 3
    });
  });

  describe('getReorderList', () => {
    it('should filter and sort products that need reordering', () => {
      const results = calculateBulkROP([
        {
          sku: 'REORDER-001',
          productId: 'gid://shopify/Product/1',
          variantId: 'gid://shopify/ProductVariant/1',
          currentQuantity: 100,
          salesHistory: [{ date: '2025-10-01', quantity: 1 }],
          leadTimeDays: 14,
          safetyStock: 5,
        },
        {
          sku: 'REORDER-002',
          productId: 'gid://shopify/Product/2',
          variantId: 'gid://shopify/ProductVariant/2',
          currentQuantity: 0,
          salesHistory: [{ date: '2025-10-01', quantity: 1 }],
          leadTimeDays: 14,
          safetyStock: 5,
        },
        {
          sku: 'REORDER-003',
          productId: 'gid://shopify/Product/3',
          variantId: 'gid://shopify/ProductVariant/3',
          currentQuantity: 5,
          salesHistory: [{ date: '2025-10-01', quantity: 1 }],
          leadTimeDays: 14,
          safetyStock: 5,
        },
        {
          sku: 'REORDER-004',
          productId: 'gid://shopify/Product/4',
          variantId: 'gid://shopify/ProductVariant/4',
          currentQuantity: 15,
          salesHistory: [{ date: '2025-10-01', quantity: 1 }],
          leadTimeDays: 14,
          safetyStock: 5,
        },
      ], { salesPeriodDays: 1 });

      const reorderList = getReorderList(results);

      // Should include: out_of_stock, urgent_reorder, low_stock
      // Should exclude: in_stock
      expect(reorderList).toHaveLength(3);
      
      // Should be sorted by priority: out_of_stock first
      expect(reorderList[0].sku).toBe('REORDER-002');
      expect(reorderList[0].statusBucket).toBe('out_of_stock');
      
      expect(reorderList[1].sku).toBe('REORDER-003');
      expect(reorderList[1].statusBucket).toBe('urgent_reorder');
      
      expect(reorderList[2].sku).toBe('REORDER-004');
      expect(reorderList[2].statusBucket).toBe('low_stock');
    });
  });
});

