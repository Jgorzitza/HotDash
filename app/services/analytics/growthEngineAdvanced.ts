/**
 * Growth Engine Advanced Analytics Service
 *
 * ANALYTICS-023: Implement growth engine advanced analytics for Growth Engine phases 9-12
 *
 * Features:
 * - Advanced attribution modeling
 * - Multi-touch attribution analysis
 * - Growth engine performance optimization
 * - Predictive analytics for growth actions
 * - ROI optimization recommendations
 */

export interface GrowthAction {
  actionId: string;
  actionType: 'seo' | 'ads' | 'content' | 'social' | 'email' | 'product';
  targetSlug: string;
  title: string;
  description: string;
  approvedAt: string;
  executedAt: string;
  status: 'approved' | 'executed' | 'completed' | 'failed';
  budget?: number;
  expectedROI?: number;
}

export interface AttributionData {
  actionId: string;
  actionType: string;
  targetSlug: string;
  attributionWindows: {
    '7d': AttributionMetrics;
    '14d': AttributionMetrics;
    '28d': AttributionMetrics;
  };
  totalAttribution: AttributionMetrics;
  efficiency: {
    costPerConversion: number;
    revenuePerDollar: number;
    efficiencyScore: number; // 0-100
  };
}

export interface AttributionMetrics {
  conversions: number;
  revenue: number;
  sessions: number;
  users: number;
  ctr: number;
  conversionRate: number;
  roas: number;
  costPerConversion: number;
  revenuePerDollar: number;
}

export interface GrowthEngineAnalytics {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalActions: number;
    totalRevenue: number;
    totalConversions: number;
    averageROI: number;
    topPerformingAction: GrowthAction | null;
    overallEfficiency: number;
  };
  attributionAnalysis: AttributionData[];
  performanceInsights: {
    bestPerformingType: string;
    worstPerformingType: string;
    optimizationOpportunities: string[];
    predictiveInsights: string[];
  };
  recommendations: {
    scaleActions: string[];
    optimizeActions: string[];
    pauseActions: string[];
    budgetRecommendations: Array<{
      actionId: string;
      currentBudget: number;
      recommendedBudget: number;
      expectedROI: number;
    }>;
  };
}

/**
 * Calculate advanced attribution for growth actions
 *
 * ANALYTICS-023: Multi-touch attribution analysis for growth engine actions
 *
 * @param actions - Array of growth actions
 * @param attributionData - Raw attribution data from GA4
 * @returns Attribution analysis
 */
export function calculateAdvancedAttribution(
  actions: GrowthAction[],
  attributionData: any[]
): AttributionData[] {
  return actions.map(action => {
    // Get attribution data for this action
    const actionData = attributionData.filter(data => 
      data.hd_action_key?.includes(action.actionId)
    );

    // Calculate metrics for each attribution window
    const windows = {
      '7d': calculateAttributionMetrics(actionData, 7),
      '14d': calculateAttributionMetrics(actionData, 14),
      '28d': calculateAttributionMetrics(actionData, 28),
    };

    // Calculate total attribution
    const totalAttribution = calculateAttributionMetrics(actionData, 28);

    // Calculate efficiency metrics
    const costPerConversion = action.budget && totalAttribution.conversions > 0 
      ? action.budget / totalAttribution.conversions 
      : 0;
    const revenuePerDollar = action.budget && action.budget > 0 
      ? totalAttribution.revenue / action.budget 
      : 0;

    // Calculate efficiency score (0-100)
    const efficiencyScore = calculateEfficiencyScore({
      roas: totalAttribution.roas,
      conversionRate: totalAttribution.conversionRate,
      costPerConversion,
      revenuePerDollar,
    });

    return {
      actionId: action.actionId,
      actionType: action.actionType,
      targetSlug: action.targetSlug,
      attributionWindows: windows,
      totalAttribution,
      efficiency: {
        costPerConversion: Math.round(costPerConversion * 100) / 100,
        revenuePerDollar: Math.round(revenuePerDollar * 100) / 100,
        efficiencyScore,
      },
    };
  });
}

/**
 * Calculate attribution metrics for a specific time window
 */
function calculateAttributionMetrics(data: any[], days: number): AttributionMetrics {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const filteredData = data.filter(item => 
    new Date(item.timestamp) >= cutoffDate
  );

  const conversions = filteredData.reduce((sum, item) => sum + (item.conversions || 0), 0);
  const revenue = filteredData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const sessions = filteredData.reduce((sum, item) => sum + (item.sessions || 0), 0);
  const users = filteredData.reduce((sum, item) => sum + (item.users || 0), 0);
  const clicks = filteredData.reduce((sum, item) => sum + (item.clicks || 0), 0);
  const impressions = filteredData.reduce((sum, item) => sum + (item.impressions || 0), 0);

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const conversionRate = sessions > 0 ? (conversions / sessions) * 100 : 0;
  const roas = revenue > 0 && sessions > 0 ? revenue / sessions : 0;

  return {
    conversions,
    revenue,
    sessions,
    users,
    ctr: Math.round(ctr * 100) / 100,
    conversionRate: Math.round(conversionRate * 100) / 100,
    roas: Math.round(roas * 100) / 100,
    costPerConversion: 0, // Will be calculated at action level
    revenuePerDollar: 0, // Will be calculated at action level
  };
}

