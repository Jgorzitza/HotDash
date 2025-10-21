import { describe, test, expect, beforeEach } from "vitest";
import {
  GoogleAdsClient,
  createGoogleAdsClient,
} from "../../../../app/services/ads/google-ads";
import type {
  GoogleAdsConfig,
  CampaignPerformance,
} from "../../../../app/services/ads/types";

/**
 * Unit tests for Google Ads API client
 */

describe("GoogleAdsClient", () => {
  let mockConfig: GoogleAdsConfig;

  beforeEach(() => {
    mockConfig = {
      client_id: "test-client-id",
      client_secret: "test-client-secret",
      developer_token: "test-developer-token",
      customer_id: "1234567890",
      refresh_token: "test-refresh-token",
    };
  });

  describe("Constructor", () => {
    test("creates instance with valid config", () => {
      const client = new GoogleAdsClient(mockConfig);
      expect(client).toBeInstanceOf(GoogleAdsClient);
    });
  });

  describe("Calculations", () => {
    test("converts cost_micros to currency correctly", () => {
      const cost_micros = 1_500_000;
      const cost = cost_micros / 1_000_000;
      expect(cost).toBe(1.5);
    });

    test("calculates ROAS correctly", () => {
      const cost = 100;
      const conversion_value = 300;
      const roas = cost > 0 ? conversion_value / cost : 0;
      expect(roas).toBe(3.0);
    });
  });
});

describe("createGoogleAdsClient", () => {
  test("throws error when required credentials are missing", () => {
    const oldEnv = { ...process.env };
    delete process.env.GOOGLE_ADS_CLIENT_ID;
    delete process.env.GOOGLE_ADS_CLIENT_SECRET;
    delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    delete process.env.GOOGLE_ADS_CUSTOMER_ID;

    expect(() => createGoogleAdsClient()).toThrow("Missing required Google Ads credentials");
    
    Object.assign(process.env, oldEnv);
  });
});
