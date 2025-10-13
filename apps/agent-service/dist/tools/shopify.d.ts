import { z } from 'zod';
/**
 * Find recent orders for a customer (by email or name).
 * Read-only - no approval required.
 */
export declare const shopifyFindOrders: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    query: z.ZodString;
    first: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    first: number;
}, {
    query: string;
    first?: number | undefined;
}>, string>;
/**
 * Cancel a Shopify order with an optional reason.
 * Sensitive action - requires human approval.
 */
export declare const shopifyCancelOrder: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    orderId: z.ZodString;
    notify: z.ZodDefault<z.ZodBoolean>;
    reason: z.ZodNullable<z.ZodEnum<["CUSTOMER", "DECLINED", "FRAUD", "INVENTORY", "OTHER"]>>;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    notify: boolean;
    reason: "CUSTOMER" | "DECLINED" | "FRAUD" | "INVENTORY" | "OTHER" | null;
}, {
    orderId: string;
    reason: "CUSTOMER" | "DECLINED" | "FRAUD" | "INVENTORY" | "OTHER" | null;
    notify?: boolean | undefined;
}>, string>;
//# sourceMappingURL=shopify.d.ts.map