/**
 * Growth Engine Advanced Analytics Service
 *
 * Provides sophisticated attribution modeling, performance optimization,
 * and predictive insights for growth actions across all channels.
 * Supports Growth Engine phases 9-12 with advanced analytics.
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

export interface AttributionMetrics {
  revenue: number;
  conversions: number;
  sessions: number;
  cost: number;
  roi: number;
  efficiency: number;
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
    overallEfficiency: number;
  };
  attributionAnalysis: AttributionData[];
  performanceInsights: {
    topPerformingActions: GrowthAction[];
    optimizationOpportunities: string[];
    budgetRecommendations: {
      recommendedAllocation: Record<string, number>;
      expectedImpact: number;
    };
  };
  recommendations: {
    scalingActions: GrowthAction[];
    optimizationActions: string[];
    budgetAdjustments: {
      increase: string[];
      decrease: string[];
    };
  };
}

/**
 * Calculate advanced attribution for growth actions
 */
export async function calculateAdvancedAttribution(
  actions: GrowthAction[],
  attributionData: AttributionData[]
): Promise<AttributionData[]> {
  // Process each action's attribution data
  const processedAttribution = attributionData.map((data) => {
    const action = actions.find(a => a.actionId === data.actionId);
    if (!action) return data;

    // Calculate efficiency metrics
    const totalCost = data.totalAttribution.cost;
    const totalRevenue = data.totalAttribution.revenue;
    const totalConversions = data.totalAttribution.conversions;

    const costPerConversion = totalConversions > 0 ? totalCost / totalConversions : 0;
    const revenuePerDollar = totalCost > 0 ? totalRevenue / totalCost : 0;
    const efficiencyScore = Math.min(100, Math.max(0, (revenuePerDollar - 1) * 50 + 50));

    return {
      ...data,
      efficiency: {
        costPerConversion,
        revenuePerDollar,
        efficiencyScore,
      },
    };
  });

  return processedAttribution;
}

/**
 * Generate comprehensive Growth Engine analytics
 */
export async function generateGrowthEngineAnalytics(
  actions: GrowthAction[],
  attributionData: AttributionData[],
  startDate: string,
  endDate: string
): Promise<GrowthEngineAnalytics> {
  // Calculate summary metrics
  const totalActions = actions.length;
  const totalRevenue = attributionData.reduce((sum, data) => sum + data.totalAttribution.revenue, 0);
  const totalConversions = attributionData.reduce((sum, data) => sum + data.totalAttribution.conversions, 0);
  const averageROI = attributionData.length > 0 
    ? attributionData.reduce((sum, data) => sum + data.totalAttribution.roi, 0) / attributionData.length 
    : 0;
  const overallEfficiency = attributionData.length > 0
    ? attributionData.reduce((sum, data) => sum + data.efficiency.efficiencyScore, 0) / attributionData.length
    : 0;

  // Find top performing actions
  const topPerformingActions = actions
    .filter(action => action.status === 'completed')
    .sort((a, b) => {
      const aData = attributionData.find(d => d.actionId === a.actionId);
      const bData = attributionData.find(d => d.actionId === b.actionId);
      const aROI = aData?.totalAttribution.roi || 0;
      const bROI = bData?.totalAttribution.roi || 0;
      return bROI - aROI;
    })
    .slice(0, 5);

  // Identify optimization opportunities
  const optimizationOpportunities = attributionData
    .filter(data => data.efficiency.efficiencyScore < 60)
    .map(data => {
      const action = actions.find(a => a.actionId === data.actionId);
      return `Optimize ${action?.title || data.actionId}: Efficiency score ${data.efficiency.efficiencyScore.toFixed(1)}%`;
    });

  // Generate budget recommendations
  const totalBudget = actions.reduce((sum, action) => sum + (action.budget || 0), 0);
  const budgetRecommendations = {
    recommendedAllocation: {} as Record<string, number>,
    expectedImpact: 0,
  };

  // Allocate budget based on efficiency scores
  const efficientActions = attributionData
    .filter(data => data.efficiency.efficiencyScore > 70)
    .sort((a, b) => b.efficiency.efficiencyScore - a.efficiency.efficiencyScore);

  efficientActions.forEach((data, index) => {
    const action = actions.find(a => a.actionId === data.actionId);
    if (action) {
      const allocation = (totalBudget * 0.8) / efficientActions.length;
      budgetRecommendations.recommendedAllocation[action.actionType] = 
        (budgetRecommendations.recommendedAllocation[action.actionType] || 0) + allocation;
    }
  });

  budgetRecommendations.expectedImpact = efficientActions.reduce(
    (sum, data) => sum + data.efficiency.efficiencyScore, 0
  ) / Math.max(efficientActions.length, 1);

  // Generate scaling and optimization recommendations
  const scalingActions = actions
    .filter(action => action.status === 'completed')
    .filter(action => {
      const data = attributionData.find(d => d.actionId === action.actionId);
      return data && data.efficiency.efficiencyScore > 80;
    });

  const optimizationActions = attributionData
    .filter(data => data.efficiency.efficiencyScore < 50)
    .map(data => {
      const action = actions.find(a => a.actionId === data.actionId);
      return `Review and optimize ${action?.title || data.actionId}`;
    });

  const budgetAdjustments = {
    increase: efficientActions
      .slice(0, 3)
      .map(data => {
        const action = actions.find(a => a.actionId === data.actionId);
        return action?.title || data.actionId;
      }),
    decrease: attributionData
      .filter(data => data.efficiency.efficiencyScore < 40)
      .map(data => {
        const action = actions.find(a => a.actionId === data.actionId);
        return action?.title || data.actionId;
      }),
  };

  return {
    period: { start: startDate, end: endDate },
    summary: {
      totalActions,
      totalRevenue,
      totalConversions,
      averageROI,
      overallEfficiency,
    },
    attributionAnalysis: attributionData,
    performanceInsights: {
      topPerformingActions,
      optimizationOpportunities,
      budgetRecommendations,
    },
    recommendations: {
      scalingActions,
      optimizationActions,
      budgetAdjustments,
    },
  };
}

