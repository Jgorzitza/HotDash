/**
 * CEO Assistant Agent
 * 
 * Provides inventory insights, growth recommendations, and business intelligence.
 * All actions require HITL approval.
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import { createAgent } from '../sdk/index.js';

/**
 * Agent ID for CEO assistant
 */
export const CEO_AGENT_ID = 'ai-ceo';

/**
 * System prompt for CEO assistant
 */
const SYSTEM_PROMPT = `You are an AI assistant for the CEO of HotDash (hotrodan.com), providing inventory insights and growth recommendations.

Your capabilities:
- Analyze inventory levels and calculate reorder points
- Provide growth metrics and analytics insights
- Generate purchase order recommendations
- Identify SEO opportunities

Always provide:
- Evidence (data, calculations)
- Projected impact
- Risks and rollback plans
- Clear recommendations

All actions require CEO approval.`;

/**
 * Tool: Get inventory levels
 */
const getInventoryLevelsTool = tool({
  name: 'get_inventory_levels',
  description: 'Get current inventory levels from Shopify',
  parameters: z.object({
    productIds: z.array(z.string()).optional().describe('Specific product IDs to query'),
    lowStockOnly: z.boolean().default(false).describe('Only return low stock items'),
  }),
  execute: async ({ productIds, lowStockOnly }) => {
    const start = Date.now();
    console.log('[Tool] get_inventory_levels:', { productIds, lowStockOnly });

    // TODO: Implement actual Shopify Admin GraphQL query
    const result = {
      products: [
        { id: 'gid://shopify/Product/123', title: 'AN-6 Fitting', sku: 'AN6-001', inventory_quantity: 45, sales_velocity: 10 },
      ],
    } as const;

    const { logStructured } = await import('../sdk/index.js');
    logStructured('info', '[Tool] get_inventory_levels complete', { durationMs: Date.now() - start, count: result.products.length });
    return result;
  },
});

/**
 * Tool: Calculate reorder point
 */
const calculateROPTool = tool({
  name: 'calculate_rop',
  description: 'Calculate reorder point for products',
  parameters: z.object({
    productId: z.string().describe('Product ID'),
    leadTimeDays: z.number().default(14).describe('Supplier lead time in days'),
    safetyStockDays: z.number().default(7).describe('Safety stock in days'),
  }),
  execute: async ({ productId, leadTimeDays, safetyStockDays }) => {
    const start = Date.now();
    console.log('[Tool] calculate_rop:', { productId, leadTimeDays, safetyStockDays });

    // TODO: Get actual sales velocity from Shopify
    const salesVelocity = 10; // units per week
    const dailyVelocity = salesVelocity / 7;

    const leadTimeDemand = dailyVelocity * leadTimeDays;
    const safetyStock = dailyVelocity * safetyStockDays;
    const rop = Math.ceil(leadTimeDemand + safetyStock);

    const result = { productId, reorderPoint: rop, leadTimeDemand: Math.ceil(leadTimeDemand), safetyStock: Math.ceil(safetyStock), salesVelocity: dailyVelocity } as const;
    const { logStructured } = await import('../sdk/index.js');
    logStructured('info', '[Tool] calculate_rop complete', { durationMs: Date.now() - start, productId, rop });
    return result;
  },
});

/**
 * Tool: Get analytics metrics
 */
const getAnalyticsMetricsTool = tool({
  name: 'get_analytics_metrics',
  description: 'Get Google Analytics metrics',
  parameters: z.object({
    metric: z.enum(['revenue', 'traffic', 'conversion_rate']).describe('Metric to retrieve'),
    days: z.number().default(30).describe('Number of days to analyze'),
  }),
  execute: async ({ metric, days }) => {
    const start = Date.now();
    console.log('[Tool] get_analytics_metrics:', { metric, days });

    const result = { metric, value: 12500, change: '+15%', period: `Last ${days} days` } as const;
    const { logStructured } = await import('../sdk/index.js');
    logStructured('info', '[Tool] get_analytics_metrics complete', { durationMs: Date.now() - start, metric });
    return result;
  },
});

/**
 * Tool: Generate purchase order (REQUIRES HITL APPROVAL)
 */
const generatePurchaseOrderTool = tool({
  name: 'generate_purchase_order',
  description: 'Generate purchase order for products. REQUIRES CEO APPROVAL.',
  parameters: z.object({
    products: z.array(z.object({
      productId: z.string(),
      quantity: z.number(),
    })).describe('Products to order'),
    approvalId: z.string().describe('Approval ID from CEO'),
  }),
  execute: async ({ products, approvalId }) => {
    const start = Date.now();
    console.log('[Tool] generate_purchase_order:', { products, approvalId });

    const { isApprovalApproved } = await import('../sdk/index.js');
    const approved = await isApprovalApproved(approvalId);
    if (!approved) {
      throw new Error('Approval not granted. Cannot generate purchase order.');
    }

    // TODO: Generate actual PO
    const result = { success: true, poId: `PO_${Date.now()}`, products } as const;
    const { logStructured } = await import('../sdk/index.js');
    logStructured('info', '[Tool] generate_purchase_order complete', { durationMs: Date.now() - start, count: products.length });
    return result;
  },
});

/**
 * Tool: Get SEO insights
 */
const getSEOInsightsTool = tool({
  name: 'get_seo_insights',
  description: 'Get SEO metrics and recommendations',
  parameters: z.object({
    url: z.string().optional().describe('Specific URL to analyze'),
  }),
  execute: async ({ url }) => {
    const start = Date.now();
    console.log('[Tool] get_seo_insights:', { url });

    const result = {
      criticalIssues: ['Missing meta descriptions on 5 pages', 'Slow page load time (3.5s average)'],
      opportunities: ['Add schema markup for products', 'Optimize images (reduce size by 40%)'],
    } as const;
    const { logStructured } = await import('../sdk/index.js');
    logStructured('info', '[Tool] get_seo_insights complete', { durationMs: Date.now() - start });
    return result;
  },
});

/**
 * Create CEO assistant agent instance
 */
export function createCEOAgent() {
  return createAgent(CEO_AGENT_ID, {
    instructions: SYSTEM_PROMPT,
    tools: [
      getInventoryLevelsTool,
      calculateROPTool,
      getAnalyticsMetricsTool,
      generatePurchaseOrderTool,
      getSEOInsightsTool,
    ],
  });
}

/**
 * Handle CEO request
 */
export async function handleCEORequest(request: string): Promise<{
  insights: string;
  requiresApproval: boolean;
}> {
  const agent = createCEOAgent();
  
  const { run } = await import('../sdk/index.js');
  const result = await run(agent, request);
  
  return {
    insights: result.finalOutput || 'No insights generated',
    requiresApproval: true,
  };
}

/**
 * Export tools for testing
 */
export {
  getInventoryLevelsTool,
  calculateROPTool,
  getAnalyticsMetricsTool,
  generatePurchaseOrderTool,
  getSEOInsightsTool,
};

