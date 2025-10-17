import { describe, it, expect } from "vitest";
import { buildPublerPlan } from "~/lib/ads/publer";
import { fetchMetaCampaigns } from "~/lib/ads/sources/meta";
import { fetchGoogleCampaigns } from "~/lib/ads/sources/google";

describe("publer plan builder (HITL-only)", () => {
  it("creates deterministic posts per campaign with schedule and content", () => {
    const meta = fetchMetaCampaigns();
    const google = fetchGoogleCampaigns();
    const fixedDate = new Date(Date.UTC(2025, 9, 18, 14, 0, 0));

    const plan = buildPublerPlan(meta, google, fixedDate);

    // total posts equals total campaigns
    expect(plan.length).toBe(meta.length + google.length);

    for (const post of plan) {
      expect(["meta", "google"]).toContain(post.platform);
      expect(typeof post.content).toBe("string");
      expect(post.scheduleISO).toBe(fixedDate.toISOString());
      expect(post.budgetAllocation).toBeGreaterThanOrEqual(0);
    }
  });
});
