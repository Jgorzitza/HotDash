import { tool } from '@openai/agents';
import { z } from 'zod';
import fetch from 'node-fetch';

const domain = process.env.SHOPIFY_STORE_DOMAIN!;
const adminToken = process.env.SHOPIFY_ADMIN_TOKEN!;

/**
 * Execute Shopify Admin GraphQL query
 */
async function gql<T>(query: string, variables?: Record<string, any>) {
  const res = await fetch(`https://${domain}/admin/api/2025-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json() as any;
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

/**
 * Get tracking information for an order
 * Read-only - no approval required
 */
export const trackShipment = tool({
  name: 'track_shipment',
  description: 'Get tracking information and delivery status for an order. Read-only.',
  parameters: z.object({
    orderId: z.string().describe('GraphQL ID, e.g. "gid://shopify/Order/1234567890"'),
  }),
  async execute({ orderId }) {
    try {
      const data = await gql<{ order: any }>(
        `query($orderId:ID!) {
          order(id:$orderId) {
            id
            name
            displayFulfillmentStatus
            fulfillments {
              id
              status
              trackingInfo {
                company
                number
                url
              }
              estimatedDeliveryAt
              deliveredAt
              inTransitAt
              createdAt
            }
            shippingAddress {
              name
              address1
              address2
              city
              province
              zip
              country
            }
          }
        }`,
        { orderId }
      );

      if (!data.order) {
        return { error: 'Order not found' };
      }

      const order = data.order;
      const fulfillments = order.fulfillments || [];

      return {
        orderId: order.id,
        orderName: order.name,
        fulfillmentStatus: order.displayFulfillmentStatus,
        shippingAddress: order.shippingAddress,
        trackingInfo: fulfillments.map((f: any) => ({
          status: f.status,
          carrier: f.trackingInfo?.[0]?.company || 'Unknown',
          trackingNumber: f.trackingInfo?.[0]?.number || null,
          trackingUrl: f.trackingInfo?.[0]?.url || null,
          estimatedDelivery: f.estimatedDeliveryAt,
          delivered: f.deliveredAt,
          inTransit: f.inTransitAt,
          shipped: f.createdAt,
        })),
      };
    } catch (error: any) {
      console.error('[Track Shipment] Error:', error.message);
      return { error: `Error tracking shipment: ${error.message}` };
    }
  },
});

/**
 * Estimate delivery time for an order
 * Read-only - no approval required
 */
export const estimateDelivery = tool({
  name: 'estimate_delivery',
  description: 'Estimate delivery time based on shipping method and destination. Read-only.',
  parameters: z.object({
    orderId: z.string().describe('GraphQL ID, e.g. "gid://shopify/Order/1234567890"'),
  }),
  async execute({ orderId }) {
    try {
      const data = await gql<{ order: any }>(
        `query($orderId:ID!) {
          order(id:$orderId) {
            id
            name
            createdAt
            shippingLine {
              title
              code
            }
            shippingAddress {
              province
              country
            }
            fulfillments {
              estimatedDeliveryAt
              createdAt
            }
          }
        }`,
        { orderId }
      );

      if (!data.order) {
        return { error: 'Order not found' };
      }

      const order = data.order;
      const shippingMethod = order.shippingLine?.title || 'Standard Shipping';
      const fulfillment = order.fulfillments?.[0];

      // Calculate estimated delivery based on shipping method
      let estimatedDays = 5; // Default
      if (shippingMethod.toLowerCase().includes('express')) {
        estimatedDays = 2;
      } else if (shippingMethod.toLowerCase().includes('overnight')) {
        estimatedDays = 1;
      } else if (shippingMethod.toLowerCase().includes('standard')) {
        estimatedDays = 5;
      }

      // If already fulfilled, use actual estimate
      if (fulfillment?.estimatedDeliveryAt) {
        return {
          orderId: order.id,
          orderName: order.name,
          shippingMethod,
          estimatedDelivery: fulfillment.estimatedDeliveryAt,
          shippedDate: fulfillment.createdAt,
          destination: `${order.shippingAddress?.province}, ${order.shippingAddress?.country}`,
        };
      }

      // Calculate estimate from order date
      const orderDate = new Date(order.createdAt);
      const estimatedDelivery = new Date(orderDate);
      estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

      return {
        orderId: order.id,
        orderName: order.name,
        shippingMethod,
        estimatedDelivery: estimatedDelivery.toISOString(),
        estimatedDays,
        destination: `${order.shippingAddress?.province}, ${order.shippingAddress?.country}`,
        note: 'Estimate based on shipping method. Actual delivery may vary.',
      };
    } catch (error: any) {
      console.error('[Estimate Delivery] Error:', error.message);
      return { error: `Error estimating delivery: ${error.message}` };
    }
  },
});

/**
 * Validate shipping address
 * Read-only - no approval required
 */
export const validateAddress = tool({
  name: 'validate_address',
  description: 'Validate a shipping address format. Read-only.',
  parameters: z.object({
    address1: z.string().describe('Street address line 1'),
    city: z.string().describe('City'),
    province: z.string().describe('State/Province'),
    zip: z.string().describe('Postal/ZIP code'),
    country: z.string().describe('Country code (e.g., US, CA)'),
  }),
  async execute({ address1, city, province, zip, country }) {
    try {
      // Basic validation logic
      const issues: string[] = [];

      if (!address1 || address1.length < 3) {
        issues.push('Address line 1 is too short');
      }

      if (!city || city.length < 2) {
        issues.push('City is required');
      }

      if (!province || province.length < 2) {
        issues.push('State/Province is required');
      }

      if (!zip || zip.length < 3) {
        issues.push('Postal/ZIP code is required');
      }

      if (!country || country.length !== 2) {
        issues.push('Country code must be 2 letters (e.g., US, CA)');
      }

      // ZIP code format validation
      if (country === 'US' && !/^\d{5}(-\d{4})?$/.test(zip)) {
        issues.push('US ZIP code format invalid (should be 12345 or 12345-6789)');
      }

      if (country === 'CA' && !/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(zip.toUpperCase())) {
        issues.push('Canadian postal code format invalid (should be A1A 1A1)');
      }

      return {
        valid: issues.length === 0,
        issues,
        address: {
          address1,
          city,
          province,
          zip,
          country,
        },
      };
    } catch (error: any) {
      console.error('[Validate Address] Error:', error.message);
      return { error: `Error validating address: ${error.message}` };
    }
  },
});

/**
 * Get shipping methods and costs
 * Read-only - no approval required
 */
export const getShippingMethods = tool({
  name: 'get_shipping_methods',
  description: 'Get available shipping methods and estimated costs. Read-only.',
  parameters: z.object({
    country: z.string().describe('Destination country code (e.g., US, CA)'),
    province: z.string().nullable().default(null).describe('Destination state/province'),
  }),
  async execute({ country, province }) {
    try {
      // This would typically query Shopify's shipping zones and rates
      // For now, return common shipping methods
      const methods = [
        {
          name: 'Standard Shipping',
          code: 'standard',
          estimatedDays: '5-7 business days',
          cost: country === 'US' ? 'Free over $50, otherwise $5.99' : '$9.99',
        },
        {
          name: 'Express Shipping',
          code: 'express',
          estimatedDays: '2-3 business days',
          cost: country === 'US' ? '$14.99' : '$24.99',
        },
        {
          name: 'Overnight Shipping',
          code: 'overnight',
          estimatedDays: '1 business day',
          cost: country === 'US' ? '$29.99' : 'Not available',
        },
      ];

      return {
        country,
        province,
        methods: methods.filter(m => m.cost !== 'Not available'),
        note: 'Actual costs may vary based on cart total and promotions.',
      };
    } catch (error: any) {
      console.error('[Get Shipping Methods] Error:', error.message);
      return { error: `Error getting shipping methods: ${error.message}` };
    }
  },
});

