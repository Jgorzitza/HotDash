/**
 * Customer Accounts Tools
 *
 * Tools for the Accounts Agent to interact with Customer Accounts MCP.
 * Wraps the AccountsSubAgent service with OAuth and ABAC enforcement.
 *
 * SECURITY: These tools handle PII and require OAuth tokens.
 * Only the Accounts Agent should have access to these tools.
 */
import { z } from 'zod';
/**
 * Get customer orders
 *
 * Retrieves order history for an authenticated customer.
 * Requires OAuth token and ABAC approval.
 */
export declare const getCustomerOrders: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    customerId: z.ZodString;
    token: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    token: string;
    limit: number;
}, {
    customerId: string;
    token: string;
    limit?: number | undefined;
}>, string>;
/**
 * Get order details
 *
 * Retrieves detailed information for a specific order.
 * Requires OAuth token and ABAC approval.
 */
export declare const getOrderDetails: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    customerId: z.ZodString;
    orderId: z.ZodString;
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    customerId: string;
    token: string;
}, {
    orderId: string;
    customerId: string;
    token: string;
}>, string>;
/**
 * Get customer account info
 *
 * Retrieves account information for an authenticated customer.
 * Requires OAuth token and ABAC approval.
 *
 * WARNING: This accesses PII (email, phone, addresses).
 */
export declare const getAccountInfo: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    customerId: z.ZodString;
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    token: string;
}, {
    customerId: string;
    token: string;
}>, string>;
/**
 * Update customer preferences
 *
 * Updates customer preferences (marketing, notifications, etc.).
 * Requires OAuth token and ABAC approval.
 */
export declare const updatePreferences: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    customerId: z.ZodString;
    token: z.ZodString;
    preferences: z.ZodObject<{
        marketing: z.ZodOptional<z.ZodBoolean>;
        notifications: z.ZodOptional<z.ZodBoolean>;
        sms: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        notifications?: boolean | undefined;
        marketing?: boolean | undefined;
        sms?: boolean | undefined;
    }, {
        notifications?: boolean | undefined;
        marketing?: boolean | undefined;
        sms?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    preferences: {
        notifications?: boolean | undefined;
        marketing?: boolean | undefined;
        sms?: boolean | undefined;
    };
    token: string;
}, {
    customerId: string;
    preferences: {
        notifications?: boolean | undefined;
        marketing?: boolean | undefined;
        sms?: boolean | undefined;
    };
    token: string;
}>, string>;
/**
 * Get account metrics
 *
 * Retrieves metrics for the Accounts Agent (for monitoring).
 * Does not require OAuth token.
 */
export declare const getAccountsMetrics: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>, string>;
//# sourceMappingURL=accounts.d.ts.map