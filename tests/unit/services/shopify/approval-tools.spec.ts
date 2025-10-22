/**
 * Tests for Shopify Approval Tools
 * 
 * Tests the tool handlers for product updates, inventory adjustments, and order operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  executeProductUpdate,
  executeInventoryAdjustment,
  executeOrderFulfillment,
  executeOrderRefund,
  type ProductUpdateInput,
  type InventoryAdjustmentInput,
  type OrderOperationInput
} from '~/services/shopify/approval-tools';
import type { ShopifyServiceContext } from '~/services/shopify/types';

// Mock Shopify context
const mockContext: ShopifyServiceContext = {
  admin: {
    graphql: vi.fn()
  },
  shopDomain: 'test-shop.myshopify.com',
  operatorEmail: 'test@example.com'
} as any;

describe('Shopify Approval Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeProductUpdate', () => {
    it('should execute dry run successfully', async () => {
      const input: ProductUpdateInput = {
        productId: 'gid://shopify/Product/123',
        title: 'Updated Product Title',
        price: 29.99
      };

      const result = await executeProductUpdate(mockContext, input, true);

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.result?.message).toContain('DRY RUN');
    });

    it('should execute real product update', async () => {
      const mockResponse = {
        data: {
          productUpdate: {
            product: {
              id: 'gid://shopify/Product/123',
              title: 'Updated Product Title'
            },
            userErrors: []
          }
        }
      };

      (mockContext.admin.graphql as any).mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      });

      const input: ProductUpdateInput = {
        productId: 'gid://shopify/Product/123',
        title: 'Updated Product Title',
        price: 29.99
      };

      const result = await executeProductUpdate(mockContext, input, false);

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(false);
      expect(mockContext.admin.graphql).toHaveBeenCalled();
    });

    it('should handle Shopify errors', async () => {
      const mockResponse = {
        data: {
          productUpdate: {
            userErrors: [
              { field: 'title', message: 'Title is too long' }
            ]
          }
        }
      };

      (mockContext.admin.graphql as any).mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      });

      const input: ProductUpdateInput = {
        productId: 'gid://shopify/Product/123',
        title: 'A'.repeat(1000) // Too long title
      };

      const result = await executeProductUpdate(mockContext, input, false);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Title is too long');
    });
  });

  describe('executeInventoryAdjustment', () => {
    it('should execute dry run successfully', async () => {
      const input: InventoryAdjustmentInput = {
        inventoryItemId: 'gid://shopify/InventoryItem/123',
        locationId: 'gid://shopify/Location/456',
        quantity: 10,
        reason: 'Manual adjustment'
      };

      const result = await executeInventoryAdjustment(mockContext, input, true);

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.result?.message).toContain('DRY RUN');
    });

    it('should execute real inventory adjustment', async () => {
      const mockResponse = {
        data: {
          inventoryAdjustQuantities: {
            inventoryAdjustmentGroup: {
              id: 'gid://shopify/InventoryAdjustmentGroup/789',
              reason: 'MANUAL_ADJUSTMENT'
            },
            userErrors: []
          }
        }
      };

      (mockContext.admin.graphql as any).mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      });

      const input: InventoryAdjustmentInput = {
        inventoryItemId: 'gid://shopify/InventoryItem/123',
        locationId: 'gid://shopify/Location/456',
        quantity: 10
      };

      const result = await executeInventoryAdjustment(mockContext, input, false);

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(false);
      expect(mockContext.admin.graphql).toHaveBeenCalled();
    });
  });

  describe('executeOrderFulfillment', () => {
    it('should execute dry run successfully', async () => {
      const input: OrderOperationInput = {
        orderId: 'gid://shopify/Order/123',
        action: 'fulfill',
        fulfillmentData: {
          trackingNumber: 'TRACK123',
          trackingCompany: 'UPS',
          notifyCustomer: true
        }
      };

      const result = await executeOrderFulfillment(mockContext, input, true);

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.result?.message).toContain('DRY RUN');
    });

    it('should execute real order fulfillment', async () => {
      const mockResponse = {
        data: {
          fulfillmentCreate: {
            fulfillment: {
              id: 'gid://shopify/Fulfillment/789',
              status: 'SUCCESS',
              trackingInfo: {
                number: 'TRACK123',
                company: 'UPS'
              }
            },
            userErrors: []
          }
        }
      };

      (mockContext.admin.graphql as any).mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      });

      const input: OrderOperationInput = {
        orderId: 'gid://shopify/Order/123',
        action: 'fulfill',
        fulfillmentData: {
          trackingNumber: 'TRACK123',
          trackingCompany: 'UPS'
        }
      };

      const result = await executeOrderFulfillment(mockContext, input, false);

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(false);
      expect(mockContext.admin.graphql).toHaveBeenCalled();
    });
  });

  describe('executeOrderRefund', () => {
    it('should execute dry run successfully', async () => {
      const input: OrderOperationInput = {
        orderId: 'gid://shopify/Order/123',
        action: 'refund',
        refundData: {
          amount: 50.00,
          reason: 'Customer request',
          notifyCustomer: true
        }
      };

      const result = await executeOrderRefund(mockContext, input, true);

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.result?.message).toContain('DRY RUN');
    });

    it('should execute real order refund', async () => {
      const mockResponse = {
        data: {
          refundCreate: {
            refund: {
              id: 'gid://shopify/Refund/789',
              createdAt: '2025-10-22T10:00:00Z',
              note: 'Customer request',
              totalRefunded: {
                amount: '50.00',
                currencyCode: 'USD'
              }
            },
            userErrors: []
          }
        }
      };

      (mockContext.admin.graphql as any).mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      });

      const input: OrderOperationInput = {
        orderId: 'gid://shopify/Order/123',
        action: 'refund',
        refundData: {
          amount: 50.00,
          reason: 'Customer request'
        }
      };

      const result = await executeOrderRefund(mockContext, input, false);

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(false);
      expect(mockContext.admin.graphql).toHaveBeenCalled();
    });
  });
});
