/**
 * Storefront Tools
 *
 * Exposes StorefrontSubAgent capabilities to the OpenAI Agent SDK.
 * Handles catalog discovery, availability checks, and policy lookup via
 * the Storefront MCP-backed service implementation.
 */
import { z } from 'zod';
/**
 * Search products in the public storefront catalog using Storefront MCP.
 */
export declare const storefrontSearchProducts: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    customerId: z.ZodString;
    query: z.ZodString;
    filters: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    sortBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    customerId?: string;
    limit?: number;
    filters?: Record<string, any>;
    sortBy?: string;
}, {
    query?: string;
    customerId?: string;
    limit?: number;
    filters?: Record<string, any>;
    sortBy?: string;
}>, string>;
/**
 * Check inventory availability for a product or variant.
 */
export declare const storefrontCheckAvailability: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    customerId: z.ZodString;
    productId: z.ZodString;
    variantId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    productId?: string;
    location?: string;
    customerId?: string;
    variantId?: string;
}, {
    productId?: string;
    location?: string;
    customerId?: string;
    variantId?: string;
}>, string>;
/**
 * Retrieve store policies from Storefront MCP.
 */
export declare const storefrontQueryPolicy: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    customerId: z.ZodString;
    policyType: z.ZodEnum<["return", "shipping", "privacy", "terms"]>;
}, "strip", z.ZodTypeAny, {
    customerId?: string;
    policyType?: "return" | "shipping" | "privacy" | "terms";
}, {
    customerId?: string;
    policyType?: "return" | "shipping" | "privacy" | "terms";
}>, string>;
/**
 * Browse collections and featured products.
 */
export declare const storefrontBrowseCollections: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    customerId: z.ZodString;
    collectionHandle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    customerId?: string;
    limit?: number;
    collectionHandle?: string;
}, {
    customerId?: string;
    limit?: number;
    collectionHandle?: string;
}>, string>;
/**
 * Fetch Storefront Sub-Agent performance metrics for observability.
 */
export declare const storefrontGetMetrics: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>, string>;
//# sourceMappingURL=storefront.d.ts.map