/**
 * Export analytics data for dashboard display
 */
export function exportGrowthEngineAnalytics(analytics: GrowthEngineAnalytics) {
  return {
    analytics,
    timeframe: '28d',
    period: analytics.period,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get mock data for development/testing
 */
export function getMockGrowthEngineData(): {
  actions: GrowthAction[];
  attributionData: AttributionData[];
} {
  const actions: GrowthAction[] = [
    {
      actionId: 'action-1',
      actionType: 'seo',
      targetSlug: 'snowboard-collection',
      title: 'SEO Optimization for Snowboard Collection',
      description: 'Optimize meta tags and content for snowboard collection page',
      approvedAt: '2025-10-15T10:00:00Z',
      executedAt: '2025-10-15T10:30:00Z',
      status: 'completed',
      budget: 500,
      expectedROI: 4.2,
    },
    {
      actionId: 'action-2',
      actionType: 'ads',
      targetSlug: 'winter-gear',
      title: 'Google Ads Campaign for Winter Gear',
      description: 'Launch targeted Google Ads campaign for winter gear products',
      approvedAt: '2025-10-16T09:00:00Z',
      executedAt: '2025-10-16T09:15:00Z',
      status: 'completed',
      budget: 1200,
      expectedROI: 3.8,
    },
    {
      actionId: 'action-3',
      actionType: 'social',
      targetSlug: 'instagram-content',
      title: 'Instagram Content Strategy',
      description: 'Develop and execute Instagram content strategy for brand awareness',
      approvedAt: '2025-10-17T14:00:00Z',
      executedAt: '2025-10-17T14:30:00Z',
      status: 'completed',
      budget: 800,
      expectedROI: 2.5,
    },
  ];

  const attributionData: AttributionData[] = [
    {
      actionId: 'action-1',
      actionType: 'seo',
      targetSlug: 'snowboard-collection',
      attributionWindows: {
        '7d': {
          revenue: 2500,
          conversions: 12,
          sessions: 450,
          cost: 500,
          roi: 5.0,
          efficiency: 85,
        },
        '14d': {
          revenue: 4200,
          conversions: 18,
          sessions: 720,
          cost: 500,
          roi: 8.4,
          efficiency: 90,
        },
        '28d': {
          revenue: 6800,
          conversions: 28,
          sessions: 1200,
          cost: 500,
          roi: 13.6,
          efficiency: 95,
        },
      },
      totalAttribution: {
        revenue: 6800,
        conversions: 28,
        sessions: 1200,
        cost: 500,
        roi: 13.6,
        efficiency: 95,
      },
      efficiency: {
        costPerConversion: 17.86,
        revenuePerDollar: 13.6,
        efficiencyScore: 95,
      },
    },
    {
      actionId: 'action-2',
      actionType: 'ads',
      targetSlug: 'winter-gear',
      attributionWindows: {
        '7d': {
          revenue: 1800,
          conversions: 8,
          sessions: 320,
          cost: 1200,
          roi: 1.5,
          efficiency: 60,
        },
        '14d': {
          revenue: 3200,
          conversions: 14,
          sessions: 580,
          cost: 1200,
          roi: 2.67,
          efficiency: 70,
        },
        '28d': {
          revenue: 4800,
          conversions: 22,
          sessions: 950,
          cost: 1200,
          roi: 4.0,
          efficiency: 80,
        },
      },
      totalAttribution: {
        revenue: 4800,
        conversions: 22,
        sessions: 950,
        cost: 1200,
        roi: 4.0,
        efficiency: 80,
      },
      efficiency: {
        costPerConversion: 54.55,
        revenuePerDollar: 4.0,
        efficiencyScore: 80,
      },
    },
    {
      actionId: 'action-3',
      actionType: 'social',
      targetSlug: 'instagram-content',
      attributionWindows: {
        '7d': {
          revenue: 600,
          conversions: 3,
          sessions: 180,
          cost: 800,
          roi: 0.75,
          efficiency: 40,
        },
        '14d': {
          revenue: 1000,
          conversions: 5,
          sessions: 320,
          cost: 800,
          roi: 1.25,
          efficiency: 50,
        },
        '28d': {
          revenue: 1600,
          conversions: 8,
          sessions: 520,
          cost: 800,
          roi: 2.0,
          efficiency: 60,
        },
      },
      totalAttribution: {
        revenue: 1600,
        conversions: 8,
        sessions: 520,
        cost: 800,
        roi: 2.0,
        efficiency: 60,
      },
      efficiency: {
        costPerConversion: 100,
        revenuePerDollar: 2.0,
        efficiencyScore: 60,
      },
    },
  ];

  return { actions, attributionData };
}