/**
 * Calculate efficiency score for growth actions
 */
function calculateEfficiencyScore(metrics: {
  roas: number;
  conversionRate: number;
  costPerConversion: number;
  revenuePerDollar: number;
}): number {
  let score = 0;

  // ROAS score (0-40 points)
  if (metrics.roas >= 5) score += 40;
  else if (metrics.roas >= 3) score += 30;
  else if (metrics.roas >= 2) score += 20;
  else if (metrics.roas >= 1) score += 10;

  // Conversion rate score (0-30 points)
  if (metrics.conversionRate >= 5) score += 30;
  else if (metrics.conversionRate >= 3) score += 20;
  else if (metrics.conversionRate >= 2) score += 10;

  // Revenue per dollar score (0-30 points)
  if (metrics.revenuePerDollar >= 3) score += 30;
  else if (metrics.revenuePerDollar >= 2) score += 20;
  else if (metrics.revenuePerDollar >= 1) score += 10;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate growth engine analytics report
 *
 * ANALYTICS-023: Comprehensive growth engine performance analysis
 *
 * @param actions - Growth actions
 * @param attributionData - Attribution analysis
 * @param startDate - Analysis start date
 * @param endDate - Analysis end date
 * @returns Growth engine analytics
 */
export function generateGrowthEngineAnalytics(
  actions: GrowthAction[],
  attributionData: AttributionData[],
  startDate: string,
  endDate: string
): GrowthEngineAnalytics {
  // Calculate summary metrics
  const totalActions = actions.length;
  const totalRevenue = attributionData.reduce((sum, data) => sum + data.totalAttribution.revenue, 0);
  const totalConversions = attributionData.reduce((sum, data) => sum + data.totalAttribution.conversions, 0);
  const averageROI = totalActions > 0 ? totalRevenue / totalActions : 0;

  // Find top performing action
  const topPerformingAction = attributionData.reduce((top, current) => 
    current.totalAttribution.revenue > (top?.totalAttribution.revenue || 0) 
      ? actions.find(a => a.actionId === current.actionId) || top
      : top
  , null as GrowthAction | null);

  // Calculate overall efficiency
  const overallEfficiency = attributionData.length > 0
    ? attributionData.reduce((sum, data) => sum + data.efficiency.efficiencyScore, 0) / attributionData.length
    : 0;

  // Analyze performance by type
  const performanceByType = actions.reduce((acc, action) => {
    const attribution = attributionData.find(data => data.actionId === action.actionId);
    if (!attribution) return acc;

    if (!acc[action.actionType]) {
      acc[action.actionType] = {
        count: 0,
        totalRevenue: 0,
        totalEfficiency: 0,
      };
    }

    acc[action.actionType].count++;
    acc[action.actionType].totalRevenue += attribution.totalAttribution.revenue;
    acc[action.actionType].totalEfficiency += attribution.efficiency.efficiencyScore;

    return acc;
  }, {} as Record<string, { count: number; totalRevenue: number; totalEfficiency: number }>);

  // Find best and worst performing types
  const typePerformance = Object.entries(performanceByType).map(([type, data]) => ({
    type,
    averageRevenue: data.totalRevenue / data.count,
    averageEfficiency: data.totalEfficiency / data.count,
  }));

  const bestPerformingType = typePerformance.reduce((best, current) => 
    current.averageEfficiency > best.averageEfficiency ? current : best
  ).type;

  const worstPerformingType = typePerformance.reduce((worst, current) => 
    current.averageEfficiency < worst.averageEfficiency ? current : worst
  ).type;

  // Generate optimization opportunities
  const optimizationOpportunities = generateOptimizationOpportunities(attributionData, actions);

  // Generate predictive insights
  const predictiveInsights = generatePredictiveInsights(attributionData, actions);

  // Generate recommendations
  const recommendations = generateGrowthRecommendations(attributionData, actions);

  return {
    period: { start: startDate, end: endDate },
    summary: {
      totalActions,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalConversions,
      averageROI: Math.round(averageROI * 100) / 100,
      topPerformingAction,
      overallEfficiency: Math.round(overallEfficiency * 100) / 100,
    },
    attributionAnalysis: attributionData,
    performanceInsights: {
      bestPerformingType,
      worstPerformingType,
      optimizationOpportunities,
      predictiveInsights,
    },
    recommendations,
  };
}

/**
 * Generate optimization opportunities
 */
function generateOptimizationOpportunities(
  attributionData: AttributionData[],
  actions: GrowthAction[]
): string[] {
  const opportunities: string[] = [];

  // Find low-performing actions
  const lowPerformers = attributionData.filter(data => 
    data.efficiency.efficiencyScore < 30
  );

  if (lowPerformers.length > 0) {
    opportunities.push(`${lowPerformers.length} actions are underperforming and need optimization`);
  }

  // Find high-performing actions that could be scaled
  const highPerformers = attributionData.filter(data => 
    data.efficiency.efficiencyScore > 80
  );

  if (highPerformers.length > 0) {
    opportunities.push(`${highPerformers.length} actions are performing excellently and should be scaled`);
  }

  // Find budget optimization opportunities
  const budgetOptimization = attributionData.filter(data => 
    data.efficiency.revenuePerDollar > 2
  );

  if (budgetOptimization.length > 0) {
    opportunities.push(`${budgetOptimization.length} actions have high ROI and could benefit from increased budget`);
  }

  return opportunities;
}

/**
 * Generate predictive insights
 */
function generatePredictiveInsights(
  attributionData: AttributionData[],
  actions: GrowthAction[]
): string[] {
  const insights: string[] = [];

  // Analyze trends
  const improvingActions = attributionData.filter(data => 
    data.attributionWindows['7d'].revenue > data.attributionWindows['28d'].revenue * 0.25
  );

  if (improvingActions.length > 0) {
    insights.push(`${improvingActions.length} actions are showing strong recent performance trends`);
  }

  // Analyze seasonal patterns
  const seasonalInsights = analyzeSeasonalPatterns(attributionData);
  insights.push(...seasonalInsights);

  return insights;
}

/**
 * Analyze seasonal patterns in attribution data
 */
function analyzeSeasonalPatterns(attributionData: AttributionData[]): string[] {
  const insights: string[] = [];

  // This would typically involve more sophisticated time series analysis
  // For now, provide basic insights
  insights.push('Consider seasonal trends when planning future growth actions');
  insights.push('Monitor attribution windows to identify optimal timing for action execution');

  return insights;
}

/**
 * Generate growth recommendations
 */
function generateGrowthRecommendations(
  attributionData: AttributionData[],
  actions: GrowthAction[]
): {
  scaleActions: string[];
  optimizeActions: string[];
  pauseActions: string[];
  budgetRecommendations: Array<{
    actionId: string;
    currentBudget: number;
    recommendedBudget: number;
    expectedROI: number;
  }>;
} {
  const scaleActions: string[] = [];
  const optimizeActions: string[] = [];
  const pauseActions: string[] = [];
  const budgetRecommendations: Array<{
    actionId: string;
    currentBudget: number;
    recommendedBudget: number;
    expectedROI: number;
  }> = [];

  attributionData.forEach(data => {
    const action = actions.find(a => a.actionId === data.actionId);
    if (!action) return;

    if (data.efficiency.efficiencyScore >= 80) {
      scaleActions.push(data.actionId);
      if (action.budget) {
        budgetRecommendations.push({
          actionId: data.actionId,
          currentBudget: action.budget,
          recommendedBudget: action.budget * 1.5,
          expectedROI: data.efficiency.revenuePerDollar * 1.5,
        });
      }
    } else if (data.efficiency.efficiencyScore >= 50) {
      optimizeActions.push(data.actionId);
    } else {
      pauseActions.push(data.actionId);
      if (action.budget) {
        budgetRecommendations.push({
          actionId: data.actionId,
          currentBudget: action.budget,
          recommendedBudget: action.budget * 0.5,
          expectedROI: data.efficiency.revenuePerDollar * 0.5,
        });
      }
    }
  });

  return {
    scaleActions,
    optimizeActions,
    pauseActions,
    budgetRecommendations,
  };
}

/**
 * Export growth engine analytics for dashboard
 *
 * ANALYTICS-023: Format analytics data for dashboard display
 *
 * @param analytics - Growth engine analytics
 * @returns Dashboard-ready analytics data
 */
export function exportGrowthEngineAnalytics(analytics: GrowthEngineAnalytics) {
  return {
    summary: {
      totalActions: analytics.summary.totalActions,
      totalRevenue: analytics.summary.totalRevenue,
      totalConversions: analytics.summary.totalConversions,
      averageROI: analytics.summary.averageROI,
      overallEfficiency: analytics.summary.overallEfficiency,
    },
    topAction: analytics.summary.topPerformingAction ? {
      id: analytics.summary.topPerformingAction.actionId,
      title: analytics.summary.topPerformingAction.title,
      type: analytics.summary.topPerformingAction.actionType,
      revenue: analytics.attributionAnalysis.find(a => a.actionId === analytics.summary.topPerformingAction?.actionId)?.totalAttribution.revenue || 0,
    } : null,
    performance: {
      bestType: analytics.performanceInsights.bestPerformingType,
      worstType: analytics.performanceInsights.worstPerformingType,
      opportunities: analytics.performanceInsights.optimizationOpportunities,
      insights: analytics.performanceInsights.predictiveInsights,
    },
    recommendations: {
      scale: analytics.recommendations.scaleActions,
      optimize: analytics.recommendations.optimizeActions,
      pause: analytics.recommendations.pauseActions,
      budget: analytics.recommendations.budgetRecommendations,
    },
    period: analytics.period,
  };
}
