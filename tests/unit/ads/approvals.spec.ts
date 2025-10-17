import { describe, it, expect } from "vitest";
import { aggregateCampaigns } from "~/lib/ads/aggregations";
import {
  buildEvidence,
  validateEvidence,
  type AdsApprovalEvidence,
} from "~/lib/ads/approvals";

describe("ads approvals evidence", () => {
  it("builds evidence with deltas and rollback defaults", () => {
    const before = aggregateCampaigns([
      { spend: 100, clicks: 50, conversions: 10, revenue: 200 },
    ]);
    const after = aggregateCampaigns([
      { spend: 150, clicks: 60, conversions: 12, revenue: 360 },
    ]);

    const ev = buildEvidence(before, after);

    expect(ev.kind).toBe("ads-metrics-change");
    expect(ev.delta.roasDelta).toBeCloseTo(after.roas - before.roas, 5);
    expect(ev.rollback.flags.length).toBeGreaterThan(0);
    expect(typeof ev.rollback.instructions).toBe("string");
  });

  it("validates evidence shape", () => {
    const before = aggregateCampaigns([
      { spend: 0, clicks: 0, conversions: 0, revenue: 0 },
    ]);
    const after = aggregateCampaigns([
      { spend: 0, clicks: 0, conversions: 0, revenue: 0 },
    ]);

    const ev = buildEvidence(before, after, {
      risk: "low",
      risksNoted: ["test"],
    });
    expect(validateEvidence(ev)).toBe(true);

    const bad: Partial<AdsApprovalEvidence> = {
      kind: "ads-metrics-change" as const,
    };
    expect(validateEvidence(bad)).toBe(false);
  });
});
