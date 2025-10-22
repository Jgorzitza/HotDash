/**
 * Ads ROAS Calculator Service
 *
 * ANALYTICS-008: Campaign performance ROAS calculation and analysis
 *
 * Features:
 * - Calculate Return on Ad Spend (ROAS)
 * - Track campaign performance metrics
 * - Compare ROAS across platforms and campaigns
 * - Generate ads performance reports
 */

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  platform: 'google' | 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
  spend: number;
  revenue: number;
  conversions: number;
  clicks: number;
  impressions: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpa: number; // Cost per acquisition
  roas: number; // Return on ad spend
  period: {
    start: string;
    end: string;
  };
}

export interface ROASAnalysis {
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  averageROAS: number;
  bestPerformingCampaign: CampaignMetrics | null;
  worstPerformingCampaign: CampaignMetrics | null;
  platformBreakdown: {
    platform: string;
    spend: number;
    revenue: number;
    roas: number;
    campaigns: number;
  }[];
  trends: {
    roasChange: number; // vs previous period
    spendChange: number;
    revenueChange: number;
  };
  period: {
    start: string;
    end: string;
  };
}

export interface ROASRecommendations {
  optimizeCampaigns: string[]; // Campaign IDs to optimize
  pauseCampaigns: string[]; // Campaign IDs to pause
  scaleCampaigns: string[]; // Campaign IDs to scale
  budgetRecommendations: {
    campaignId: string;
    currentBudget: number;
    recommendedBudget: number;
    reason: string;
  }[];
}

/**
 * Calculate ROAS for a campaign
 *
 * ANALYTICS-008: Core ROAS calculation function
 *
 * @param spend - Campaign spend amount
 * @param revenue - Revenue generated from campaign
 * @returns ROAS value (revenue / spend)
 */
export function calculateROAS(spend: number, revenue: number): number {
  if (spend === 0) return 0;
  return Math.round((revenue / spend) * 100) / 100;
}

/**
 * Calculate campaign metrics
 *
 * ANALYTICS-008: Calculate all campaign performance metrics
 *
 * @param campaignId - Campaign identifier
 * @param campaignName - Campaign name
 * @param platform - Advertising platform
 * @param spend - Campaign spend
 * @param revenue - Revenue generated
 * @param conversions - Number of conversions
 * @param clicks - Number of clicks
 * @param impressions - Number of impressions
 * @param startDate - Campaign start date
 * @param endDate - Campaign end date
 * @returns Complete campaign metrics
 */
export function calculateCampaignMetrics(
  campaignId: string,
  campaignName: string,
  platform: CampaignMetrics['platform'],
  spend: number,
  revenue: number,
  conversions: number,
  clicks: number,
  impressions: number,
  startDate: string,
  endDate: string
): CampaignMetrics {
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpa = conversions > 0 ? spend / conversions : 0;
  const roas = calculateROAS(spend, revenue);

  return {
    campaignId,
    campaignName,
    platform,
    spend,
    revenue,
    conversions,
    clicks,
    impressions,
    ctr: Math.round(ctr * 100) / 100,
    cpc: Math.round(cpc * 100) / 100,
    cpa: Math.round(cpa * 100) / 100,
    roas,
    period: { start: startDate, end: endDate },
  };
}

/**
 * Analyze ROAS performance across campaigns
 *
 * ANALYTICS-008: Comprehensive ROAS analysis
 *
 * @param campaigns - Array of campaign metrics
 * @param previousCampaigns - Previous period campaigns for comparison
 * @param startDate - Analysis start date
 * @param endDate - Analysis end date
 * @returns ROAS analysis
 */
export function analyzeROASPerformance(
  campaigns: CampaignMetrics[],
  previousCampaigns: CampaignMetrics[] = [],
  startDate: string,
  endDate: string
): ROASAnalysis {
  if (campaigns.length === 0) {
    return {
      totalSpend: 0,
      totalRevenue: 0,
      totalConversions: 0,
      averageROAS: 0,
      bestPerformingCampaign: null,
      worstPerformingCampaign: null,
      platformBreakdown: [],
      trends: { roasChange: 0, spendChange: 0, revenueChange: 0 },
      period: { start: startDate, end: endDate },
    };
  }

  // Calculate totals
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const averageROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  // Find best and worst performing campaigns
  const bestPerformingCampaign = campaigns.reduce((best, current) => 
    current.roas > best.roas ? current : best
  );
  const worstPerformingCampaign = campaigns.reduce((worst, current) => 
    current.roas < worst.roas ? current : worst
  );

  // Calculate platform breakdown
  const platformStats = new Map<string, {
    spend: number;
    revenue: number;
    campaigns: number;
  }>();

  campaigns.forEach(campaign => {
    const platform = campaign.platform;
    const existing = platformStats.get(platform) || { spend: 0, revenue: 0, campaigns: 0 };
    
    platformStats.set(platform, {
      spend: existing.spend + campaign.spend,
      revenue: existing.revenue + campaign.revenue,
      campaigns: existing.campaigns + 1,
    });
  });

  const platformBreakdown = Array.from(platformStats.entries()).map(([platform, stats]) => ({
    platform,
    spend: stats.spend,
    revenue: stats.revenue,
    roas: stats.spend > 0 ? stats.revenue / stats.spend : 0,
    campaigns: stats.campaigns,
  }));

  // Calculate trends vs previous period
  const previousTotalSpend = previousCampaigns.reduce((sum, c) => sum + c.spend, 0);
  const previousTotalRevenue = previousCampaigns.reduce((sum, c) => sum + c.revenue, 0);
  const previousAverageROAS = previousTotalSpend > 0 ? previousTotalRevenue / previousTotalSpend : 0;

  const roasChange = previousAverageROAS > 0 ? ((averageROAS - previousAverageROAS) / previousAverageROAS) * 100 : 0;
  const spendChange = previousTotalSpend > 0 ? ((totalSpend - previousTotalSpend) / previousTotalSpend) * 100 : 0;
  const revenueChange = previousTotalRevenue > 0 ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 : 0;

  return {
    totalSpend,
    totalRevenue,
    totalConversions,
    averageROAS: Math.round(averageROAS * 100) / 100,
    bestPerformingCampaign,
    worstPerformingCampaign,
    platformBreakdown,
    trends: {
      roasChange: Math.round(roasChange * 100) / 100,
      spendChange: Math.round(spendChange * 100) / 100,
      revenueChange: Math.round(revenueChange * 100) / 100,
    },
    period: { start: startDate, end: endDate },
  };
}

