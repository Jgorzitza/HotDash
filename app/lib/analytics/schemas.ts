/**
 * Analytics API Response Schemas
 *
 * Zod validation schemas for analytics API responses
 */

import { z } from "zod";

// Traffic Metrics Schema
export const TrafficMetricsSchema = z.object({
  sessions: z.number(),
  pageviews: z.number(),
  organicSessions: z.number(),
  organicPercentage: z.number(),
});

export const TrafficResponseSchema = z.object({
  success: z.boolean(),
  data: TrafficMetricsSchema.optional(),
  error: z.string().optional(),
  timestamp: z.string(),
  sampled: z.boolean(),
});

export type TrafficResponse = z.infer<typeof TrafficResponseSchema>;

// Revenue Metrics Schema
export const RevenueMetricsSchema = z.object({
  revenue: z.number(),
  transactions: z.number(),
  averageOrderValue: z.number(),
});

export const RevenueResponseSchema = z.object({
  success: z.boolean(),
  data: RevenueMetricsSchema.optional(),
  error: z.string().optional(),
  timestamp: z.string(),
  sampled: z.boolean(),
});

export type RevenueResponse = z.infer<typeof RevenueResponseSchema>;

// Conversion Metrics Schema
export const ConversionMetricsSchema = z.object({
  conversionRate: z.number(),
  conversions: z.number(),
  goalCompletions: z.number(),
});

export const ConversionResponseSchema = z.object({
  success: z.boolean(),
  data: ConversionMetricsSchema.optional(),
  error: z.string().optional(),
  timestamp: z.string(),
  sampled: z.boolean(),
});

export type ConversionResponse = z.infer<typeof ConversionResponseSchema>;
