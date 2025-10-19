import { z } from "zod";

const PeriodSchema = z.object({
  start: z.string(),
  end: z.string(),
});

const RevenueTrendSchema = z.object({
  revenueChange: z.number(),
  aovChange: z.number(),
  transactionsChange: z.number(),
});

export const RevenueMetricsSchema = z.object({
  totalRevenue: z.number(),
  averageOrderValue: z.number(),
  transactions: z.number(),
  trend: RevenueTrendSchema,
  period: PeriodSchema,
});

const TrafficTrendSchema = z.object({
  sessionsChange: z.number(),
  organicChange: z.number(),
});

export const TrafficMetricsSchema = z.object({
  totalSessions: z.number(),
  organicSessions: z.number(),
  organicPercentage: z.number(),
  trend: TrafficTrendSchema,
  period: PeriodSchema,
});

const ConversionTrendSchema = z.object({
  conversionRateChange: z.number(),
});

export const ConversionMetricsSchema = z.object({
  conversionRate: z.number(),
  transactions: z.number(),
  revenue: z.number(),
  trend: ConversionTrendSchema,
  period: PeriodSchema,
});

const BaseResponseSchema = z.object({
  success: z.boolean(),
  timestamp: z.string(),
  sampled: z.boolean(),
  error: z.string().optional(),
});

export const RevenueResponseSchema = BaseResponseSchema.extend({
  data: RevenueMetricsSchema.optional(),
});

export const TrafficResponseSchema = BaseResponseSchema.extend({
  data: TrafficMetricsSchema.optional(),
});

export const ConversionResponseSchema = BaseResponseSchema.extend({
  data: ConversionMetricsSchema.optional(),
});

export type RevenueResponse = z.infer<typeof RevenueResponseSchema>;
export type TrafficResponse = z.infer<typeof TrafficResponseSchema>;
export type ConversionResponse = z.infer<typeof ConversionResponseSchema>;
