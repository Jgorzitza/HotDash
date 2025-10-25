import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import {
  GoogleAdsClient,
  createGoogleAdsClient,
} from "../../../../app/services/ads/google-ads-client";
import type { GoogleAdsConfig } from "../../../../app/services/ads/types";

/**
 * Unit tests for Google Ads API client
 */

describe("GoogleAdsClient", () => {
  let mockConfig: GoogleAdsConfig;
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockConfig = {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      developerToken: "test-developer-token",
      refreshToken: "test-refresh-token",
      customerIds: ["1234567890"],
    };
  });

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    } else {
      delete global.fetch;
    }
    vi.restoreAllMocks();
  });

  it("creates instance with valid config", () => {
    const client = new GoogleAdsClient(mockConfig);
    expect(client).toBeInstanceOf(GoogleAdsClient);
  });

  it("returns fallback campaigns when API responds with 410", async () => {
    const client = new GoogleAdsClient(mockConfig);
    (client as unknown as { accessToken: string }).accessToken = "token";
    (client as unknown as { tokenExpiry: number }).tokenExpiry =
      Date.now() + 5 * 60 * 1000;

    global.fetch = vi.fn().mockResolvedValue({
      status: 410,
      ok: false,
      json: async () => ({ results: [] }),
    });

    const campaigns = await client.getCampaigns(["1234567890"]);

    expect(global.fetch).toHaveBeenCalled();
    expect(campaigns.length).toBeGreaterThan(0);
    expect(campaigns[0]?.customerId).toBe("1234567890");
  });

  it("maps campaign performance results when API succeeds", async () => {
    const client = new GoogleAdsClient(mockConfig);
    (client as unknown as { accessToken: string }).accessToken = "token";
    (client as unknown as { tokenExpiry: number }).tokenExpiry =
      Date.now() + 5 * 60 * 1000;

    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        results: [
          {
            campaign: { id: "cmp1", name: "Test" },
            metrics: {
              impressions: 1000,
              clicks: 100,
              costMicros: 2_500_000,
              conversions: 10,
              conversionsValue: 12_000_000,
              ctr: 0.1,
              averageCpc: 25_000,
            },
          },
        ],
      }),
    });

    const performance = await client.getCampaignPerformance([
      "1234567890",
    ]);

    expect(performance).toHaveLength(1);
    expect(performance[0]?.campaignId).toBe("cmp1");
    expect(performance[0]?.costCents).toBe(250);
    expect(performance[0]?.avgCpcCents).toBe(3);
  });
});

describe("createGoogleAdsClient", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws error when required credentials are missing", () => {
    delete process.env.GOOGLE_ADS_CLIENT_ID;
    delete process.env.GOOGLE_ADS_CLIENT_SECRET;
    delete process.env.GOOGLE_ADS_REFRESH_TOKEN;
    delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    delete process.env.GOOGLE_ADS_CUSTOMER_IDS;

    expect(() => createGoogleAdsClient()).toThrow(
      "Missing required Google Ads API credentials. Check environment variables.",
    );
  });
});
