import { tool } from '@openai/agents';
import { z } from 'zod';
import fetch from 'node-fetch';
const domain = process.env.SHOPIFY_STORE_DOMAIN; // e.g. yourstore.myshopify.com
const adminToken = process.env.SHOPIFY_ADMIN_TOKEN;
/**
 * Execute Shopify Admin GraphQL query
 */
async function gql(query, variables) {
    const res = await fetch(`https://${domain}/admin/api/2025-10/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors)
        throw new Error(JSON.stringify(json.errors));
    return json.data;
}
/**
 * Find recent orders for a customer (by email or name).
 * Read-only - no approval required.
 */
export const shopifyFindOrders = tool({
    name: 'shopify_find_orders',
    description: 'Find recent orders for a customer by email or name. Read-only.',
    parameters: z.object({
        query: z.string().describe('Shopify order search query, e.g. "email:john@example.com" or free text'),
        first: z.number().int().min(1).max(50).default(10),
    }),
    async execute({ query, first }) {
        try {
            const data = await gql(`query($query:String!, $first:Int!) {
          orders(query:$query, first:$first, sortKey:CREATED_AT, reverse:true) {
            edges { node { 
              id 
              name 
              email 
              createdAt 
              displayFinancialStatus
              displayFulfillmentStatus
              currentTotalPriceSet { shopMoney { amount currencyCode } }
              currentSubtotalPriceSet { shopMoney { amount currencyCode } }
              lineItems(first: 30) { 
                edges { node { 
                  title 
                  quantity 
                  sku 
                } } 
              }
              customer { id email displayName } 
              shippingAddress { name address1 city province zip country }
            } }
          }
        }`, { query, first });
            return data.orders.edges.map(e => e.node);
        }
        catch (error) {
            console.error('[Shopify Find Orders] Error:', error.message);
            return `Error finding orders: ${error.message}`;
        }
    },
});
/**
 * Cancel a Shopify order with an optional reason.
 * Sensitive action - requires human approval.
 */
export const shopifyCancelOrder = tool({
    name: 'shopify_cancel_order',
    description: 'Cancel a Shopify order with an optional reason. Requires human approval.',
    parameters: z.object({
        orderId: z.string().describe('GraphQL ID, e.g. "gid://shopify/Order/1234567890"'),
        notify: z.boolean().default(false).describe('Whether to notify the customer'),
        reason: z.enum(['CUSTOMER', 'DECLINED', 'FRAUD', 'INVENTORY', 'OTHER']).optional(),
    }),
    needsApproval: true, // 🔒 Human approval required
    async execute({ orderId, notify, reason }) {
        try {
            const data = await gql(`mutation($orderId:ID!, $notify:Boolean!, $reason:OrderCancelReason) {
          orderCancel(id:$orderId, notifyCustomer:$notify, reason:$reason) {
            userErrors { field message }
          }
        }`, { orderId, notify, reason });
            if (data.orderCancel.userErrors?.length) {
                throw new Error(JSON.stringify(data.orderCancel.userErrors));
            }
            return { ok: true, message: `Order ${orderId} cancelled successfully` };
        }
        catch (error) {
            console.error('[Shopify Cancel Order] Error:', error.message);
            return `Error cancelling order: ${error.message}`;
        }
    },
});
//# sourceMappingURL=shopify.js.map