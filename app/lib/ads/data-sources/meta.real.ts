/**
 * Meta Ads Real Implementation
 *
 * Production-ready Meta/Facebook Ads API integration
 *
 * @module app/lib/ads/data-sources/meta.real
 */

import type { MetaCampaign, CampaignMetrics } from "../types";
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
 * Fetch campaigns from Meta API
 *
 * @param adAccountId - Meta ad account ID
 * @returns Array of Meta campaigns
 */
export async function fetchMetaCampaignsReal(
  adAccountId?: string,
): Promise<MetaCampaign[]> {
  const accountId = adAccountId || AdsConfig.meta.adAccountId;

  if (!AdsConfig.meta.accessToken) {
    throw new Error("META_ACCESS_TOKEN not configured");
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/campaigns?fields=id,name,objective,status,daily_budget,lifetime_budget,created_time,updated_time`,
    {
      headers: {
        Authorization: `Bearer ${AdsConfig.meta.accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Meta API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  // Transform Meta response to our Campaign type
  return Promise.all(
    data.data.map(async (metaCampaign: any) => {
      const metrics = await fetchMetaCampaignMetricsReal(metaCampaign.id);
      return transformMetaCampaign(metaCampaign, metrics, accountId);
    }),
  );
}

/**
 * Fetch campaign insights from Meta API
 */
export async function fetchMetaCampaignMetricsReal(
  campaignId: string,
): Promise<CampaignMetrics> {
  if (!AdsConfig.meta.accessToken) {
    throw new Error("META_ACCESS_TOKEN not configured");
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${campaignId}/insights?fields=spend,impressions,clicks,actions,purchase_roas&time_range={"since":"2025-06-01","until":"2025-06-15"}`,
    {
      headers: {
        Authorization: `Bearer ${AdsConfig.meta.accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Meta API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  const insights = data.data[0] || {};

  // Extract metrics
  const spend = parseFloat(insights.spend || "0");
  const impressions = parseInt(insights.impressions || "0", 10);
  const clicks = parseInt(insights.clicks || "0", 10);

  // Find purchase action
  const purchaseAction = (insights.actions || []).find(
    (a: any) => a.action_type === "omni_purchase",
  );
  const conversions = parseInt(purchaseAction?.value || "0", 10);
  const revenue = parseFloat(insights.purchase_roas?.[0]?.value || "0") * spend;

  return {
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
}

/**
 * Transform Meta API response to our Campaign type
 */
function transformMetaCampaign(
  metaData: any,
  metrics: CampaignMetrics,
  accountId: string,
): MetaCampaign {
  return {
    id: `meta-${metaData.id}`,
    name: metaData.name,
    platform: AdPlatform.META,
    status: mapMetaStatus(metaData.status),
    startDate: metaData.created_time,
    dailyBudget: parseFloat(metaData.daily_budget || "0") / 100,
    totalBudget: parseFloat(metaData.lifetime_budget || "0") / 100,
    metrics,
    createdAt: metaData.created_time,
    updatedAt: metaData.updated_time,
    metaCampaignId: metaData.id,
    adAccountId: accountId,
    objective: metaData.objective || "CONVERSIONS",
    audienceIds: [],
    placements: [],
  };
}

/**
 * Map Meta campaign status to our enum
 */
function mapMetaStatus(status: string): CampaignStatus {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return CampaignStatus.ACTIVE;
    case "PAUSED":
      return CampaignStatus.PAUSED;
    case "DELETED":
    case "ARCHIVED":
      return CampaignStatus.ENDED;
    default:
      return CampaignStatus.DRAFT;
  }
}