/**
 * Generate ROAS recommendations
 *
 * ANALYTICS-008: Provide actionable recommendations based on ROAS analysis
 *
 * @param analysis - ROAS analysis
 * @param campaigns - Campaign metrics
 * @returns ROAS recommendations
 */
export function generateROASRecommendations(
  analysis: ROASAnalysis,
  campaigns: CampaignMetrics[]
): ROASRecommendations {
  const recommendations: ROASRecommendations = {
    optimizeCampaigns: [],
    pauseCampaigns: [],
    scaleCampaigns: [],
    budgetRecommendations: [],
  };

  // Define ROAS thresholds
  const excellentROAS = 4.0; // 4:1 or better
  const goodROAS = 2.0; // 2:1 or better
  const poorROAS = 1.0; // 1:1 or worse

  campaigns.forEach(campaign => {
    if (campaign.roas >= excellentROAS) {
      // Scale high-performing campaigns
      recommendations.scaleCampaigns.push(campaign.campaignId);
      recommendations.budgetRecommendations.push({
        campaignId: campaign.campaignId,
        currentBudget: campaign.spend,
        recommendedBudget: campaign.spend * 1.5, // Increase by 50%
        reason: `High ROAS (${campaign.roas}:1) - recommend scaling up`,
      });
    } else if (campaign.roas >= goodROAS) {
      // Optimize medium-performing campaigns
      recommendations.optimizeCampaigns.push(campaign.campaignId);
      recommendations.budgetRecommendations.push({
        campaignId: campaign.campaignId,
        currentBudget: campaign.spend,
        recommendedBudget: campaign.spend, // Keep same budget
        reason: `Moderate ROAS (${campaign.roas}:1) - optimize targeting and creative`,
      });
    } else if (campaign.roas < poorROAS) {
      // Pause or optimize poor-performing campaigns
      if (campaign.spend > 100) { // Only pause if significant spend
        recommendations.pauseCampaigns.push(campaign.campaignId);
      } else {
        recommendations.optimizeCampaigns.push(campaign.campaignId);
      }
      recommendations.budgetRecommendations.push({
        campaignId: campaign.campaignId,
        currentBudget: campaign.spend,
        recommendedBudget: campaign.spend * 0.5, // Reduce by 50%
        reason: `Low ROAS (${campaign.roas}:1) - reduce budget or pause`,
      });
    }
  });

  return recommendations;
}

/**
 * Export ROAS data for dashboard
 *
 * ANALYTICS-008: Format ROAS data for dashboard display
 *
 * @param analysis - ROAS analysis
 * @returns Dashboard-ready ROAS metrics
 */
export function exportROASMetrics(analysis: ROASAnalysis) {
  return {
    summary: {
      totalSpend: analysis.totalSpend,
      totalRevenue: analysis.totalRevenue,
      averageROAS: analysis.averageROAS,
      totalConversions: analysis.totalConversions,
    },
    performance: {
      bestCampaign: analysis.bestPerformingCampaign ? {
        name: analysis.bestPerformingCampaign.campaignName,
        roas: analysis.bestPerformingCampaign.roas,
        spend: analysis.bestPerformingCampaign.spend,
        revenue: analysis.bestPerformingCampaign.revenue,
      } : null,
      worstCampaign: analysis.worstPerformingCampaign ? {
        name: analysis.worstPerformingCampaign.campaignName,
        roas: analysis.worstPerformingCampaign.roas,
        spend: analysis.worstPerformingCampaign.spend,
        revenue: analysis.worstPerformingCampaign.revenue,
      } : null,
    },
    trends: {
      roasChange: analysis.trends.roasChange,
      spendChange: analysis.trends.spendChange,
      revenueChange: analysis.trends.revenueChange,
    },
    platforms: analysis.platformBreakdown.map(p => ({
      name: p.platform,
      spend: p.spend,
      revenue: p.revenue,
      roas: Math.round(p.roas * 100) / 100,
      campaigns: p.campaigns,
    })),
    period: analysis.period,
  };
}

/**
 * Calculate ROAS efficiency score
 *
 * ANALYTICS-008: Overall ROAS performance score
 *
 * @param analysis - ROAS analysis
 * @returns Efficiency score (0-100)
 */
export function calculateROASEfficiencyScore(analysis: ROASAnalysis): number {
  if (analysis.totalSpend === 0) return 0;

  // Base score from average ROAS
  let score = Math.min(analysis.averageROAS * 20, 100); // 5:1 ROAS = 100 points

  // Bonus for positive trends
  if (analysis.trends.roasChange > 0) {
    score += Math.min(analysis.trends.roasChange * 2, 20); // Up to 20 bonus points
  }

  // Penalty for negative trends
  if (analysis.trends.roasChange < 0) {
    score += Math.max(analysis.trends.roasChange * 2, -20); // Up to 20 penalty points
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
