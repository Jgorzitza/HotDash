/**
 * ROI Tracking Service
 * 
 * ADS-005: Enhanced ROI tracking and attribution for ad campaigns
 * Tracks revenue attribution, customer lifetime value, and multi-touch attribution
 */

import type { CampaignPerformance } from './types';
import { calculateROAS } from '~/lib/ads/metrics';

/**
 * ROI Attribution Model
 */
export type AttributionModel = 'last_click' | 'first_click' | 'linear' | 'time_decay' | 'position_based';

/**
 * Customer Journey Touchpoint
 */
export interface Touchpoint {
  campaignId: string;
  campaignName: string;
  timestamp: string;
  channel: 'google_ads' | 'facebook_ads' | 'organic' | 'direct' | 'email';
  costCents: number;
  position: number; // Position in customer journey (1 = first, N = last)
}

/**
 * Customer Conversion
 */
export interface Conversion {
  conversionId: string;
  customerId: string;
  revenueCents: number;
  timestamp: string;
  touchpoints: Touchpoint[];
}

/**
 * ROI Attribution Result
 */
export interface ROIAttribution {
  campaignId: string;
  campaignName: string;
  attributedRevenueCents: number;
  attributedConversions: number;
  totalCostCents: number;
  roas: number;
  attributionModel: AttributionModel;
}

/**
 * Customer Lifetime Value Metrics
 */
export interface CLVMetrics {
  campaignId: string;
  campaignName: string;
  averageCLV: number; // in cents
  customerCount: number;
  repeatPurchaseRate: number; // 0-1
  averageOrderValue: number; // in cents
  purchaseFrequency: number; // purchases per customer
  projectedLTV: number; // in cents
}

/**
 * ROI Tracking Summary
 */
export interface ROITrackingSummary {
  totalRevenueCents: number;
  totalCostCents: number;
  overallROAS: number;
  attributionBreakdown: ROIAttribution[];
  clvMetrics: CLVMetrics[];
  topPerformingCampaigns: Array<{
    campaignId: string;
    campaignName: string;
    roas: number;
    revenueCents: number;
  }>;
  insights: string[];
}

/**
 * Calculate ROI attribution using specified model
 * 
 * @param conversions - Array of customer conversions with touchpoints
 * @param model - Attribution model to use
 * @returns Array of ROI attributions per campaign
 */
export function calculateROIAttribution(
  conversions: Conversion[],
  model: AttributionModel = 'last_click'
): ROIAttribution[] {
  const attributionMap = new Map<string, {
    campaignName: string;
    revenueCents: number;
    conversions: number;
    costCents: number;
  }>();

  for (const conversion of conversions) {
    const touchpoints = conversion.touchpoints;
    if (touchpoints.length === 0) continue;

    // Calculate attribution weights based on model
    const weights = calculateAttributionWeights(touchpoints, model);

    // Distribute revenue according to weights
    touchpoints.forEach((touchpoint, index) => {
      const weight = weights[index];
      const attributedRevenue = Math.round(conversion.revenueCents * weight);

      const existing = attributionMap.get(touchpoint.campaignId) || {
        campaignName: touchpoint.campaignName,
        revenueCents: 0,
        conversions: 0,
        costCents: 0,
      };

      attributionMap.set(touchpoint.campaignId, {
        campaignName: existing.campaignName,
        revenueCents: existing.revenueCents + attributedRevenue,
        conversions: existing.conversions + weight, // Fractional conversions
        costCents: existing.costCents + touchpoint.costCents,
      });
    });
  }

  // Convert map to array of ROI attributions
  const attributions: ROIAttribution[] = [];
  attributionMap.forEach((data, campaignId) => {
    const roas = calculateROAS(data.revenueCents, data.costCents) || 0;
    attributions.push({
      campaignId,
      campaignName: data.campaignName,
      attributedRevenueCents: data.revenueCents,
      attributedConversions: data.conversions,
      totalCostCents: data.costCents,
      roas,
      attributionModel: model,
    });
  });

  return attributions.sort((a, b) => b.roas - a.roas);
}

/**
 * Calculate attribution weights based on model
 */
function calculateAttributionWeights(
  touchpoints: Touchpoint[],
  model: AttributionModel
): number[] {
  const count = touchpoints.length;
  
  switch (model) {
    case 'last_click':
      // 100% credit to last touchpoint
      return touchpoints.map((_, i) => i === count - 1 ? 1 : 0);
    
    case 'first_click':
      // 100% credit to first touchpoint
      return touchpoints.map((_, i) => i === 0 ? 1 : 0);
    
    case 'linear':
      // Equal credit to all touchpoints
      return touchpoints.map(() => 1 / count);
    
    case 'time_decay':
      // More credit to recent touchpoints (exponential decay)
      const decayFactor = 0.5;
      const weights = touchpoints.map((_, i) => Math.pow(decayFactor, count - 1 - i));
      const sum = weights.reduce((a, b) => a + b, 0);
      return weights.map(w => w / sum);
    
    case 'position_based':
      // 40% first, 40% last, 20% distributed to middle
      if (count === 1) return [1];
      if (count === 2) return [0.5, 0.5];
      
      const middleWeight = 0.2 / (count - 2);
      return touchpoints.map((_, i) => {
        if (i === 0) return 0.4;
        if (i === count - 1) return 0.4;
        return middleWeight;
      });
    
    default:
      return touchpoints.map(() => 1 / count);
  }
}

