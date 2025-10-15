/**
 * Ads Performance Tracking Service
 * 
 * Purpose: Calculate and track advertising performance metrics across multiple platforms
 * Owner: ads agent
 * Date: 2025-10-15
 * 
 * Features:
 * - ROAS (Return on Ad Spend) calculation
 * - CPC (Cost Per Click) tracking
 * - CPM (Cost Per Mille/Thousand Impressions) tracking
 * - CPA (Cost Per Acquisition) tracking
 * - Multi-platform support (Meta, Google, TikTok)
 * - Campaign performance aggregation
 * 
 * Formulas:
 * - ROAS = revenue / ad_spend
 * - CPC = ad_spend / clicks
 * - CPM = (ad_spend / impressions) * 1000
 * - CPA = ad_spend / conversions
 * - CTR = (clicks / impressions) * 100
 * - Conversion Rate = (conversions / clicks) * 100
 * 
 * @module services/ads/tracking
 */

/**
 * Supported advertising platforms
 */
export type AdPlatform = 'meta' | 'google' | 'tiktok' | 'other';

/**
 * Campaign status
 */
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';

/**
 * Raw campaign metrics from ad platform
 */
export interface CampaignMetrics {
  /** Campaign identifier */
  campaignId: string;
  /** Campaign name */
  campaignName: string;
  /** Advertising platform */
  platform: AdPlatform;
  /** Campaign status */
  status: CampaignStatus;
  /** Total ad spend in USD */
  adSpend: number;
  /** Total revenue attributed to campaign in USD */
  revenue: number;
  /** Number of ad impressions */
  impressions: number;
  /** Number of clicks */
  clicks: number;
  /** Number of conversions (purchases, signups, etc.) */
  conversions: number;
  /** Date range start (ISO 8601) */
  dateStart: string;
  /** Date range end (ISO 8601) */
  dateEnd: string;
  /** Additional platform-specific metadata */
  metadata?: Record<string, any>;
}

/**
 * Calculated performance metrics
 */
export interface PerformanceMetrics {
  /** Return on Ad Spend (revenue / ad_spend) */
  roas: number;
  /** Cost Per Click in USD */
  cpc: number;
  /** Cost Per Mille (thousand impressions) in USD */
  cpm: number;
  /** Cost Per Acquisition in USD */
  cpa: number;
  /** Click-Through Rate as percentage */
  ctr: number;
  /** Conversion Rate as percentage */
  conversionRate: number;
}

/**
 * Complete campaign performance data
 */
export interface CampaignPerformance extends CampaignMetrics, PerformanceMetrics {
  /** Timestamp when metrics were calculated */
  calculatedAt: string;
}

/**
 * Aggregated performance across multiple campaigns
 */
export interface AggregatedPerformance {
  /** Total campaigns included */
  totalCampaigns: number;
  /** Total ad spend across all campaigns */
  totalAdSpend: number;
  /** Total revenue across all campaigns */
  totalRevenue: number;
  /** Total impressions */
  totalImpressions: number;
  /** Total clicks */
  totalClicks: number;
  /** Total conversions */
  totalConversions: number;
  /** Aggregated ROAS */
  aggregatedRoas: number;
  /** Average CPC */
  averageCpc: number;
  /** Average CPM */
  averageCpm: number;
  /** Average CPA */
  averageCpa: number;
  /** Aggregated CTR */
  aggregatedCtr: number;
  /** Aggregated conversion rate */
  aggregatedConversionRate: number;
  /** Performance by platform */
  byPlatform: Record<AdPlatform, PerformanceMetrics & { campaigns: number; adSpend: number; revenue: number }>;
  /** Date range */
  dateStart: string;
  dateEnd: string;
  /** Timestamp when aggregation was calculated */
  calculatedAt: string;
}

/**
 * Calculate ROAS (Return on Ad Spend)
 * 
 * Formula: revenue / ad_spend
 * 
 * @param revenue - Total revenue in USD
 * @param adSpend - Total ad spend in USD
 * @returns ROAS value (e.g., 3.5 means $3.50 revenue per $1 spent)
 * 
 * @example
 * calculateRoas(1000, 250) // Returns 4.0 (4x return)
 */
export function calculateRoas(revenue: number, adSpend: number): number {
  if (adSpend <= 0) return 0;
  return revenue / adSpend;
}

/**
 * Calculate CPC (Cost Per Click)
 * 
 * Formula: ad_spend / clicks
 * 
 * @param adSpend - Total ad spend in USD
 * @param clicks - Total number of clicks
 * @returns CPC in USD
 * 
 * @example
 * calculateCpc(100, 50) // Returns 2.0 ($2 per click)
 */
export function calculateCpc(adSpend: number, clicks: number): number {
  if (clicks <= 0) return 0;
  return adSpend / clicks;
}

/**
 * Calculate CPM (Cost Per Mille/Thousand Impressions)
 * 
 * Formula: (ad_spend / impressions) * 1000
 * 
 * @param adSpend - Total ad spend in USD
 * @param impressions - Total number of impressions
 * @returns CPM in USD
 * 
 * @example
 * calculateCpm(100, 10000) // Returns 10.0 ($10 per 1000 impressions)
 */
