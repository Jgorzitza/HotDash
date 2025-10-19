import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_SUPABASE_URL = process.env.SUPABASE_URL;
const ORIGINAL_SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

afterEach(() => {
  process.env.SUPABASE_URL = ORIGINAL_SUPABASE_URL;
  process.env.SUPABASE_SERVICE_KEY = ORIGINAL_SUPABASE_KEY;
  vi.resetModules();
});

describe("getSliceBPacing", () => {
  it("returns fallback summary when Supabase credentials are missing", async () => {
    vi.resetModules();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;

    const { getSliceBPacing } = await import("~/lib/ads/pacing.server");
    const { __setSupabaseAdsClientOverride } = await import(
      "~/lib/ads/supabase.server"
    );

    __setSupabaseAdsClientOverride(null);

    const summary = await getSliceBPacing();

    expect(summary.fallbackReason).toContain("Supabase");
    expect(summary.rows.length).toBeGreaterThan(0);

    __setSupabaseAdsClientOverride(null);
  });

  it("normalises Supabase payload values", async () => {
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.test";
    process.env.SUPABASE_SERVICE_KEY = "example-key";

    const { getSliceBPacing } = await import("~/lib/ads/pacing.server");
    const { __setSupabaseAdsClientOverride } = await import(
      "~/lib/ads/supabase.server"
    );

    const orderMock = vi.fn().mockResolvedValue({
      data: [
        {
          metric_date: "2025-10-18",
          platform: "google_ads",
          campaign: "Brand",
          spend: "110.5",
          daily_budget: "100",
          pacing_pct: "110.5",
          clicks: "200",
          conversions: "20",
          revenue: "4500",
        },
      ],
      error: null,
    });

    const selectMock = vi.fn(() => ({ order: orderMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));

    __setSupabaseAdsClientOverride({
      from: fromMock,
    } as unknown as { from: typeof fromMock });

    const summary = await getSliceBPacing();

    expect(fromMock).toHaveBeenCalledWith("ads_slice_b_rollup");
    expect(summary.rows).toHaveLength(1);
    const [row] = summary.rows;
    expect(row.spend).toBeCloseTo(110.5);
    expect(row.budget).toBeCloseTo(100);
    expect(row.pacingPercentage).toBeCloseTo(110.5);
    expect(row.status).toBe("ahead");

    __setSupabaseAdsClientOverride(null);
  });

  it("falls back when Supabase returns no rows", async () => {
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.test";
    process.env.SUPABASE_SERVICE_KEY = "example-key";

    const { getSliceBPacing } = await import("~/lib/ads/pacing.server");
    const { __setSupabaseAdsClientOverride } = await import(
      "~/lib/ads/supabase.server"
    );

    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null });
    const selectMock = vi.fn(() => ({ order: orderMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));

    __setSupabaseAdsClientOverride({
      from: fromMock,
    } as unknown as { from: typeof fromMock });

    const summary = await getSliceBPacing();

    expect(fromMock).toHaveBeenCalledWith("ads_slice_b_rollup");
    expect(summary.fallbackReason).toContain("no rows");
    expect(summary.rows).toHaveLength(3);

    __setSupabaseAdsClientOverride(null);
  });
});
