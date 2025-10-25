import { tool } from '@openai/agents';
import { z } from 'zod';
import fetch from 'node-fetch';
const domain = process.env.SHOPIFY_STORE_DOMAIN;
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
 * Search troubleshooting guides
 * Read-only - no approval required
 */
export const searchTroubleshooting = tool({
    name: 'search_troubleshooting',
    description: 'Search troubleshooting guides for technical issues. Read-only.',
    parameters: z.object({
        query: z.string().describe('Search query for troubleshooting guides'),
        productType: z.string().nullable().default(null).describe('Product type to filter results'),
    }),
    async execute({ query, productType }) {
        try {
            // This would typically query a knowledge base or documentation system
            // For now, return common troubleshooting steps
            const guides = [
                {
                    id: 'ts-001',
                    title: 'Product Not Turning On',
                    category: 'Power Issues',
                    steps: [
                        'Check if the device is charged or plugged in',
                        'Try a different power outlet',
                        'Check for a power button lock or switch',
                        'Inspect the power cable for damage',
                        'Try a hard reset (hold power button for 10 seconds)',
                    ],
                    applicableProducts: ['electronics', 'appliances'],
                },
                {
                    id: 'ts-002',
                    title: 'Connectivity Issues',
                    category: 'Network/Bluetooth',
                    steps: [
                        'Ensure device is within range',
                        'Restart both devices',
                        'Forget and re-pair the connection',
                        'Check for software updates',
                        'Reset network settings',
                    ],
                    applicableProducts: ['electronics', 'smart-devices'],
                },
                {
                    id: 'ts-003',
                    title: 'Performance Issues',
                    category: 'Speed/Performance',
                    steps: [
                        'Close unused applications',
                        'Clear cache and temporary files',
                        'Check available storage space',
                        'Update to latest software version',
                        'Perform a factory reset (backup first)',
                    ],
                    applicableProducts: ['electronics', 'computers'],
                },
            ];
            // Filter by product type if provided
            let filtered = guides;
            if (productType) {
                filtered = guides.filter((g) => g.applicableProducts.some((p) => p.toLowerCase().includes(productType.toLowerCase())));
            }
            // Simple keyword matching
            const queryLower = query.toLowerCase();
            const matched = filtered.filter(g => g.title.toLowerCase().includes(queryLower) ||
                g.category.toLowerCase().includes(queryLower) ||
                g.steps.some(s => s.toLowerCase().includes(queryLower)));
            return {
                query,
                productType,
                results: matched.length > 0 ? matched : filtered.slice(0, 3),
                totalResults: matched.length || filtered.length,
            };
        }
        catch (error) {
            console.error('[Search Troubleshooting] Error:', error.message);
            return { error: `Error searching troubleshooting guides: ${error.message}` };
        }
    },
});
/**
 * Check warranty status for a product
 * Read-only - no approval required
 */
export const checkWarranty = tool({
    name: 'check_warranty',
    description: 'Check warranty status for a product based on order information. Read-only.',
    parameters: z.object({
        orderId: z.string().describe('GraphQL ID, e.g. "gid://shopify/Order/1234567890"'),
        productId: z.string().nullable().default(null).describe('Specific product ID to check'),
    }),
    async execute({ orderId, productId }) {
        try {
            const data = await gql(`query($orderId:ID!) {
          order(id:$orderId) {
            id
            name
            createdAt
            lineItems(first: 50) {
              edges {
                node {
                  id
                  title
                  sku
                  product {
                    id
                    productType
                    tags
                  }
                }
              }
            }
          }
        }`, { orderId });
            if (!data.order) {
                return { error: 'Order not found' };
            }
            const order = data.order;
            const orderDate = new Date(order.createdAt);
            const now = new Date();
            const daysSincePurchase = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
            // Get warranty info for each product
            const warranties = order.lineItems.edges.map((edge) => {
                const item = edge.node;
                const product = item.product;
                // Determine warranty period based on product type
                let warrantyDays = 365; // Default 1 year
                if (product?.productType?.toLowerCase().includes('electronics')) {
                    warrantyDays = 730; // 2 years for electronics
                }
                else if (product?.productType?.toLowerCase().includes('appliance')) {
                    warrantyDays = 1095; // 3 years for appliances
                }
                const daysRemaining = warrantyDays - daysSincePurchase;
                const isActive = daysRemaining > 0;
                return {
                    productId: item.id,
                    productName: item.title,
                    sku: item.sku,
                    productType: product?.productType || 'Unknown',
                    purchaseDate: order.createdAt,
                    warrantyPeriod: `${warrantyDays / 365} year(s)`,
                    warrantyStatus: isActive ? 'Active' : 'Expired',
                    daysRemaining: isActive ? daysRemaining : 0,
                    expirationDate: new Date(orderDate.getTime() + warrantyDays * 24 * 60 * 60 * 1000).toISOString(),
                };
            });
            // Filter to specific product if requested
            if (productId) {
                const filtered = warranties.filter(w => w.productId === productId);
                return filtered.length > 0 ? filtered[0] : { error: 'Product not found in order' };
            }
            return {
                orderId: order.id,
                orderName: order.name,
                warranties,
            };
        }
        catch (error) {
            console.error('[Check Warranty] Error:', error.message);
            return { error: `Error checking warranty: ${error.message}` };
        }
    },
});
/**
 * Create a repair ticket
 * Requires human approval for warranty claims
 */
