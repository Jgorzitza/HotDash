/**
 * Campaign Service Tests
 */

import { describe, it, expect } from "vitest";
import {
  listCampaigns,
  getCampaignById,
  getUnderperformingCampaigns,
  getTopPerformingCampaigns,
} from "~/services/ads/campaign.service";

describe("Campaign Service", () => {
  it("lists campaigns with default pagination", async () => {
    const result = await listCampaigns();

    expect(result).toHaveProperty("campaigns");
    expect(result).toHaveProperty("totalCount");
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("filters campaigns by platform", async () => {
    const result = await listCampaigns({ platform: "meta" as any });

    result.campaigns.forEach((campaign) => {
      expect(campaign.platform).toBe("meta");
    });
  });

  it("sorts campaigns by ROAS", async () => {
    const result = await listCampaigns(undefined, {
      field: "roas",
      direction: "desc",
    });

    if (result.campaigns.length > 1) {
      expect(result.campaigns[0].metrics.roas).toBeGreaterThanOrEqual(
        result.campaigns[1].metrics.roas,
      );
    }
  });

  it("gets campaign by ID", async () => {
    const campaign = await getCampaignById("meta-campaign-1");

    expect(campaign).toBeDefined();
    if (campaign) {
      expect(campaign.id).toBe("meta-campaign-1");
    }
  });

  it("identifies underperforming campaigns", async () => {
    const campaigns = await listCampaigns();
    const underperforming = getUnderperformingCampaigns(
      campaigns.campaigns,
      2.0,
    );

    underperforming.forEach((campaign) => {
      expect(campaign.metrics.roas).toBeLessThan(2.0);
    });
  });

  it("identifies top performing campaigns", async () => {
    const campaigns = await listCampaigns();
    const topPerforming = getTopPerformingCampaigns(campaigns.campaigns, 3);

    expect(topPerforming.length).toBeLessThanOrEqual(3);
    if (topPerforming.length > 1) {
      expect(topPerforming[0].metrics.roas).toBeGreaterThanOrEqual(
        topPerforming[1].metrics.roas,
      );
    }
  });
});
