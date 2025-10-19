import { z } from "zod";

import { buildFallbackPacingSummary } from "./mock-data";
import {
  getSupabaseAdsClient,
  parseInteger,
  parseNumeric,
} from "./supabase.server";
import type { AdsPacingStatus, AdsPacingSummary } from "./types";

const SupabasePacingRowSchema = z.object({
  metric_date: z.string(),
  platform: z.string(),
  campaign: z.string().nullable().optional(),
  spend: z.union([z.number(), z.string(), z.null()]).default(0),
  daily_budget: z.union([z.number(), z.string(), z.null()]).default(null),
  pacing_pct: z.union([z.number(), z.string(), z.null()]).default(null),
  clicks: z.union([z.number(), z.string(), z.null()]).default(null),
  conversions: z.union([z.number(), z.string(), z.null()]).default(null),
  revenue: z.union([z.number(), z.string(), z.null()]).default(null),
});

type SupabasePacingRow = z.infer<typeof SupabasePacingRowSchema>;

function determineStatus(pacingRatio: number | null): AdsPacingStatus {
  if (pacingRatio === null) return "on_track";
  if (pacingRatio > 1.05) return "ahead";
  if (pacingRatio < 0.95) return "behind";
  return "on_track";
}

function normaliseRow(row: SupabasePacingRow) {
  const spend = parseNumeric(row.spend) ?? 0;
  const budget = parseNumeric(row.daily_budget);
  const ratio =
    budget && budget > 0 ? Number((spend / budget).toFixed(4)) : null;

  const pacingPercentage =
    ratio === null ? null : Number((ratio * 100).toFixed(2));

  return {
    metricDate: row.metric_date,
    platform: row.platform,
    campaign: row.campaign ?? null,
    spend,
    budget,
    pacingPercentage,
    status: determineStatus(ratio),
    clicks: parseInteger(row.clicks),
    conversions: parseInteger(row.conversions),
    revenue: parseNumeric(row.revenue),
  };
}

export async function getSliceBPacing(): Promise<AdsPacingSummary> {
  const client = getSupabaseAdsClient();
  if (!client) {
    return buildFallbackPacingSummary("Supabase credentials missing");
  }

  try {
    const { data, error } = await client
      .from("ads_slice_b_rollup")
      .select("*")
      .order("metric_date", { ascending: false });

    if (error) {
      console.error("[ads] Supabase error retrieving Slice B:", error);
      return buildFallbackPacingSummary(error.message ?? "Supabase RPC error");
    }

    const parsed = z
      .array(SupabasePacingRowSchema)
      .safeParse(data ?? undefined);

    if (!parsed.success) {
      console.error(
        "[ads] Supabase Slice B payload failed validation:",
        parsed.error.flatten(),
      );
      return buildFallbackPacingSummary("Supabase validation failure");
    }

    if (parsed.data.length === 0) {
      console.warn(
        "[ads] Supabase Slice B returned no data; using fallback summary.",
      );
      return buildFallbackPacingSummary("Supabase returned no rows");
    }

    const rows = parsed.data.map(normaliseRow);

    return {
      rows,
      generatedAt: new Date().toISOString(),
      fallbackReason: undefined,
    };
  } catch (error) {
    console.error("[ads] Unexpected error loading Slice B:", error);
    return buildFallbackPacingSummary(
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