export const createRepairTicket = tool({
    name: 'create_repair_ticket',
    description: 'Create a repair ticket for a product issue. Requires human approval.',
    parameters: z.object({
        orderId: z.string().describe('GraphQL ID of the order'),
        productId: z.string().describe('Product ID needing repair'),
        issueDescription: z.string().describe('Description of the issue'),
        warrantyStatus: z.enum(['active', 'expired']).describe('Warranty status'),
    }),
    needsApproval: true, // 🔒 Human approval required
    async execute({ orderId, productId, issueDescription, warrantyStatus }) {
        try {
            // In a real implementation, this would create a ticket in a support system
            // For now, return a mock ticket
            const ticketId = `RPR-${Date.now()}`;
            return {
                success: true,
                ticketId,
                orderId,
                productId,
                issueDescription,
                warrantyStatus,
                status: 'pending_review',
                message: warrantyStatus === 'active'
                    ? 'Repair ticket created. Warranty covers this repair.'
                    : 'Repair ticket created. Customer will be contacted for repair cost estimate.',
                nextSteps: [
                    'Human agent will review the ticket',
                    'Customer will receive email confirmation',
                    warrantyStatus === 'active'
                        ? 'Prepaid shipping label will be sent'
                        : 'Repair cost estimate will be provided',
                ],
            };
        }
        catch (error) {
            console.error('[Create Repair Ticket] Error:', error.message);
            return { error: `Error creating repair ticket: ${error.message}` };
        }
    },
});
/**
 * Get product setup guide
 * Read-only - no approval required
 */
export const getSetupGuide = tool({
    name: 'get_setup_guide',
    description: 'Get setup instructions for a product. Read-only.',
    parameters: z.object({
        productType: z.string().describe('Product type or category'),
        productName: z.string().nullable().default(null).describe('Specific product name'),
    }),
    async execute({ productType, productName }) {
        try {
            // This would typically query a documentation system
            // For now, return common setup steps
            const guides = {
                electronics: {
                    title: 'Electronics Setup Guide',
                    steps: [
                        'Unbox the product and check all components',
                        'Charge the device fully before first use',
                        'Download the companion app (if applicable)',
                        'Follow the in-app setup wizard',
                        'Connect to Wi-Fi or Bluetooth',
                        'Update to the latest firmware',
                        'Register the product for warranty',
                    ],
                    tips: [
                        'Keep the original packaging for warranty claims',
                        'Take photos of serial numbers',
                        'Enable automatic updates',
                    ],
                },
                appliances: {
                    title: 'Appliance Setup Guide',
                    steps: [
                        'Remove all packaging and protective films',
                        'Level the appliance using adjustable feet',
                        'Connect to power outlet (check voltage)',
                        'Run initial cleaning cycle (if applicable)',
                        'Set up water connection (if applicable)',
                        'Configure settings and preferences',
                        'Register for warranty',
                    ],
                    tips: [
                        'Allow 24 hours before first use for refrigerators',
                        'Check water connections for leaks',
                        'Keep manual for reference',
                    ],
                },
                default: {
                    title: 'General Setup Guide',
                    steps: [
                        'Unbox and inspect for damage',
                        'Read the quick start guide',
                        'Charge or connect to power',
                        'Follow manufacturer instructions',
                        'Register for warranty',
                    ],
                    tips: [
                        'Keep all documentation',
                        'Contact support if issues arise',
                    ],
                },
            };
            const guide = guides[productType.toLowerCase()] || guides.default;
            return {
                productType,
                productName,
                ...guide,
            };
        }
        catch (error) {
            console.error('[Get Setup Guide] Error:', error.message);
            return { error: `Error getting setup guide: ${error.message}` };
        }
    },
});
//# sourceMappingURL=technical.js.map