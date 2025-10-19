/**
 * Meta Stub Tests
 */

import { describe, it, expect } from "vitest";
import {
  fetchMetaCampaigns,
  fetchMetaCampaignMetrics,
  createMetaCampaign,
  checkMetaHealth,
  AdPlatform,
} from "~/lib/ads";

describe("Meta Stub", () => {
  it("fetches mock campaigns", async () => {
    const campaigns = await fetchMetaCampaigns();

    expect(campaigns).toHaveLength(2);
    expect(campaigns[0].platform).toBe(AdPlatform.META);
    expect(campaigns[0].metaCampaignId).toBeDefined();
  });

  it("fetches campaign metrics by ID", async () => {
    const metrics = await fetchMetaCampaignMetrics("23849567123456789");

    expect(metrics.roas).toBe(4.5);
    expect(metrics.spend).toBe(2100);
  });

  it("throws error for unknown campaign", async () => {
    await expect(fetchMetaCampaignMetrics("unknown")).rejects.toThrow(
      "not found",
    );
  });

  it("creates new campaign in stub mode", async () => {
    const newCampaign = await createMetaCampaign({
      name: "New Test Campaign",
      dailyBudget: 150,
    });

    expect(newCampaign.name).toBe("New Test Campaign");
    expect(newCampaign.platform).toBe(AdPlatform.META);
    expect(newCampaign.dailyBudget).toBe(150);
  });

  it("health check returns stub mode", async () => {
    const health = await checkMetaHealth();

    expect(health.status).toBe("ok");
    expect(health.mode).toBe("stub");
  });
});
