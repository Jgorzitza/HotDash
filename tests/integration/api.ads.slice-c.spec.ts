import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_SUPABASE_URL = process.env.SUPABASE_URL;
const ORIGINAL_SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

afterEach(() => {
  process.env.SUPABASE_URL = ORIGINAL_SUPABASE_URL;
  process.env.SUPABASE_SERVICE_KEY = ORIGINAL_SUPABASE_KEY;
  vi.resetModules();
});

describe("api.ads.slice-c loader", () => {
  it("returns fallback payload when Supabase credentials missing", async () => {
    vi.resetModules();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;

    const { loader } = await import("~/routes/api.ads.slice-c");
    const { __setSupabaseAdsClientOverride } = await import(
      "~/lib/ads/supabase.server"
    );

    __setSupabaseAdsClientOverride(null);

    const response = await loader({
      request: new Request("http://example.com/api/ads/slice-c"),
      params: {},
      context: {},
    } as unknown as Parameters<typeof loader>[0]);

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.fallbackReason).toContain("Supabase");

    __setSupabaseAdsClientOverride(null);
  });

  it("returns Supabase-backed payload when data available", async () => {
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.test";
    process.env.SUPABASE_SERVICE_KEY = "example-key";

    const { loader } = await import("~/routes/api.ads.slice-c");
    const { __setSupabaseAdsClientOverride } = await import(
      "~/lib/ads/supabase.server"
    );

    const orderMock = vi.fn().mockResolvedValue({
      data: [
        {
          platform: "google_ads",
          campaign: "Brand",
          spend: "800",
          revenue: "3200",
          conversions: "64",
          roas: null,
          cpa: null,
          conversion_rate_pct: null,
          clicks: "1200",
        },
      ],
      error: null,
    });

    const selectMock = vi.fn(() => ({ order: orderMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));

    __setSupabaseAdsClientOverride({
      from: fromMock,
    } as unknown as { from: typeof fromMock });

    const response = await loader({
      request: new Request("http://example.com/api/ads/slice-c"),
      params: {},
      context: {},
    } as unknown as Parameters<typeof loader>[0]);

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.rows).toHaveLength(1);
    expect(payload.data.fallbackReason).toBeUndefined();
    const [row] = payload.data.rows;
    expect(row.roas).toBeCloseTo(4);
    expect(row.cpa).toBeCloseTo(12.5);

    __setSupabaseAdsClientOverride(null);
  });
});
