/**
 * Shopify test fixtures and mock data generators
 */

/**
 * Generate mock Shopify Order
 */
export function createMockOrder(overrides: Partial<any> = {}) {
  return {
    id: 'gid://shopify/Order/123456789',
    name: '#1001',
    email: 'customer@example.com',
    createdAt: new Date().toISOString(),
    displayFinancialStatus: 'PAID',
    displayFulfillmentStatus: 'UNFULFILLED',
    currentTotalPriceSet: {
      shopMoney: {
        amount: '99.99',
        currencyCode: 'USD',
      },
    },
    lineItems: {
      edges: [
        {
          node: {
            title: 'Test Product',
            quantity: 1,
            sku: 'TEST-SKU-001',
          },
        },
      ],
    },
    ...overrides,
  };
}

/**
 * Generate mock Product Variant
 */
export function createMockVariant(overrides: Partial<any> = {}) {
  return {
    id: 'gid://shopify/ProductVariant/987654321',
    title: 'Default Title',
    sku: 'TEST-SKU',
    inventoryQuantity: 10,
    product: {
      id: 'gid://shopify/Product/111222333',
      title: 'Test Product',
    },
    inventoryItem: {
      id: 'gid://shopify/InventoryItem/444555666',
      inventoryLevels: {
        edges: [
          {
            node: {
              id: 'gid://shopify/InventoryLevel/777888999',
              location: {
                id: 'gid://shopify/Location/123',
                name: 'Main Warehouse',
              },
              quantities: [
                {
                  name: 'available',
                  quantity: 10,
                },
              ],
            },
          },
        ],
      },
    },
    ...overrides,
  };
}

/**
 * Generate mock Fulfillment
 */
export function createMockFulfillment(overrides: Partial<any> = {}) {
  return {
    id: 'gid://shopify/Fulfillment/111222333444',
    status: 'SUCCESS',
    trackingInfo: {
      number: '1Z999AA10123456784',
      url: 'https://www.ups.com/track?number=1Z999AA10123456784',
    },
    events: {
      edges: [
        {
          node: {
            id: 'gid://shopify/FulfillmentEvent/555666777',
            status: 'IN_TRANSIT',
            happenedAt: new Date().toISOString(),
          },
        },
      ],
    },
    ...overrides,
  };
}

/**
 * Generate mock Shopify GraphQL error
 */
export function createMockShopifyError(message: string = 'Test error', field: string[] = ['test']) {
  return {
    message,
    field,
    code: 'TEST_ERROR',
  };
}

