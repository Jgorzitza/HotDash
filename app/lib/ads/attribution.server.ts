import { z } from "zod";

import { buildFallbackAttributionSummary } from "./mock-data";
import {
  getSupabaseAdsClient,
  parseInteger,
  parseNumeric,
} from "./supabase.server";
import type { AdsAttributionSummary } from "./types";

const SupabaseAttributionRowSchema = z.object({
  platform: z.string(),
  campaign: z.string().nullable().optional(),
  spend: z.union([z.number(), z.string(), z.null()]).default(0),
  revenue: z.union([z.number(), z.string(), z.null()]).default(0),
  conversions: z.union([z.number(), z.string(), z.null()]).default(0),
  roas: z.union([z.number(), z.string(), z.null()]).default(null),
  cpa: z.union([z.number(), z.string(), z.null()]).default(null),
  conversion_rate_pct: z
    .union([z.number(), z.string(), z.null()])
    .default(null),
  clicks: z.union([z.number(), z.string(), z.null()]).default(null),
});

export async function getSliceCAttribution(): Promise<AdsAttributionSummary> {
  const client = getSupabaseAdsClient();
  if (!client) {
    return buildFallbackAttributionSummary("Supabase credentials missing");
  }

  try {
    const { data, error } = await client
      .from("ads_slice_c_attribution")
      .select("*")
      .order("platform", { ascending: true });

    if (error) {
      console.error("[ads] Supabase error retrieving Slice C:", error);
      return buildFallbackAttributionSummary(
        error.message ?? "Supabase RPC error",
      );
    }

    const parsed = z
      .array(SupabaseAttributionRowSchema)
      .safeParse(data ?? undefined);

    if (!parsed.success) {
      console.error(
        "[ads] Supabase Slice C payload failed validation:",
        parsed.error.flatten(),
      );
      return buildFallbackAttributionSummary("Supabase validation failure");
    }

    if (parsed.data.length === 0) {
      console.warn(
        "[ads] Supabase Slice C returned no data; using fallback summary.",
      );
      return buildFallbackAttributionSummary("Supabase returned no rows");
    }

    const rows = parsed.data
      .map((row) => {
        const spend = parseNumeric(row.spend) ?? 0;
        const revenue = parseNumeric(row.revenue) ?? 0;
        const conversions = parseInteger(row.conversions) ?? 0;
        const clicks = parseInteger(row.clicks);

        const roas =
          spend > 0
            ? Number((revenue / spend).toFixed(2))
            : parseNumeric(row.roas);
        const cpa =
          conversions > 0
            ? Number((spend / conversions).toFixed(2))
            : parseNumeric(row.cpa);
        const conversionRatePct =
          clicks && clicks > 0
            ? Number(((conversions / clicks) * 100).toFixed(2))
            : parseNumeric(row.conversion_rate_pct);

        return {
          platform: row.platform,
          campaign: row.campaign ?? null,
          spend,
          revenue,
          conversions,
          roas,
          cpa,
          conversionRatePct,
        };
      })
      .sort((a, b) => {
        const platformCompare = a.platform.localeCompare(b.platform);
        if (platformCompare !== 0) return platformCompare;
        const campaignA = a.campaign ?? "";
        const campaignB = b.campaign ?? "";
        return campaignA.localeCompare(campaignB);
      });

    return {
      rows,
      generatedAt: new Date().toISOString(),
      fallbackReason: undefined,
    };
  } catch (error) {
    console.error("[ads] Unexpected error loading Slice C:", error);
    return buildFallbackAttributionSummary(
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
