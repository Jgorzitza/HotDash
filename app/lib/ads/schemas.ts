import { z } from "zod";

export const AdsPacingRowSchema = z.object({
  metricDate: z.string(),
  platform: z.string(),
  campaign: z.string().nullable().optional(),
  spend: z.number(),
  budget: z.number().nullable(),
  pacingPercentage: z.number().nullable(),
  status: z.enum(["ahead", "behind", "on_track"]),
  clicks: z.number().nullable(),
  conversions: z.number().nullable(),
  revenue: z.number().nullable(),
});

export const AdsPacingSummarySchema = z.object({
  rows: z.array(AdsPacingRowSchema),
  generatedAt: z.string(),
  fallbackReason: z.string().optional(),
});

export const AdsPacingResponseSchema = z.object({
  success: z.boolean(),
  data: AdsPacingSummarySchema.optional(),
  error: z.string().optional(),
  timestamp: z.string(),
});

export const AdsAttributionRowSchema = z.object({
  platform: z.string(),
  campaign: z.string().nullable().optional(),
  spend: z.number(),
  revenue: z.number(),
  conversions: z.number(),
  roas: z.number().nullable(),
  cpa: z.number().nullable(),
  conversionRatePct: z.number().nullable(),
});

export const AdsAttributionSummarySchema = z.object({
  rows: z.array(AdsAttributionRowSchema),
  generatedAt: z.string(),
  fallbackReason: z.string().optional(),
});

export const AdsAttributionResponseSchema = z.object({
  success: z.boolean(),
  data: AdsAttributionSummarySchema.optional(),
  error: z.string().optional(),
  timestamp: z.string(),
});
