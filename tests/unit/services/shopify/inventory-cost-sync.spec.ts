/**
 * Unit tests for Shopify Inventory Cost Sync Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  syncInventoryCostToShopify,
  syncMultipleInventoryCosts,
  type CostSyncResult
} from '~/services/shopify/inventory-cost-sync';
import type { ShopifyServiceContext } from '~/services/shopify/types';

describe('Shopify Inventory Cost Sync', () => {
  let mockContext: ShopifyServiceContext;

  beforeEach(() => {
    mockContext = {
      admin: {
        graphql: vi.fn()
      } as any,
      shopDomain: 'test-shop.myshopify.com',
      operatorEmail: 'test@example.com'
    };
  });

  describe('syncInventoryCostToShopify', () => {
    it('should successfully update inventory cost', async () => {
      // Mock get inventory item response
      const getResponse = {
        json: vi.fn().mockResolvedValue({
          data: {
            productVariant: {
              inventoryItem: {
                id: 'gid://shopify/InventoryItem/12345',
                unitCost: {
                  amount: '10.00',
                  currencyCode: 'USD'
                }
              }
            }
          }
        })
      };

      // Mock update inventory item response
      const updateResponse = {
        json: vi.fn().mockResolvedValue({
          data: {
            inventoryItemUpdate: {
              inventoryItem: {
                id: 'gid://shopify/InventoryItem/12345',
                unitCost: {
                  amount: '15.50',
                  currencyCode: 'USD'
                },
                updatedAt: '2025-10-21T16:00:00Z'
              },
              userErrors: []
            }
          }
        })
      };

      vi.mocked(mockContext.admin.graphql)
        .mockResolvedValueOnce(getResponse as any)
        .mockResolvedValueOnce(updateResponse as any);

      const result = await syncInventoryCostToShopify(
        mockContext,
        'gid://shopify/ProductVariant/67890',
        15.50
      );

      expect(result.success).toBe(true);
      expect(result.variantId).toBe('gid://shopify/ProductVariant/67890');
      expect(result.previousCost).toBe(10.00);
      expect(result.newCost).toBe(15.50);
      expect(result.shopifyInventoryItemId).toBe('gid://shopify/InventoryItem/12345');
      expect(result.updatedAt).toBe('2025-10-21T16:00:00Z');
      expect(result.error).toBeUndefined();
    });

    it('should handle inventory item not found', async () => {
      const getResponse = {
        json: vi.fn().mockResolvedValue({
          data: {
            productVariant: null
          }
        })
      };

      vi.mocked(mockContext.admin.graphql)
        .mockResolvedValueOnce(getResponse as any);

      const result = await syncInventoryCostToShopify(
        mockContext,
        'gid://shopify/ProductVariant/99999',
        25.00
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Inventory item not found for variant');
      expect(result.variantId).toBe('gid://shopify/ProductVariant/99999');
      expect(result.newCost).toBe(25.00);
    });

    it('should handle Shopify userErrors', async () => {
      const getResponse = {
        json: vi.fn().mockResolvedValue({
          data: {
            productVariant: {
              inventoryItem: {
                id: 'gid://shopify/InventoryItem/12345',
                unitCost: {
                  amount: '10.00',
                  currencyCode: 'USD'
                }
              }
            }
          }
        })
      };

      const updateResponse = {
        json: vi.fn().mockResolvedValue({
          data: {
            inventoryItemUpdate: {
              inventoryItem: null,
              userErrors: [
                {
                  field: 'cost',
                  message: 'Cost must be positive'
                }
              ]
            }
          }
        })
      };

      vi.mocked(mockContext.admin.graphql)
        .mockResolvedValueOnce(getResponse as any)
        .mockResolvedValueOnce(updateResponse as any);

      const result = await syncInventoryCostToShopify(
        mockContext,
        'gid://shopify/ProductVariant/67890',
        -5.00
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cost must be positive');
      expect(result.shopifyInventoryItemId).toBe('gid://shopify/InventoryItem/12345');
    });

    it('should handle network errors', async () => {
      vi.mocked(mockContext.admin.graphql)
        .mockRejectedValueOnce(new Error('Network timeout'));

      const result = await syncInventoryCostToShopify(
        mockContext,
        'gid://shopify/ProductVariant/67890',
        20.00
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network timeout');
      expect(result.variantId).toBe('gid://shopify/ProductVariant/67890');
      expect(result.newCost).toBe(20.00);
    });
  });

  describe('syncMultipleInventoryCosts', () => {
    it('should successfully update multiple variants', async () => {
      const mockResponses = [
        // Variant 1: get + update
        { json: vi.fn().mockResolvedValue({ data: { productVariant: { inventoryItem: { id: 'gid://shopify/InventoryItem/111', unitCost: { amount: '10.00', currencyCode: 'USD' } } } } }) },
        { json: vi.fn().mockResolvedValue({ data: { inventoryItemUpdate: { inventoryItem: { id: 'gid://shopify/InventoryItem/111', unitCost: { amount: '12.00', currencyCode: 'USD' }, updatedAt: '2025-10-21T16:00:00Z' }, userErrors: [] } } }) },
        // Variant 2: get + update
        { json: vi.fn().mockResolvedValue({ data: { productVariant: { inventoryItem: { id: 'gid://shopify/InventoryItem/222', unitCost: { amount: '20.00', currencyCode: 'USD' } } } } }) },
        { json: vi.fn().mockResolvedValue({ data: { inventoryItemUpdate: { inventoryItem: { id: 'gid://shopify/InventoryItem/222', unitCost: { amount: '25.00', currencyCode: 'USD' }, updatedAt: '2025-10-21T16:01:00Z' }, userErrors: [] } } }) },
      ];

      let callIndex = 0;
      vi.mocked(mockContext.admin.graphql).mockImplementation(async () => {
        return mockResponses[callIndex++] as any;
      });

      vi.useFakeTimers();
      const promise = syncMultipleInventoryCosts(mockContext, [
        { variantId: 'gid://shopify/ProductVariant/1', newCost: 12.00 },
        { variantId: 'gid://shopify/ProductVariant/2', newCost: 25.00 }
      ]);
      await vi.runAllTimersAsync();
      const results = await promise;
      vi.useRealTimers();

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].newCost).toBe(12.00);
      expect(results[1].success).toBe(true);
      expect(results[1].newCost).toBe(25.00);
    });
  });
});
