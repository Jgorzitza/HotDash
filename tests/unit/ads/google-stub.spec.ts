/**
 * Google Ads Stub Tests
 */

import { describe, it, expect } from "vitest";
import {
  fetchGoogleCampaigns,
  fetchGoogleCampaignMetrics,
  createGoogleCampaign,
  checkGoogleAdsHealth,
  AdPlatform,
} from "~/lib/ads";

describe("Google Ads Stub", () => {
  it("fetches mock campaigns", async () => {
    const campaigns = await fetchGoogleCampaigns();

    expect(campaigns).toHaveLength(2);
    expect(campaigns[0].platform).toBe(AdPlatform.GOOGLE);
    expect(campaigns[0].googleCampaignId).toBeDefined();
  });

  it("fetches campaign metrics by ID", async () => {
    const metrics = await fetchGoogleCampaignMetrics("12345678901");

    expect(metrics.roas).toBe(6.0);
    expect(metrics.spend).toBe(2800);
  });

  it("throws error for unknown campaign", async () => {
    await expect(fetchGoogleCampaignMetrics("unknown")).rejects.toThrow(
      "not found",
    );
  });

  it("creates new campaign in stub mode", async () => {
    const newCampaign = await createGoogleCampaign({
      name: "New Search Campaign",
      dailyBudget: 200,
      campaignType: "SEARCH",
    });

    expect(newCampaign.name).toBe("New Search Campaign");
    expect(newCampaign.platform).toBe(AdPlatform.GOOGLE);
    expect(newCampaign.campaignType).toBe("SEARCH");
  });

  it("health check returns stub mode", async () => {
    const health = await checkGoogleAdsHealth();

    expect(health.status).toBe("ok");
    expect(health.mode).toBe("stub");
  });
});
