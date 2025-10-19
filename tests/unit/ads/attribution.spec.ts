import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_SUPABASE_URL = process.env.SUPABASE_URL;
const ORIGINAL_SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

afterEach(() => {
  process.env.SUPABASE_URL = ORIGINAL_SUPABASE_URL;
  process.env.SUPABASE_SERVICE_KEY = ORIGINAL_SUPABASE_KEY;
  vi.resetModules();
});

describe("getSliceCAttribution", () => {
  it("returns fallback summary when Supabase credentials are missing", async () => {
    vi.resetModules();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;

    const { getSliceCAttribution } = await import(
      "~/lib/ads/attribution.server"
    );
    const { __setSupabaseAdsClientOverride } = await import(
      "~/lib/ads/supabase.server"
    );

    __setSupabaseAdsClientOverride(null);

    const summary = await getSliceCAttribution();

    expect(summary.fallbackReason).toContain("Supabase");
    expect(summary.rows.length).toBeGreaterThan(0);

    __setSupabaseAdsClientOverride(null);
  });

  it("normalises Supabase payload values", async () => {
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.test";
    process.env.SUPABASE_SERVICE_KEY = "example-key";

    const { getSliceCAttribution } = await import(
      "~/lib/ads/attribution.server"
    );
    const { __setSupabaseAdsClientOverride } = await import(
      "~/lib/ads/supabase.server"
    );

    const orderMock = vi.fn().mockResolvedValue({
      data: [
        {
          platform: "google_ads",
          campaign: "Brand",
          spend: "1000",
          revenue: "4500",
          conversions: "90",
          roas: null,
          cpa: null,
          conversion_rate_pct: null,
          clicks: "1800",
        },
      ],
      error: null,
    });

    const selectMock = vi.fn(() => ({ order: orderMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));

    __setSupabaseAdsClientOverride({
      from: fromMock,
    } as unknown as { from: typeof fromMock });

    const summary = await getSliceCAttribution();

    expect(fromMock).toHaveBeenCalledWith("ads_slice_c_attribution");
    expect(summary.rows).toHaveLength(1);
    const [row] = summary.rows;
    expect(row.spend).toBe(1000);
    expect(row.revenue).toBe(4500);
    expect(row.conversions).toBe(90);
    expect(row.roas).toBeCloseTo(4.5);
    expect(row.cpa).toBeCloseTo(11.11, 2);
    expect(row.conversionRatePct).toBeCloseTo(5, 5);

    __setSupabaseAdsClientOverride(null);
  });

  it("falls back when Supabase returns no rows", async () => {
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.test";
    process.env.SUPABASE_SERVICE_KEY = "example-key";

    const { getSliceCAttribution } = await import(
      "~/lib/ads/attribution.server"
    );
    const { __setSupabaseAdsClientOverride } = await import(
      "~/lib/ads/supabase.server"
    );

    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null });
    const selectMock = vi.fn(() => ({ order: orderMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));

    __setSupabaseAdsClientOverride({
      from: fromMock,
    } as unknown as { from: typeof fromMock });

    const summary = await getSliceCAttribution();

    expect(fromMock).toHaveBeenCalledWith("ads_slice_c_attribution");
    expect(summary.fallbackReason).toContain("no rows");
    expect(summary.rows).toHaveLength(3);

    __setSupabaseAdsClientOverride(null);
  });
});
