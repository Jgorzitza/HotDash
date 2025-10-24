import { z } from 'zod';
/**
 * Search troubleshooting guides
 * Read-only - no approval required
 */
export declare const searchTroubleshooting: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    query: z.ZodString;
    productType: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    productType?: string;
}, {
    query?: string;
    productType?: string;
}>, string>;
/**
 * Check warranty status for a product
 * Read-only - no approval required
 */
export declare const checkWarranty: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    orderId: z.ZodString;
    productId: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    orderId?: string;
    productId?: string;
}, {
    orderId?: string;
    productId?: string;
}>, string>;
/**
 * Create a repair ticket
 * Requires human approval for warranty claims
 */
export declare const createRepairTicket: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    orderId: z.ZodString;
    productId: z.ZodString;
    issueDescription: z.ZodString;
    warrantyStatus: z.ZodEnum<["active", "expired"]>;
}, "strip", z.ZodTypeAny, {
    orderId?: string;
    productId?: string;
    issueDescription?: string;
    warrantyStatus?: "active" | "expired";
}, {
    orderId?: string;
    productId?: string;
    issueDescription?: string;
    warrantyStatus?: "active" | "expired";
}>, string>;
/**
 * Get product setup guide
 * Read-only - no approval required
 */
export declare const getSetupGuide: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    productType: z.ZodString;
    productName: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    productType?: string;
    productName?: string;
}, {
    productType?: string;
    productName?: string;
}>, string>;
//# sourceMappingURL=technical.d.ts.map