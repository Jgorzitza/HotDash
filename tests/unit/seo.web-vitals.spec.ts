import { describe, it, expect } from "vitest";
import { normalizeVitals } from "../../app/lib/seo/vitals";

describe("SEO Web Vitals Adapter", () => {
  it("normalizes values and thresholds", () => {
    const res = normalizeVitals({ LCP: 2300, FID: 120, CLS: 0.05 }, "mobile");
    const byMetric = Object.fromEntries(res.map((r) => [r.metric, r]));
    expect(byMetric.LCP.passes).toBe(true);
    expect(byMetric.FID.passes).toBe(false);
    expect(byMetric.CLS.passes).toBe(true);
  });
});
