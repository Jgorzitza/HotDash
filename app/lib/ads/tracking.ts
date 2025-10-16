/**
 * Ads Performance Tracking
 * 
 * Purpose: Track advertising performance metrics across multiple platforms
 * Owner: ads agent
 * Date: 2025-10-15
 */

export type AdPlatform = 'meta' | 'google' | 'tiktok';
export type CampaignStatus = 'active' | 'paused' | 'completed';

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  platform: AdPlatform;
  status: CampaignStatus;
  adSpend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  dateStart: string;
  dateEnd: string;
}

export interface PerformanceMetrics {
  roas: number;
  cpc: number;
  cpm: number;
  cpa: number;
  ctr: number;
  conversionRate: number;
}

export interface CampaignPerformance extends CampaignMetrics, PerformanceMetrics {
  calculatedAt: string;
}

export interface AggregatedPerformance {
  totalCampaigns: number;
  totalAdSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  aggregatedRoas: number;
  averageCpc: number;
  averageCpm: number;
  averageCpa: number;
  aggregatedCtr: number;
  aggregatedConversionRate: number;
  byPlatform: Record<AdPlatform, {
    campaigns: number;
    adSpend: number;
    revenue: number;
    roas: number;
    cpc: number;
    cpm: number;
    cpa: number;
    ctr: number;
    conversionRate: number;
  }>;
  dateStart: string;
  dateEnd: string;
  calculatedAt: string;
}

export function calculateRoas(revenue: number, adSpend: number): number {
  if (adSpend <= 0) return 0;
  return revenue / adSpend;
}

export function calculateCpc(adSpend: number, clicks: number): number {
  if (clicks <= 0) return 0;
  return adSpend / clicks;
}

export function calculateCpm(adSpend: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return (adSpend / impressions) * 1000;
}

export function calculateCpa(adSpend: number, conversions: number): number {
  if (conversions <= 0) return 0;
  return adSpend / conversions;
}

export function calculateCtr(clicks: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return (clicks / impressions) * 100;
}

export function calculateConversionRate(conversions: number, clicks: number): number {
  if (clicks <= 0) return 0;
  return (conversions / clicks) * 100;
}

export function calculateCampaignPerformance(metrics: CampaignMetrics): CampaignPerformance {
  return {
    ...metrics,
    roas: calculateRoas(metrics.revenue, metrics.adSpend),
    cpc: calculateCpc(metrics.adSpend, metrics.clicks),
    cpm: calculateCpm(metrics.adSpend, metrics.impressions),
    cpa: calculateCpa(metrics.adSpend, metrics.conversions),
    ctr: calculateCtr(metrics.clicks, metrics.impressions),
    conversionRate: calculateConversionRate(metrics.conversions, metrics.clicks),
    calculatedAt: new Date().toISOString(),
  };
}

export function aggregateCampaignPerformance(campaigns: CampaignMetrics[]): AggregatedPerformance {
  if (campaigns.length === 0) throw new Error('Cannot aggregate empty campaign list');

  const totalAdSpend = campaigns.reduce((sum, c) => sum + c.adSpend, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

  const byPlatform: AggregatedPerformance['byPlatform'] = {} as any;
  const platforms: AdPlatform[] = ['meta', 'google', 'tiktok'];

  for (const platform of platforms) {
    const platformCampaigns = campaigns.filter(c => c.platform === platform);
    if (platformCampaigns.length === 0) continue;

    const platformAdSpend = platformCampaigns.reduce((sum, c) => sum + c.adSpend, 0);
    const platformRevenue = platformCampaigns.reduce((sum, c) => sum + c.revenue, 0);
    const platformImpressions = platformCampaigns.reduce((sum, c) => sum + c.impressions, 0);
    const platformClicks = platformCampaigns.reduce((sum, c) => sum + c.clicks, 0);
    const platformConversions = platformCampaigns.reduce((sum, c) => sum + c.conversions, 0);

    byPlatform[platform] = {
      campaigns: platformCampaigns.length,
      adSpend: platformAdSpend,
      revenue: platformRevenue,
      roas: calculateRoas(platformRevenue, platformAdSpend),
      cpc: calculateCpc(platformAdSpend, platformClicks),
      cpm: calculateCpm(platformAdSpend, platformImpressions),
      cpa: calculateCpa(platformAdSpend, platformConversions),
      ctr: calculateCtr(platformClicks, platformImpressions),
      conversionRate: calculateConversionRate(platformConversions, platformClicks),
    };
  }

  const dates = campaigns.flatMap(c => [c.dateStart, c.dateEnd]);

  return {
    totalCampaigns: campaigns.length,
    totalAdSpend,
    totalRevenue,
    totalImpressions,
    totalClicks,
    totalConversions,
    aggregatedRoas: calculateRoas(totalRevenue, totalAdSpend),
    averageCpc: calculateCpc(totalAdSpend, totalClicks),
    averageCpm: calculateCpm(totalAdSpend, totalImpressions),
    averageCpa: calculateCpa(totalAdSpend, totalConversions),
    aggregatedCtr: calculateCtr(totalClicks, totalImpressions),
    aggregatedConversionRate: calculateConversionRate(totalConversions, totalClicks),
    byPlatform,
    dateStart: dates.sort()[0],
    dateEnd: dates.sort().reverse()[0],
    calculatedAt: new Date().toISOString(),
  };
}