/**
 * Calculate Customer Lifetime Value metrics
 * 
 * @param campaignId - Campaign ID to analyze
 * @param customerData - Customer purchase history
 * @returns CLV metrics for the campaign
 */
export function calculateCLVMetrics(
  campaignId: string,
  campaignName: string,
  customerData: Array<{
    customerId: string;
    purchases: Array<{
      revenueCents: number;
      timestamp: string;
    }>;
  }>
): CLVMetrics {
  const customerCount = customerData.length;
  
  if (customerCount === 0) {
    return {
      campaignId,
      campaignName,
      averageCLV: 0,
      customerCount: 0,
      repeatPurchaseRate: 0,
      averageOrderValue: 0,
      purchaseFrequency: 0,
      projectedLTV: 0,
    };
  }

  // Calculate metrics
  let totalRevenue = 0;
  let totalPurchases = 0;
  let customersWithRepeatPurchases = 0;

  for (const customer of customerData) {
    const purchases = customer.purchases;
    totalPurchases += purchases.length;
    totalRevenue += purchases.reduce((sum, p) => sum + p.revenueCents, 0);
    
    if (purchases.length > 1) {
      customersWithRepeatPurchases++;
    }
  }

  const averageCLV = Math.round(totalRevenue / customerCount);
  const repeatPurchaseRate = customersWithRepeatPurchases / customerCount;
  const averageOrderValue = totalPurchases > 0 ? Math.round(totalRevenue / totalPurchases) : 0;
  const purchaseFrequency = totalPurchases / customerCount;

  // Project lifetime value (simple model: current CLV * (1 + repeat rate))
  const projectedLTV = Math.round(averageCLV * (1 + repeatPurchaseRate));

  return {
    campaignId,
    campaignName,
    averageCLV,
    customerCount,
    repeatPurchaseRate,
    averageOrderValue,
    purchaseFrequency,
    projectedLTV,
  };
}

/**
 * Generate comprehensive ROI tracking summary
 * 
 * @param conversions - Customer conversions with touchpoints
 * @param customerData - Customer purchase history by campaign
 * @param model - Attribution model to use
 * @returns Complete ROI tracking summary
 */
export function generateROITrackingSummary(
  conversions: Conversion[],
  customerData: Map<string, Array<{
    customerId: string;
    purchases: Array<{
      revenueCents: number;
      timestamp: string;
    }>;
  }>>,
  model: AttributionModel = 'last_click'
): ROITrackingSummary {
  // Calculate attribution
  const attributionBreakdown = calculateROIAttribution(conversions, model);

  // Calculate CLV metrics for each campaign
  const clvMetrics: CLVMetrics[] = [];
  customerData.forEach((customers, campaignId) => {
    const attribution = attributionBreakdown.find(a => a.campaignId === campaignId);
    const campaignName = attribution?.campaignName || campaignId;
    clvMetrics.push(calculateCLVMetrics(campaignId, campaignName, customers));
  });

  // Calculate totals
  const totalRevenueCents = attributionBreakdown.reduce((sum, a) => sum + a.attributedRevenueCents, 0);
  const totalCostCents = attributionBreakdown.reduce((sum, a) => sum + a.totalCostCents, 0);
  const overallROAS = calculateROAS(totalRevenueCents, totalCostCents) || 0;

  // Identify top performers
  const topPerformingCampaigns = attributionBreakdown
    .slice(0, 5)
    .map(a => ({
      campaignId: a.campaignId,
      campaignName: a.campaignName,
      roas: a.roas,
      revenueCents: a.attributedRevenueCents,
    }));

  // Generate insights
  const insights: string[] = [];
  
  if (overallROAS > 3.0) {
    insights.push(`Strong overall ROAS of ${overallROAS.toFixed(2)}x indicates healthy campaign performance.`);
  } else if (overallROAS < 2.0) {
    insights.push(`Overall ROAS of ${overallROAS.toFixed(2)}x is below target. Consider optimizing underperforming campaigns.`);
  }

  const avgRepeatRate = clvMetrics.reduce((sum, m) => sum + m.repeatPurchaseRate, 0) / Math.max(clvMetrics.length, 1);
  if (avgRepeatRate > 0.3) {
    insights.push(`High repeat purchase rate (${(avgRepeatRate * 100).toFixed(1)}%) indicates strong customer retention.`);
  }

  if (topPerformingCampaigns.length > 0) {
    const topCampaign = topPerformingCampaigns[0];
    insights.push(`Top campaign "${topCampaign.campaignName}" achieving ${topCampaign.roas.toFixed(2)}x ROAS.`);
  }

  return {
    totalRevenueCents,
    totalCostCents,
    overallROAS,
    attributionBreakdown,
    clvMetrics,
    topPerformingCampaigns,
    insights,
  };
}

