import { z } from "zod";

/**
 * Analytics API Response Schemas
 * Used for type-safe API responses from analytics endpoints
 */

export const ConversionResponseSchema = z.object({
  conversionRate: z.number(),
  period: z.string(),
  change: z.number().optional(),
  previousPeriod: z
    .object({
      conversionRate: z.number(),
      period: z.string(),
    })
    .optional(),
});

export const RevenueResponseSchema = z.object({
  revenue: z.number(),
  period: z.string(),
  change: z.number().optional(),
  currency: z.string().default("USD"),
  previousPeriod: z
    .object({
      revenue: z.number(),
      period: z.string(),
    })
    .optional(),
});

export const TrafficResponseSchema = z.object({
  sessions: z.number(),
  users: z.number(),
  pageviews: z.number(),
  period: z.string(),
  bounceRate: z.number().optional(),
  avgSessionDuration: z.number().optional(),
  previousPeriod: z
    .object({
      sessions: z.number(),
      users: z.number(),
      pageviews: z.number(),
      period: z.string(),
    })
    .optional(),
});

export const IdeaPoolItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["pending_review", "draft", "approved", "rejected"]),
  rationale: z.string(),
  projectedImpact: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  confidence: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  reviewer: z.string().optional(),
});

export const IdeaPoolResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(IdeaPoolItemSchema),
    totals: z.object({
      pending: z.number(),
      approved: z.number(),
      rejected: z.number(),
    }),
  }),
  source: z.string(),
  timestamp: z.string(),
  warnings: z.array(z.string()).optional(),
  error: z.string().optional(),
});

export type ConversionResponse = z.infer<typeof ConversionResponseSchema>;
export type RevenueResponse = z.infer<typeof RevenueResponseSchema>;
export type TrafficResponse = z.infer<typeof TrafficResponseSchema>;
export type IdeaPoolItem = z.infer<typeof IdeaPoolItemSchema>;
export type IdeaPoolResponse = z.infer<typeof IdeaPoolResponseSchema>;
