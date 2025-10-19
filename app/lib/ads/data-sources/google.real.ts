/**
 * Google Ads Real Implementation
 *
 * Production-ready Google Ads API integration
 *
 * @module app/lib/ads/data-sources/google.real
 */

import type { GoogleCampaign, CampaignMetrics } from "../types";
import { AdPlatform, CampaignStatus } from "../types";
import {
  calculateROAS,
  calculateCPC,
  calculateCPA,
  calculateCTR,
  calculateConversionRate,
} from "../metrics";
import { AdsConfig } from "~/config/ads.server";

/**
 * Get OAuth access token from refresh token
 */
async function getAccessToken(): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: AdsConfig.google.clientId,
      client_secret: AdsConfig.google.clientSecret,
      refresh_token: AdsConfig.google.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Google Ads access token");
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Fetch campaigns from Google Ads API
 */
export async function fetchGoogleCampaignsReal(
  customerId?: string,
): Promise<GoogleCampaign[]> {
  const customer = customerId || AdsConfig.google.customerId;
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://googleads.googleapis.com/v15/customers/${customer}/googleAds:searchStream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": AdsConfig.google.developerToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          SELECT 
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.bidding_strategy_type,
            campaign.advertising_channel_type,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.conversions_value
          FROM campaign
          WHERE campaign.status != 'REMOVED'
        `,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Google Ads API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  return data.results.map((result: any) =>
    transformGoogleCampaign(result, customer),
  );
}

/**
 * Transform Google Ads response to our Campaign type
 */
function transformGoogleCampaign(
  result: any,
  customerId: string,
): GoogleCampaign {
  const campaign = result.campaign;
  const metrics = result.metrics;

  const spend = parseInt(metrics.cost_micros || "0", 10) / 1000000;
  const revenue = parseFloat(metrics.conversions_value || "0");
  const impressions = parseInt(metrics.impressions || "0", 10);
  const clicks = parseInt(metrics.clicks || "0", 10);
  const conversions = parseFloat(metrics.conversions || "0");

  const calculatedMetrics: CampaignMetrics = {
    spend,
    revenue,
    impressions,
    clicks,
    conversions,
    roas: calculateROAS(revenue, spend),
    cpc: calculateCPC(spend, clicks),
    cpa: calculateCPA(spend, conversions),
    ctr: calculateCTR(clicks, impressions),
    conversionRate: calculateConversionRate(conversions, clicks),
  };

  return {
    id: `google-${campaign.id}`,
    name: campaign.name,
    platform: AdPlatform.GOOGLE,
    status: mapGoogleStatus(campaign.status),
    startDate: new Date().toISOString(),
    dailyBudget: 0,
    totalBudget: 0,
    metrics: calculatedMetrics,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    googleCampaignId: campaign.id,
    customerId,
    campaignType: campaign.advertising_channel_type || "SEARCH",
    biddingStrategy: campaign.bidding_strategy_type || "UNKNOWN",
    keywords: [],
  };
}

/**
 * Map Google Ads status to our enum
 */
function mapGoogleStatus(status: string): CampaignStatus {
  switch (status) {
    case "ENABLED":
      return CampaignStatus.ACTIVE;
    case "PAUSED":
      return CampaignStatus.PAUSED;
    case "REMOVED":
      return CampaignStatus.ENDED;
    default:
      return CampaignStatus.DRAFT;
  }
}
