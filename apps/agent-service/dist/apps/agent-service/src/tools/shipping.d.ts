import { z } from 'zod';
/**
 * Get tracking information for an order
 * Read-only - no approval required
 */
export declare const trackShipment: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    orderId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId?: string;
}, {
    orderId?: string;
}>, string>;
/**
 * Estimate delivery time for an order
 * Read-only - no approval required
 */
export declare const estimateDelivery: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    orderId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId?: string;
}, {
    orderId?: string;
}>, string>;
/**
 * Validate shipping address
 * Read-only - no approval required
 */
export declare const validateAddress: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    address1: z.ZodString;
    city: z.ZodString;
    province: z.ZodString;
    zip: z.ZodString;
    country: z.ZodString;
}, "strip", z.ZodTypeAny, {
    address1?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
}, {
    address1?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
}>, string>;
/**
 * Get shipping methods and costs
 * Read-only - no approval required
 */
export declare const getShippingMethods: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    country: z.ZodString;
    province: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    province?: string;
    country?: string;
}, {
    province?: string;
    country?: string;
}>, string>;
//# sourceMappingURL=shipping.d.ts.map