export function calculateCpm(adSpend: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return (adSpend / impressions) * 1000;
}

/**
 * Calculate CPA (Cost Per Acquisition)
 * 
 * Formula: ad_spend / conversions
 * 
 * @param adSpend - Total ad spend in USD
 * @param conversions - Total number of conversions
 * @returns CPA in USD
 * 
 * @example
 * calculateCpa(500, 25) // Returns 20.0 ($20 per conversion)
 */
export function calculateCpa(adSpend: number, conversions: number): number {
  if (conversions <= 0) return 0;
  return adSpend / conversions;
}

/**
 * Calculate CTR (Click-Through Rate)
 * 
 * Formula: (clicks / impressions) * 100
 * 
 * @param clicks - Total number of clicks
 * @param impressions - Total number of impressions
 * @returns CTR as percentage
 * 
 * @example
 * calculateCtr(100, 10000) // Returns 1.0 (1% CTR)
 */
export function calculateCtr(clicks: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return (clicks / impressions) * 100;
}

/**
 * Calculate Conversion Rate
 * 
 * Formula: (conversions / clicks) * 100
 * 
 * @param conversions - Total number of conversions
 * @param clicks - Total number of clicks
 * @returns Conversion rate as percentage
 * 
 * @example
 * calculateConversionRate(25, 100) // Returns 25.0 (25% conversion rate)
 */
export function calculateConversionRate(conversions: number, clicks: number): number {
  if (clicks <= 0) return 0;
  return (conversions / clicks) * 100;
}

/**
 * Calculate all performance metrics for a campaign
 * 
 * @param metrics - Raw campaign metrics
 * @returns Complete campaign performance with calculated metrics
 * 
 * @example
 * const performance = calculateCampaignPerformance({
 *   campaignId: 'camp_123',
 *   campaignName: 'Summer Sale',
 *   platform: 'meta',
 *   status: 'active',
 *   adSpend: 500,
 *   revenue: 2000,
 *   impressions: 50000,
 *   clicks: 500,
 *   conversions: 40,
 *   dateStart: '2025-10-01',
 *   dateEnd: '2025-10-15',
 * });
 * // Returns: { ...metrics, roas: 4.0, cpc: 1.0, cpm: 10.0, cpa: 12.5, ctr: 1.0, conversionRate: 8.0 }
 */
export function calculateCampaignPerformance(metrics: CampaignMetrics): CampaignPerformance {
  const roas = calculateRoas(metrics.revenue, metrics.adSpend);
  const cpc = calculateCpc(metrics.adSpend, metrics.clicks);
  const cpm = calculateCpm(metrics.adSpend, metrics.impressions);
  const cpa = calculateCpa(metrics.adSpend, metrics.conversions);
  const ctr = calculateCtr(metrics.clicks, metrics.impressions);
  const conversionRate = calculateConversionRate(metrics.conversions, metrics.clicks);

  return {
    ...metrics,
    roas,
    cpc,
    cpm,
    cpa,
    ctr,
    conversionRate,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Aggregate performance metrics across multiple campaigns
 * 
 * @param campaigns - Array of campaign metrics
 * @returns Aggregated performance data
 * 
 * @example
 * const aggregated = aggregateCampaignPerformance([campaign1, campaign2, campaign3]);
 */
export function aggregateCampaignPerformance(campaigns: CampaignMetrics[]): AggregatedPerformance {
  if (campaigns.length === 0) {
    throw new Error('Cannot aggregate empty campaign list');
  }

  // Calculate totals
  const totalAdSpend = campaigns.reduce((sum, c) => sum + c.adSpend, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

  // Calculate aggregated metrics
  const aggregatedRoas = calculateRoas(totalRevenue, totalAdSpend);
  const averageCpc = calculateCpc(totalAdSpend, totalClicks);
  const averageCpm = calculateCpm(totalAdSpend, totalImpressions);
  const averageCpa = calculateCpa(totalAdSpend, totalConversions);
  const aggregatedCtr = calculateCtr(totalClicks, totalImpressions);
  const aggregatedConversionRate = calculateConversionRate(totalConversions, totalClicks);

  // Group by platform
  const byPlatform: AggregatedPerformance['byPlatform'] = {} as any;
  const platforms: AdPlatform[] = ['meta', 'google', 'tiktok', 'other'];

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

  // Determine date range
  const dates = campaigns.flatMap(c => [c.dateStart, c.dateEnd]);
  const dateStart = dates.sort()[0];
  const dateEnd = dates.sort().reverse()[0];

  return {
    totalCampaigns: campaigns.length,
    totalAdSpend,
    totalRevenue,
    totalImpressions,
    totalClicks,
    totalConversions,
    aggregatedRoas,
    averageCpc,
    averageCpm,
    averageCpa,
    aggregatedCtr,
    aggregatedConversionRate,
    byPlatform,
    dateStart,
    dateEnd,
    calculatedAt: new Date().toISOString(),
  };
}

