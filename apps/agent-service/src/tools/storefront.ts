/**
 * Storefront Tools
 *
 * Exposes StorefrontSubAgent capabilities to the OpenAI Agent SDK.
 * Handles catalog discovery, availability checks, and policy lookup via
 * the Storefront MCP-backed service implementation.
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import { getStorefrontService } from './storefront-service-proxy.js';

/**
 * Search products in the public storefront catalog using Storefront MCP.
 */
export const storefrontSearchProducts = tool({
  name: 'storefront_search_products',
  description:
    'Search the storefront catalog using Storefront MCP. Returns products, collections, and available filters.',
  parameters: z.object({
    customerId: z.string().describe('ID for the customer/session requesting the search'),
    query: z.string().min(1).describe('Search query provided by the customer'),
    filters: z
      .record(z.any())
      .nullable()
      .optional()
      .describe('Optional filters such as { priceRange, tags }. Passed directly to Storefront MCP.'),
    sortBy: z
      .string()
      .nullable()
      .optional()
      .describe('Optional sort key (e.g. PRICE_ASC, BEST_SELLING)'),
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(20)
      .describe('Maximum number of products to return (1-50). Default 20.'),
  }),
  async execute({ customerId, query, filters, sortBy, limit }) {
    try {
      const storefrontService = await getStorefrontService();
      const results = await storefrontService.searchProducts(customerId, query, filters, sortBy, limit);
      return {
        success: true,
        message: `Found ${results.products.length} products matching "${query}"`,
        results,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to search products via Storefront MCP',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Check inventory availability for a product or variant.
 */
export const storefrontCheckAvailability = tool({
  name: 'storefront_check_availability',
  description:
    'Check inventory availability for a product or specific variant using Storefront MCP. Supports optional location scoping.',
  parameters: z.object({
    customerId: z.string().describe('ID for the customer/session requesting the availability check'),
    productId: z.string().describe('Shopify Product ID to check'),
    variantId: z
      .string()
      .nullable()
      .optional()
      .describe('Optional specific variant ID'),
    location: z
      .string()
      .nullable()
      .optional()
      .describe('Optional location or fulfillment center identifier'),
  }),
  async execute({ customerId, productId, variantId, location }) {
    try {
      const storefrontService = await getStorefrontService();
      const availability = await storefrontService.checkAvailability(
        customerId,
        productId,
        variantId,
        location,
      );
      return {
        success: true,
        message: availability.available
          ? `Inventory available${availability.quantity ? ` (${availability.quantity})` : ''}`
          : 'Item currently unavailable',
        availability,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to check availability via Storefront MCP',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Retrieve store policies from Storefront MCP.
 */
export const storefrontQueryPolicy = tool({
  name: 'storefront_query_policy',
  description: 'Retrieve store policy content (return, shipping, privacy, terms) via Storefront MCP tools.',
  parameters: z.object({
    customerId: z.string().describe('ID for the customer/session requesting policy information'),
    policyType: z
      .enum(['return', 'shipping', 'privacy', 'terms'])
      .describe('Policy document to fetch'),
  }),
  async execute({ customerId, policyType }) {
    try {
      const storefrontService = await getStorefrontService();
      const policy = await storefrontService.queryPolicy(customerId, policyType);
      return {
        success: true,
        message: `Retrieved ${policyType} policy (last updated ${policy.lastUpdated})`,
        policy,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve storefront policy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Browse collections and featured products.
 */
export const storefrontBrowseCollections = tool({
  name: 'storefront_browse_collections',
  description: 'Browse storefront collections and their featured products via Storefront MCP.',
  parameters: z.object({
    customerId: z.string().describe('ID for the customer/session requesting collection data'),
    collectionHandle: z
      .string()
      .nullable()
      .optional()
      .describe('Optional collection handle to target a specific collection'),
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(20)
      .describe('Maximum number of collections to return (1-50). Default 20.'),
  }),
  async execute({ customerId, collectionHandle, limit }) {
    try {
      const storefrontService = await getStorefrontService();
      const collections = await storefrontService.browseCollections(customerId, collectionHandle, limit);
      return {
        success: true,
        message: `Retrieved ${collections.length} collections`,
        collections,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to browse collections via Storefront MCP',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Fetch Storefront Sub-Agent performance metrics for observability.
 */
export const storefrontGetMetrics = tool({
  name: 'storefront_get_metrics',
  description: 'Fetch performance metrics for the Storefront Sub-Agent (monitoring use only).',
  parameters: z.object({}),
  async execute() {
    try {
      const storefrontService = await getStorefrontService();
      const metrics = await storefrontService.getPerformanceMetrics();
      return {
        success: true,
        metrics,
        message: 'Retrieved Storefront Sub-Agent performance metrics',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch Storefront Sub-Agent metrics',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
