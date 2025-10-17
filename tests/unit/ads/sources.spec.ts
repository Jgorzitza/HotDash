import { describe, it, expect } from "vitest";
import { fetchMetaCampaigns } from "~/lib/ads/sources/meta";
import { fetchGoogleCampaigns } from "~/lib/ads/sources/google";
import { aggregateCampaigns } from "~/lib/ads/aggregations";

describe("ads data source stubs", () => {
  it("returns deterministic meta and google campaigns", () => {
    const meta = fetchMetaCampaigns();
    const google = fetchGoogleCampaigns();

    expect(meta.length).toBeGreaterThan(0);
    expect(google.length).toBeGreaterThan(0);

    // Shape assertions
    for (const c of [...meta, ...google]) {
      expect(typeof c.spend).toBe("number");
      expect(typeof c.clicks).toBe("number");
      expect(typeof c.conversions).toBe("number");
      expect(typeof c.revenue).toBe("number");
    }
  });

  it("aggregations operate on stubs without errors", () => {
    const meta = fetchMetaCampaigns();
    const google = fetchGoogleCampaigns();
    const agg = aggregateCampaigns([...meta, ...google]);

    expect(agg.totals.spend).toBeGreaterThan(0);
    expect(agg.roas).toBeGreaterThanOrEqual(0);
  });
});
