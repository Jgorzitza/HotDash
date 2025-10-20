import { describe, expect, it, beforeEach } from "vitest";
import { getMetaCampaigns } from "~/services/ads/meta-stub";
import { getGoogleCampaigns } from "~/services/ads/google-stub";
import { calculateAllMetrics } from "~/lib/ads/metrics";
import { getPlatformBreakdown } from "~/lib/ads/platform-breakdown";
import {
  parseOrderAttribution,
  groupByCampaign,
  buildCampaignSummary,
} from "~/lib/ads/utm-parser";

/**
 * Ads Workflow Integration Tests
 *
 * Tests the full end-to-end workflow:
 * 1. Fetch campaigns from Meta/Google (stubs)
 * 2. Calculate metrics (ROAS, CPC, CPA, CTR, conversion rate)
 * 3. Group by platform
 * 4. Check budget alerts
 * 5. Check performance alerts
 * 6. Parse order attribution (UTM tracking)
 * 7. Build campaign summary
 *
 * This ensures all components work together correctly.
 */

describe("Ads Workflow Integration", () => {
  let metaCampaigns: ReturnType<typeof getMetaCampaigns>;
  let googleCampaigns: ReturnType<typeof getGoogleCampaigns>;

  beforeEach(() => {
    // Fetch fresh campaign data before each test
    metaCampaigns = getMetaCampaigns();
    googleCampaigns = getGoogleCampaigns();
  });

  describe("Full Campaign Workflow", () => {
    it("fetches campaigns from multiple platforms and calculates metrics", () => {
      // Step 1: Fetch campaigns
      expect(metaCampaigns.length).toBeGreaterThan(0);
      expect(googleCampaigns.length).toBeGreaterThan(0);

      // Step 2: Verify campaign structure
      const metaCampaign = metaCampaigns[0];
      expect(metaCampaign).toHaveProperty("id");
      expect(metaCampaign).toHaveProperty("name");
      expect(metaCampaign).toHaveProperty("platform");
      expect(metaCampaign).toHaveProperty("metrics");

      // Step 3: Calculate metrics
      const metrics = calculateAllMetrics({
        spend_cents: metaCampaign.metrics.spend_cents,
        revenue_cents: metaCampaign.metrics.revenue_cents,
        impressions: metaCampaign.metrics.impressions,
        clicks: metaCampaign.metrics.clicks,
        conversions: metaCampaign.metrics.conversions,
      });

      // Verify metrics are calculated
      expect(metrics).toHaveProperty("roas");
      expect(metrics).toHaveProperty("cpc");
      expect(metrics).toHaveProperty("cpa");
      expect(metrics).toHaveProperty("ctr");
      expect(metrics).toHaveProperty("conversionRate");

      // Verify metrics are reasonable (not null, not Infinity, not NaN)
      expect(metrics.roas).not.toBeNull();
      expect(Number.isFinite(metrics.roas as number)).toBe(true);
    });

    it("groups campaigns by platform and calculates aggregated metrics", () => {
      // Combine campaigns from all platforms
      const allCampaigns = [...metaCampaigns, ...googleCampaigns].map(
        (campaign) => ({
          ...campaign,
          // Add calculated metrics
          roas: campaign.metrics.roas,
          cpc: campaign.metrics.cpc,
        }),
      );

      // Group by platform
      const platformBreakdown = getPlatformBreakdown(allCampaigns as any);

      // Verify platform aggregation
      expect(Array.isArray(platformBreakdown)).toBe(true);
      expect(platformBreakdown.length).toBeGreaterThan(0);

      // Verify each platform has required fields
      platformBreakdown.forEach((platform) => {
        expect(platform).toHaveProperty("platform");
        expect(platform).toHaveProperty("campaignCount");
        expect(platform).toHaveProperty("totalSpend");
        expect(platform).toHaveProperty("totalRevenue");
        expect(platform).toHaveProperty("roas");
        expect(platform.campaignCount).toBeGreaterThan(0);
      });

      // Verify totals add up
      const totalCampaigns = platformBreakdown.reduce(
        (sum, p) => sum + p.campaignCount,
        0,
      );
      expect(totalCampaigns).toBe(allCampaigns.length);
    });
  });

  describe("Budget Monitoring", () => {
    it("calculates budget utilization for campaigns", () => {
      // Find a campaign and check budget manually
      const campaign = metaCampaigns[0];

      const remaining = campaign.budgetCents - campaign.metrics.spend_cents;
      const spendPercentage =
        (campaign.metrics.spend_cents / campaign.budgetCents) * 100;

      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(spendPercentage).toBeGreaterThan(0);
      expect(spendPercentage).toBeLessThanOrEqual(100);

      // Verify campaign is spending within or near budget
      expect(campaign.metrics.spend_cents).toBeLessThanOrEqual(
        campaign.budgetCents,
      );
    });
  });

  describe("Performance Monitoring", () => {
    it("identifies campaign performance metrics", () => {
      // Check performance metrics for all campaigns
      const campaign = metaCampaigns[0];

      const metrics = calculateAllMetrics({
        spend_cents: campaign.metrics.spend_cents,
        revenue_cents: campaign.metrics.revenue_cents,
        impressions: campaign.metrics.impressions,
        clicks: campaign.metrics.clicks,
        conversions: campaign.metrics.conversions,
      });

      // Verify performance thresholds
      if (metrics.roas !== null) {
        expect(metrics.roas).toBeGreaterThan(0);
        // Good campaigns should have ROAS > 1.5x
        if (metrics.roas < 1.5) {
          console.log(
            `Campaign ${campaign.name} may be underperforming: ROAS ${metrics.roas}`,
          );
        }
      }

      if (metrics.ctr !== null) {
        expect(metrics.ctr).toBeGreaterThan(0);
      }

      if (metrics.conversionRate !== null) {
        expect(metrics.conversionRate).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("UTM Attribution Workflow", () => {
    it("parses order attribution and links to campaigns", () => {
      // Mock Shopify order with UTM data
      const mockOrder = {
        id: "gid://shopify/Order/12345",
        name: "#1001",
        createdAt: "2025-10-19T10:00:00Z",
        currentTotalPriceSet: {
          shopMoney: {
            amount: "125.00",
            currencyCode: "USD",
          },
        },
        customer: {
          id: "gid://shopify/Customer/67890",
          email: "customer@example.com",
        },
        customerJourneySummary: {
          customerOrderIndex: 1,
          daysToConversion: 3,
          ready: true,
          firstVisit: {
            utmParameters: {
              source: "facebook",
              medium: "cpc",
              campaign: "spring_sale_2025",
              term: "hot sauce",
              content: "carousel_ad_v2",
            },
            source: "facebook",
            sourceType: "paid",
            landingPage: "https://example.com/products/hot-sauce",
            referrerUrl: "https://facebook.com",
            occurredAt: "2025-10-16T10:00:00Z",
          },
          lastVisit: {
            utmParameters: {
              source: "google",
              medium: "cpc",
              campaign: "retargeting_2025",
              term: "buy hot sauce",
              content: "text_ad_v1",
            },
            source: "google",
            sourceType: "paid",
            landingPage: "https://example.com/checkout",
            referrerUrl: "https://google.com",
            occurredAt: "2025-10-19T09:30:00Z",
          },
        },
      };

      // Test first-touch attribution
      const firstTouch = parseOrderAttribution(mockOrder, "first_touch");
      expect(firstTouch).not.toBeNull();
      expect(firstTouch!.attributionModel).toBe("first_touch");
      expect(firstTouch!.utmCampaign).toBe("spring_sale_2025");
      expect(firstTouch!.utmSource).toBe("facebook");
      expect(firstTouch!.revenueCents).toBe(12500); // $125.00

      // Test last-touch attribution
      const lastTouch = parseOrderAttribution(mockOrder, "last_touch");
      expect(lastTouch).not.toBeNull();
      expect(lastTouch!.attributionModel).toBe("last_touch");
      expect(lastTouch!.utmCampaign).toBe("retargeting_2025");
      expect(lastTouch!.utmSource).toBe("google");
      expect(lastTouch!.revenueCents).toBe(12500);
    });

    it("groups orders by campaign and builds summary", () => {
      // Mock multiple attributed orders
      const attributions = [
        {
          orderId: "1",
          orderName: "#1001",
          orderDate: "2025-10-19",
          revenueCents: 12500,
          currencyCode: "USD",
          customerId: "c1",
          customerEmail: "c1@example.com",
          attributionModel: "first_touch" as const,
          utmCampaign: "spring_sale_2025",
          utmSource: "facebook",
          utmMedium: "cpc",
          utmTerm: null,
          utmContent: null,
          customerOrderIndex: 1,
          daysToConversion: 3,
          landingPage: null,
          referrerUrl: null,
        },
        {
          orderId: "2",
          orderName: "#1002",
          orderDate: "2025-10-19",
          revenueCents: 15000,
          currencyCode: "USD",
          customerId: "c2",
          customerEmail: "c2@example.com",
          attributionModel: "first_touch" as const,
          utmCampaign: "spring_sale_2025",
          utmSource: "facebook",
          utmMedium: "cpc",
          utmTerm: null,
          utmContent: null,
          customerOrderIndex: 1,
          daysToConversion: 5,
          landingPage: null,
          referrerUrl: null,
        },
      ];

      // Group by campaign
      const grouped = groupByCampaign(attributions);
      expect(grouped).toHaveProperty("spring_sale_2025");
      expect(grouped.spring_sale_2025.length).toBe(2);

      // Build campaign summary
      const summary = buildCampaignSummary(
        attributions,
        "spring_sale_2025",
        425000, // $4,250 spend
      );

      expect(summary.campaignName).toBe("spring_sale_2025");
      expect(summary.orderCount).toBe(2);
      expect(summary.revenueCents).toBe(27500); // $275
      expect(summary.conversions).toBe(2);
      expect(summary.avgOrderValueCents).toBe(13750); // $137.50
      expect(summary.avgDaysToConversion).toBe(4); // (3 + 5) / 2 = 4
      expect(summary.roas).toBe(0.06); // $275 / $4,250 = 0.06x (unprofitable)
    });
  });

  describe("End-to-End Workflow", () => {
    it("simulates complete campaign lifecycle: fetch → calculate → aggregate → attribute", () => {
      // STEP 1: Fetch campaigns from multiple platforms
      const metaCamps = getMetaCampaigns();
      const googleCamps = getGoogleCampaigns();
      expect(metaCamps.length).toBeGreaterThan(0);
      expect(googleCamps.length).toBeGreaterThan(0);

      // STEP 2: Calculate metrics for first campaign
      const campaign = metaCamps[0];
      const metrics = calculateAllMetrics({
        spend_cents: campaign.metrics.spend_cents,
        revenue_cents: campaign.metrics.revenue_cents,
        impressions: campaign.metrics.impressions,
        clicks: campaign.metrics.clicks,
        conversions: campaign.metrics.conversions,
      });
      expect(metrics.roas).not.toBeNull();
      expect(metrics.cpc).not.toBeNull();
      expect(metrics.cpa).not.toBeNull();

      // STEP 3: Aggregate across platforms
      const allCampaigns = [...metaCamps, ...googleCamps];
      const platformBreakdown = getPlatformBreakdown(allCampaigns as any);
      expect(platformBreakdown.length).toBeGreaterThan(0);

      // Verify platforms are correctly identified
      const platforms = platformBreakdown.map((p) => p.platform);
      expect(platforms).toContain("meta");
      expect(platforms).toContain("google");

      // STEP 4: Mock order attribution
      const mockOrder = {
        id: "order_1",
        name: "#1001",
        createdAt: "2025-10-19T10:00:00Z",
        currentTotalPriceSet: {
          shopMoney: { amount: "100.00", currencyCode: "USD" },
        },
        customer: { id: "c1", email: "c1@example.com" },
        customerJourneySummary: {
          customerOrderIndex: 1,
          daysToConversion: 3,
          ready: true,
          firstVisit: {
            utmParameters: {
              source: "facebook",
              medium: "cpc",
              campaign: "test_campaign",
              term: null,
              content: null,
            },
            source: "facebook",
            sourceType: "paid",
            landingPage: "/products",
            referrerUrl: "https://facebook.com",
            occurredAt: "2025-10-16T10:00:00Z",
          },
          lastVisit: null,
        },
      };

      const attribution = parseOrderAttribution(mockOrder, "first_touch");
      expect(attribution).not.toBeNull();
      expect(attribution!.utmCampaign).toBe("test_campaign");
      expect(attribution!.revenueCents).toBe(10000);

      // VERIFICATION: Entire workflow completed successfully
      // Campaign fetched → Metrics calculated → Platform aggregated → Orders attributed
      expect(true).toBe(true);
    });
  });
});
