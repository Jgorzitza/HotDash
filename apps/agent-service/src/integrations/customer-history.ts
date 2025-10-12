/**
 * Customer History Integration
 * 
 * Fetches and aggregates customer history from Shopify and other sources.
 * Provides context about customer's past orders, interactions, and preferences.
 */

import fetch from 'node-fetch';

const domain = process.env.SHOPIFY_STORE_DOMAIN!;
const adminToken = process.env.SHOPIFY_ADMIN_TOKEN!;

export interface CustomerHistory {
  email: string;
  name?: string;
  totalOrders: number;
  totalSpent: string;
  currency: string;
  orders: OrderSummary[];
  lastOrderDate?: Date;
  lifetimeValue: number;
  tags: string[];
  acceptsMarketing: boolean;
}

export interface OrderSummary {
  id: string;
  name: string;
  date: Date;
  total: string;
  currency: string;
  status: string;
  fulfillmentStatus: string;
  items: string[];
  trackingNumber?: string;
}

/**
 * Fetch customer history from Shopify
 */
export async function fetchCustomerHistory(email: string): Promise<CustomerHistory | null> {
  try {
    const query = `
      query($query: String!) {
        customers(query: $query, first: 1) {
          edges {
            node {
              id
              email
              displayName
              numberOfOrders
              amountSpent {
                amount
                currencyCode
              }
              tags
              acceptsMarketing
              orders(first: 20, sortKey: CREATED_AT, reverse: true) {
                edges {
                  node {
                    id
                    name
                    createdAt
                    displayFinancialStatus
                    displayFulfillmentStatus
                    currentTotalPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    lineItems(first: 10) {
                      edges {
                        node {
                          title
                          quantity
                        }
                      }
                    }
                    fulfillments(first: 1) {
                      trackingInfo {
                        number
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${domain}/admin/api/2025-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({
        query,
        variables: { query: `email:${email}` },
      }),
    });

    const result: any = await response.json();

    if (result.errors) {
      console.error('[CustomerHistory] GraphQL errors:', result.errors);
      return null;
    }

    const customerEdge = result.data?.customers?.edges?.[0];
    if (!customerEdge) {
      console.log(`[CustomerHistory] No customer found for email: ${email}`);
      return null;
    }

    const customer = customerEdge.node;
    
    const orders: OrderSummary[] = (customer.orders?.edges || []).map((edge: any) => {
      const order = edge.node;
      const items = (order.lineItems?.edges || []).map((itemEdge: any) => {
        const item = itemEdge.node;
        return `${item.title} (x${item.quantity})`;
      });

      const trackingNumber = order.fulfillments?.[0]?.trackingInfo?.number;

      return {
        id: order.id,
        name: order.name,
        date: new Date(order.createdAt),
        total: order.currentTotalPriceSet?.shopMoney?.amount || '0',
        currency: order.currentTotalPriceSet?.shopMoney?.currencyCode || 'USD',
        status: order.displayFinancialStatus || 'UNKNOWN',
        fulfillmentStatus: order.displayFulfillmentStatus || 'UNFULFILLED',
        items,
        trackingNumber,
      };
    });

    const lastOrder = orders[0];
    const lifetimeValue = parseFloat(customer.amountSpent?.amount || '0');

    return {
      email: customer.email,
      name: customer.displayName,
      totalOrders: customer.numberOfOrders || 0,
      totalSpent: customer.amountSpent?.amount || '0',
      currency: customer.amountSpent?.currencyCode || 'USD',
      orders,
      lastOrderDate: lastOrder?.date,
      lifetimeValue,
      tags: customer.tags || [],
      acceptsMarketing: customer.acceptsMarketing || false,
    };
  } catch (error: any) {
    console.error('[CustomerHistory] Error fetching customer:', error);
    return null;
  }
}

/**
 * Get customer segment based on history
 */
export function getCustomerSegment(history: CustomerHistory): string {
  if (history.totalOrders === 0) {
    return 'new';
  }

  if (history.lifetimeValue > 1000) {
    return 'vip';
  }

  if (history.totalOrders >= 5) {
    return 'loyal';
  }

  if (history.totalOrders >= 2) {
    return 'repeat';
  }

  return 'single_purchase';
}

/**
 * Get customer priority level
 */
export function getCustomerPriority(history: CustomerHistory): 'low' | 'medium' | 'high' {
  const segment = getCustomerSegment(history);
  
  if (segment === 'vip') return 'high';
  if (segment === 'loyal') return 'high';
  if (segment === 'repeat') return 'medium';
  
  return 'low';
}

/**
 * Generate customer context summary
 */
export function generateCustomerSummary(history: CustomerHistory): string {
  const segment = getCustomerSegment(history);
  const parts: string[] = [];

  parts.push(`Customer: ${history.name || history.email}`);
  parts.push(`Segment: ${segment.toUpperCase()}`);
  parts.push(`Orders: ${history.totalOrders}`);
  parts.push(`Lifetime Value: ${history.currency} ${history.lifetimeValue.toFixed(2)}`);

  if (history.lastOrderDate) {
    const daysAgo = Math.floor(
      (Date.now() - history.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    parts.push(`Last Order: ${daysAgo} days ago`);
  }

  if (history.tags.length > 0) {
    parts.push(`Tags: ${history.tags.join(', ')}`);
  }

  return parts.join(' | ');
}

/**
 * Get recent order for context
 */
export function getRecentOrder(history: CustomerHistory): OrderSummary | null {
  return history.orders[0] || null;
}

/**
 * Check if customer has specific product
 */
export function hasPurchasedProduct(history: CustomerHistory, productTitle: string): boolean {
  const lowerTitle = productTitle.toLowerCase();
  return history.orders.some(order => 
    order.items.some(item => item.toLowerCase().includes(lowerTitle))
  );
}

