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
    ctr: number;
    cpc: number;
    cpa: number;
    roas: number;
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
        roasChange: number;
        spendChange: number;
        revenueChange: number;
    };
    period: {
        start: string;
        end: string;
    };
}
export interface ROASRecommendations {
    optimizeCampaigns: string[];
    pauseCampaigns: string[];
    scaleCampaigns: string[];
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
export declare function calculateROAS(spend: number, revenue: number): number;
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
export declare function calculateCampaignMetrics(campaignId: string, campaignName: string, platform: CampaignMetrics['platform'], spend: number, revenue: number, conversions: number, clicks: number, impressions: number, startDate: string, endDate: string): CampaignMetrics;
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
export declare function analyzeROASPerformance(campaigns: CampaignMetrics[], previousCampaigns: CampaignMetrics[], startDate: string, endDate: string): ROASAnalysis;
/**
 * Generate ROAS recommendations
 *
 * ANALYTICS-008: Provide actionable recommendations based on ROAS analysis
 *
 * @param analysis - ROAS analysis
 * @param campaigns - Campaign metrics
 * @returns ROAS recommendations
 */
export declare function generateROASRecommendations(analysis: ROASAnalysis, campaigns: CampaignMetrics[]): ROASRecommendations;
/**
 * Export ROAS data for dashboard
 *
 * ANALYTICS-008: Format ROAS data for dashboard display
 *
 * @param analysis - ROAS analysis
 * @returns Dashboard-ready ROAS metrics
 */
export declare function exportROASMetrics(analysis: ROASAnalysis): {
    summary: {
        totalSpend: number;
        totalRevenue: number;
        averageROAS: number;
        totalConversions: number;
    };
    performance: {
        bestCampaign: {
            name: string;
            roas: number;
            spend: number;
            revenue: number;
        };
        worstCampaign: {
            name: string;
            roas: number;
            spend: number;
            revenue: number;
        };
    };
    trends: {
        roasChange: number;
        spendChange: number;
        revenueChange: number;
    };
    platforms: {
        name: string;
        spend: number;
        revenue: number;
        roas: number;
        campaigns: number;
    }[];
    period: {
        start: string;
        end: string;
    };
};
/**
 * Calculate ROAS efficiency score
 *
 * ANALYTICS-008: Overall ROAS performance score
 *
 * @param analysis - ROAS analysis
 * @returns Efficiency score (0-100)
 */
export declare function calculateROASEfficiencyScore(analysis: ROASAnalysis): number;
//# sourceMappingURL=adsROAS.d.ts.map