/**
 * Shopify Returns Analytics Stub
 *
 * This module provides stubbed return/refund data for analytics until
 * Shopify GraphQL credentials with proper scopes are configured.
 *
 * Required Shopify API Scopes:
 * - read_orders
 * - read_marketplace_orders
 * - read_returns
 * - read_marketplace_returns
 *
 * Feature Flag: ANALYTICS_REAL_DATA (default: false)
 * When false, uses stub data below
 * When true, queries live Shopify Admin GraphQL API
 */
import { z } from "zod";
export declare const ReturnStatusSchema: z.ZodEnum<["REQUESTED", "IN_PROGRESS", "CLOSED", "DECLINED", "CANCELED"]>;
export type ReturnStatus = z.infer<typeof ReturnStatusSchema>;
export declare const ReturnReasonSchema: z.ZodEnum<["UNKNOWN", "DAMAGED", "DEFECTIVE", "NOT_AS_DESCRIBED", "UNWANTED", "SIZE_TOO_SMALL", "SIZE_TOO_LARGE", "STYLE", "COLOR", "OTHER"]>;
export type ReturnReason = z.infer<typeof ReturnReasonSchema>;
export declare const ReturnMetricsSchema: z.ZodObject<{
    totalReturns: z.ZodNumber;
    returnRate: z.ZodNumber;
    totalRefundAmount: z.ZodNumber;
    averageRefundAmount: z.ZodNumber;
    topReasons: z.ZodArray<z.ZodObject<{
        reason: z.ZodEnum<["UNKNOWN", "DAMAGED", "DEFECTIVE", "NOT_AS_DESCRIBED", "UNWANTED", "SIZE_TOO_SMALL", "SIZE_TOO_LARGE", "STYLE", "COLOR", "OTHER"]>;
        count: z.ZodNumber;
        percentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        reason?: "OTHER" | "UNKNOWN" | "DAMAGED" | "DEFECTIVE" | "NOT_AS_DESCRIBED" | "UNWANTED" | "SIZE_TOO_SMALL" | "SIZE_TOO_LARGE" | "STYLE" | "COLOR";
        count?: number;
        percentage?: number;
    }, {
        reason?: "OTHER" | "UNKNOWN" | "DAMAGED" | "DEFECTIVE" | "NOT_AS_DESCRIBED" | "UNWANTED" | "SIZE_TOO_SMALL" | "SIZE_TOO_LARGE" | "STYLE" | "COLOR";
        count?: number;
        percentage?: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalReturns?: number;
    returnRate?: number;
    totalRefundAmount?: number;
    averageRefundAmount?: number;
    topReasons?: {
        reason?: "OTHER" | "UNKNOWN" | "DAMAGED" | "DEFECTIVE" | "NOT_AS_DESCRIBED" | "UNWANTED" | "SIZE_TOO_SMALL" | "SIZE_TOO_LARGE" | "STYLE" | "COLOR";
        count?: number;
        percentage?: number;
    }[];
}, {
    totalReturns?: number;
    returnRate?: number;
    totalRefundAmount?: number;
    averageRefundAmount?: number;
    topReasons?: {
        reason?: "OTHER" | "UNKNOWN" | "DAMAGED" | "DEFECTIVE" | "NOT_AS_DESCRIBED" | "UNWANTED" | "SIZE_TOO_SMALL" | "SIZE_TOO_LARGE" | "STYLE" | "COLOR";
        count?: number;
        percentage?: number;
    }[];
}>;
export type ReturnMetrics = z.infer<typeof ReturnMetricsSchema>;
export declare const ReturnAnalyticsResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodObject<{
        totalReturns: z.ZodNumber;
        returnRate: z.ZodNumber;
        totalRefundAmount: z.ZodNumber;
        averageRefundAmount: z.ZodNumber;
        topReasons: z.ZodArray<z.ZodObject<{
            reason: z.ZodEnum<["UNKNOWN", "DAMAGED", "DEFECTIVE", "NOT_AS_DESCRIBED", "UNWANTED", "SIZE_TOO_SMALL", "SIZE_TOO_LARGE", "STYLE", "COLOR", "OTHER"]>;
            count: z.ZodNumber;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            reason?: "OTHER" | "UNKNOWN" | "DAMAGED" | "DEFECTIVE" | "NOT_AS_DESCRIBED" | "UNWANTED" | "SIZE_TOO_SMALL" | "SIZE_TOO_LARGE" | "STYLE" | "COLOR";
            count?: number;
            percentage?: number;
        }, {
            reason?: "OTHER" | "UNKNOWN" | "DAMAGED" | "DEFECTIVE" | "NOT_AS_DESCRIBED" | "UNWANTED" | "SIZE_TOO_SMALL" | "SIZE_TOO_LARGE" | "STYLE" | "COLOR";
            count?: number;
            percentage?: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        totalReturns?: number;
        returnRate?: number;
        totalRefundAmount?: number;
        averageRefundAmount?: number;
        topReasons?: {
            reason?: "OTHER" | "UNKNOWN" | "DAMAGED" | "DEFECTIVE" | "NOT_AS_DESCRIBED" | "UNWANTED" | "SIZE_TOO_SMALL" | "SIZE_TOO_LARGE" | "STYLE" | "COLOR";
            count?: number;
            percentage?: number;
        }[];
    }, {
        totalReturns?: number;
        returnRate?: number;
        totalRefundAmount?: number;
        averageRefundAmount?: number;
        topReasons?: {
            reason?: "OTHER" | "UNKNOWN" | "DAMAGED" | "DEFECTIVE" | "NOT_AS_DESCRIBED" | "UNWANTED" | "SIZE_TOO_SMALL" | "SIZE_TOO_LARGE" | "STYLE" | "COLOR";
            count?: number;
            percentage?: number;
        }[];
    }>>;
    error: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    mode: z.ZodEnum<["stub", "live"]>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    data?: {
        totalReturns?: number;
        returnRate?: number;
        totalRefundAmount?: number;
        averageRefundAmount?: number;
        topReasons?: {
            reason?: "OTHER" | "UNKNOWN" | "DAMAGED" | "DEFECTIVE" | "NOT_AS_DESCRIBED" | "UNWANTED" | "SIZE_TOO_SMALL" | "SIZE_TOO_LARGE" | "STYLE" | "COLOR";
            count?: number;
            percentage?: number;
        }[];
    };
    timestamp?: string;
    mode?: "stub" | "live";
}, {
    error?: string;
    success?: boolean;
    data?: {
        totalReturns?: number;
        returnRate?: number;
        totalRefundAmount?: number;
        averageRefundAmount?: number;
        topReasons?: {
            reason?: "OTHER" | "UNKNOWN" | "DAMAGED" | "DEFECTIVE" | "NOT_AS_DESCRIBED" | "UNWANTED" | "SIZE_TOO_SMALL" | "SIZE_TOO_LARGE" | "STYLE" | "COLOR";
            count?: number;
            percentage?: number;
        }[];
    };
    timestamp?: string;
    mode?: "stub" | "live";
}>;
export type ReturnAnalyticsResponse = z.infer<typeof ReturnAnalyticsResponseSchema>;
/**
 * Get return analytics metrics
 *
 * @param startDate - ISO 8601 start date
 * @param endDate - ISO 8601 end date
 * @returns Return metrics or stub data based on feature flag
 */
export declare function getReturnMetrics(startDate: string, endDate: string): Promise<ReturnAnalyticsResponse>;
/**
 * GraphQL query template for when credentials are ready
 *
 * This query will fetch return data from Shopify Admin API.
 * Requires scopes: read_orders, read_marketplace_orders, read_returns, read_marketplace_returns
 */
export declare const SHOPIFY_RETURNS_QUERY = "\nquery GetReturns($startDate: DateTime!, $endDate: DateTime!) {\n  returns(\n    first: 250\n    query: \"created_at:>=$startDate AND created_at:<=$endDate\"\n  ) {\n    edges {\n      node {\n        id\n        name\n        status\n        totalQuantity\n        createdAt\n        closedAt\n        order {\n          id\n          name\n        }\n        returnLineItems(first: 10) {\n          edges {\n            node {\n              id\n              quantity\n              returnReason\n              returnReasonNote\n            }\n          }\n        }\n        refunds(first: 10) {\n          edges {\n            node {\n              id\n              totalRefundedSet {\n                shopMoney {\n                  amount\n                  currencyCode\n                }\n              }\n              createdAt\n            }\n          }\n        }\n      }\n    }\n  }\n}\n";
//# sourceMappingURL=shopify-returns.stub.d.ts.map