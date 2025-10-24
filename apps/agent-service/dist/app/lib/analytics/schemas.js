/**
 * Analytics API Response Schemas
 *
 * Zod schemas for validating analytics API responses
 */
import { z } from "zod";
/**
 * Revenue response schema
 */
export const RevenueResponseSchema = z.object({
    success: z.boolean(),
    data: z
        .object({
        revenue: z.number(),
        transactions: z.number(),
        avgOrderValue: z.number(),
    })
        .optional(),
    error: z.string().optional(),
    timestamp: z.string(),
    sampled: z.boolean(),
});
/**
 * Traffic response schema
 */
export const TrafficResponseSchema = z.object({
    success: z.boolean(),
    data: z
        .object({
        sessions: z.number(),
        users: z.number(),
        pageviews: z.number(),
    })
        .optional(),
    error: z.string().optional(),
    timestamp: z.string(),
    sampled: z.boolean(),
});
/**
 * Conversion rate response schema
 */
export const ConversionRateResponseSchema = z.object({
    success: z.boolean(),
    data: z
        .object({
        rate: z.number(),
        transactions: z.number(),
        sessions: z.number(),
    })
        .optional(),
    error: z.string().optional(),
    timestamp: z.string(),
    sampled: z.boolean(),
});
// Alias for backwards compatibility
export const ConversionResponseSchema = ConversionRateResponseSchema;
//# sourceMappingURL=schemas.js.map