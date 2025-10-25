/**
 * Analytics API Response Schemas
 *
 * Zod schemas for validating analytics API responses
 */
import { z } from "zod";
/**
 * Revenue response schema
 */
export declare const RevenueResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodObject<{
        revenue: z.ZodNumber;
        transactions: z.ZodNumber;
        avgOrderValue: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        revenue?: number;
        transactions?: number;
        avgOrderValue?: number;
    }, {
        revenue?: number;
        transactions?: number;
        avgOrderValue?: number;
    }>>;
    error: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    sampled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    data?: {
        revenue?: number;
        transactions?: number;
        avgOrderValue?: number;
    };
    timestamp?: string;
    sampled?: boolean;
}, {
    error?: string;
    success?: boolean;
    data?: {
        revenue?: number;
        transactions?: number;
        avgOrderValue?: number;
    };
    timestamp?: string;
    sampled?: boolean;
}>;
export type RevenueResponse = z.infer<typeof RevenueResponseSchema>;
/**
 * Traffic response schema
 */
export declare const TrafficResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodObject<{
        sessions: z.ZodNumber;
        users: z.ZodNumber;
        pageviews: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        sessions?: number;
        pageviews?: number;
        users?: number;
    }, {
        sessions?: number;
        pageviews?: number;
        users?: number;
    }>>;
    error: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    sampled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    data?: {
        sessions?: number;
        pageviews?: number;
        users?: number;
    };
    timestamp?: string;
    sampled?: boolean;
}, {
    error?: string;
    success?: boolean;
    data?: {
        sessions?: number;
        pageviews?: number;
        users?: number;
    };
    timestamp?: string;
    sampled?: boolean;
}>;
export type TrafficResponse = z.infer<typeof TrafficResponseSchema>;
/**
 * Conversion rate response schema
 */
export declare const ConversionRateResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodObject<{
        rate: z.ZodNumber;
        transactions: z.ZodNumber;
        sessions: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        sessions?: number;
        transactions?: number;
        rate?: number;
    }, {
        sessions?: number;
        transactions?: number;
        rate?: number;
    }>>;
    error: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    sampled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    data?: {
        sessions?: number;
        transactions?: number;
        rate?: number;
    };
    timestamp?: string;
    sampled?: boolean;
}, {
    error?: string;
    success?: boolean;
    data?: {
        sessions?: number;
        transactions?: number;
        rate?: number;
    };
    timestamp?: string;
    sampled?: boolean;
}>;
export type ConversionRateResponse = z.infer<typeof ConversionRateResponseSchema>;
export declare const ConversionResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodObject<{
        rate: z.ZodNumber;
        transactions: z.ZodNumber;
        sessions: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        sessions?: number;
        transactions?: number;
        rate?: number;
    }, {
        sessions?: number;
        transactions?: number;
        rate?: number;
    }>>;
    error: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    sampled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    data?: {
        sessions?: number;
        transactions?: number;
        rate?: number;
    };
    timestamp?: string;
    sampled?: boolean;
}, {
    error?: string;
    success?: boolean;
    data?: {
        sessions?: number;
        transactions?: number;
        rate?: number;
    };
    timestamp?: string;
    sampled?: boolean;
}>;
export type ConversionResponse = ConversionRateResponse;
//# sourceMappingURL=schemas.d.ts.map