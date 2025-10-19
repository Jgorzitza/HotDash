#!/usr/bin/env node
import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Ensure analytics helper modules exist during CI builds.
 * These modules were introduced upstream but have not landed on this branch.
 */

const projectRoot = resolve(process.cwd());

const files = [
  {
    path: "app/lib/analytics/sampling-guard.ts",
    contents: `interface SamplingError {
  code?: string;
  status?: number;
  message?: string;
}

const SAMPLING_KEYWORDS = ["sample", "data sampling"];
const SAMPLING_ERROR_CODES = new Set(["DATA_PARTIAL", "DATA_SAMPLING"]);

export function isSamplingError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const details = error as SamplingError;

  if (details.code && SAMPLING_ERROR_CODES.has(details.code)) {
    return true;
  }

  const rawMessage =
    details.message ??
    ("message" in error ? (error as { message?: unknown }).message : "");

  if (typeof rawMessage !== "string") {
    return false;
  }

  const normalizedMessage = rawMessage.toLowerCase();
  return SAMPLING_KEYWORDS.some((keyword) =>
    normalizedMessage.includes(keyword),
  );
}
`,
  },
  {
    path: "app/lib/analytics/schemas.ts",
    contents: `import { z } from "zod";

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
`,
  },
];

async function ensureFile({ path, contents }) {
  const fullPath = resolve(projectRoot, path);
  try {
    await access(fullPath, constants.F_OK);
    console.log(`File present: ${path}`);
    return;
  } catch (error) {
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, contents, "utf8");
    console.log(`Created missing file: ${path}`);
  }
}

(async () => {
  for (const file of files) {
    await ensureFile(file);
  }
})();
