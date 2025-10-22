/**
 * Growth Engine Advanced Analytics API Route
 *
 * ANALYTICS-023: API endpoint for growth engine advanced analytics
 *
 * Features:
 * - Fetch growth actions and attribution data
 * - Calculate advanced analytics
 * - Return dashboard-ready data
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { 
  calculateAdvancedAttribution, 
  generateGrowthEngineAnalytics,
  type GrowthAction,
  type GrowthEngineAnalytics 
} from '~/services/analytics/growthEngineAdvanced';
import { getGaConfig } from '~/config/ga.server';
import { createDirectGaClient } from '~/services/ga/directClient';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate') || getDefaultStartDate();
    const endDate = url.searchParams.get('endDate') || getDefaultEndDate();
    const timeframe = url.searchParams.get('timeframe') || '28d';

    // Get GA configuration
    const gaConfig = getGaConfig();
    
    if (gaConfig.mode === 'mock') {
      // Return mock data for development
      return json({
        analytics: getMockGrowthEngineAnalytics(),
        timeframe,
        period: { start: startDate, end: endDate }
      });
    }

    // Fetch growth actions (this would typically come from your database)
    const growthActions = await fetchGrowthActions(startDate, endDate);
    
    // Fetch attribution data from GA4
    const attributionData = await fetchAttributionData(startDate, endDate, gaConfig);
    
    // Calculate advanced attribution
    const attributionAnalysis = calculateAdvancedAttribution(growthActions, attributionData);
    
    // Generate growth engine analytics
    const analytics = generateGrowthEngineAnalytics(
      growthActions,
      attributionAnalysis,
      startDate,
      endDate
    );

    return json({
      analytics,
      timeframe,
      period: { start: startDate, end: endDate }
    });

  } catch (error) {
    console.error('Error fetching growth engine analytics:', error);
    return json(
      { error: 'Failed to fetch growth engine analytics' },
      { status: 500 }
    );
  }
}

/**
 * Fetch growth actions from database
 * 
 * ANALYTICS-023: This would typically query your database for growth actions
 * For now, returning mock data structure
 */
async function fetchGrowthActions(startDate: string, endDate: string): Promise<GrowthAction[]> {
  // TODO: Replace with actual database query
  // This would query your growth actions table for the specified date range
  
  return [
    {
      actionId: 'action-001',
      actionType: 'seo',
      targetSlug: 'growth-hacking-guide',
      title: 'SEO Optimization for Growth Hacking Guide',
      description: 'Optimize the growth hacking guide for better search rankings',
      approvedAt: '2025-10-15T10:00:00Z',
      executedAt: '2025-10-15T11:00:00Z',
      status: 'completed',
      budget: 500,
      expectedROI: 3.5
    },
    {
      actionId: 'action-002',
      actionType: 'ads',
      targetSlug: 'product-launch',
      title: 'Google Ads Campaign for Product Launch',
      description: 'Launch Google Ads campaign to promote new product',
      approvedAt: '2025-10-16T09:00:00Z',
      executedAt: '2025-10-16T10:00:00Z',
      status: 'completed',
      budget: 2000,
      expectedROI: 2.8
    },
    {
      actionId: 'action-003',
      actionType: 'content',
      targetSlug: 'blog-post-series',
      title: 'Content Marketing Series',
      description: 'Create and promote blog post series on growth strategies',
      approvedAt: '2025-10-17T14:00:00Z',
      executedAt: '2025-10-17T15:00:00Z',
      status: 'completed',
      budget: 1500,
      expectedROI: 4.2
    },
    {
      actionId: 'action-004',
      actionType: 'social',
      targetSlug: 'linkedin-campaign',
      title: 'LinkedIn Social Media Campaign',
      description: 'LinkedIn campaign to promote thought leadership content',
      approvedAt: '2025-10-18T08:00:00Z',
      executedAt: '2025-10-18T09:00:00Z',
      status: 'completed',
      budget: 800,
      expectedROI: 3.1
    },
    {
      actionId: 'action-005',
      actionType: 'email',
      targetSlug: 'newsletter-series',
      title: 'Email Newsletter Campaign',
      description: 'Automated email series for lead nurturing',
      approvedAt: '2025-10-19T12:00:00Z',
      executedAt: '2025-10-19T13:00:00Z',
      status: 'completed',
      budget: 300,
      expectedROI: 5.5
    }
  ];
}

/**
 * Fetch attribution data from GA4
 * 
 * ANALYTICS-023: Query GA4 for attribution data with hd_action_key custom dimension
 */
async function fetchAttributionData(startDate: string, endDate: string, gaConfig: any) {
  try {
    const client = createDirectGaClient();
    const propertyId = gaConfig.propertyId;

    // Query GA4 for attribution data
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        { name: 'customEvent:hd_action_key' },
        { name: 'date' },
        { name: 'source' },
        { name: 'medium' },
      ],
      metrics: [
        { name: 'conversions' },
        { name: 'totalRevenue' },
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'eventCount' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'customEvent:hd_action_key',
          stringFilter: {
            matchType: 'CONTAINS',
            value: 'action-',
          },
        },
      },
    });

    // Transform GA4 response to our format
    return response.rows?.map(row => ({
      actionKey: row.dimensionValues?.[0]?.value,
      date: row.dimensionValues?.[1]?.value,
      source: row.dimensionValues?.[2]?.value,
      medium: row.dimensionValues?.[3]?.value,
      conversions: parseInt(row.metricValues?.[0]?.value || '0'),
      revenue: parseFloat(row.metricValues?.[1]?.value || '0'),
      sessions: parseInt(row.metricValues?.[2]?.value || '0'),
      users: parseInt(row.metricValues?.[3]?.value || '0'),
      events: parseInt(row.metricValues?.[4]?.value || '0'),
      timestamp: new Date(row.dimensionValues?.[1]?.value || '').toISOString(),
    })) || [];

  } catch (error) {
    console.error('Error fetching attribution data from GA4:', error);
    // Return mock data if GA4 query fails
    return getMockAttributionData();
  }
}

/**
 * Get default start date (28 days ago)
 */
function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 28);
  return date.toISOString().split('T')[0];
}

/**
 * Get default end date (today)
 */
function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Mock growth engine analytics for development
 */
function getMockGrowthEngineAnalytics(): GrowthEngineAnalytics {
  return {
    period: {
      start: getDefaultStartDate(),
      end: getDefaultEndDate(),
    },
    summary: {
      totalActions: 5,
      totalRevenue: 125000,
      totalConversions: 450,
      averageROI: 3.8,
      topPerformingAction: {
        actionId: 'action-005',
        actionType: 'email',
        targetSlug: 'newsletter-series',
        title: 'Email Newsletter Campaign',
        description: 'Automated email series for lead nurturing',
        approvedAt: '2025-10-19T12:00:00Z',
        executedAt: '2025-10-19T13:00:00Z',
        status: 'completed',
        budget: 300,
        expectedROI: 5.5
      },
      overallEfficiency: 78.5,
    },
    attributionAnalysis: [
      {
        actionId: 'action-001',
        actionType: 'seo',
        targetSlug: 'growth-hacking-guide',
        attributionWindows: {
          '7d': { conversions: 25, revenue: 5000, sessions: 1200, users: 800, ctr: 2.1, conversionRate: 2.1, roas: 4.2, costPerConversion: 20, revenuePerDollar: 10 },
          '14d': { conversions: 45, revenue: 9000, sessions: 2100, users: 1400, ctr: 2.1, conversionRate: 2.1, roas: 4.2, costPerConversion: 20, revenuePerDollar: 10 },
          '28d': { conversions: 85, revenue: 17000, sessions: 4000, users: 2600, ctr: 2.1, conversionRate: 2.1, roas: 4.2, costPerConversion: 20, revenuePerDollar: 10 },
        },
        totalAttribution: { conversions: 85, revenue: 17000, sessions: 4000, users: 2600, ctr: 2.1, conversionRate: 2.1, roas: 4.2, costPerConversion: 20, revenuePerDollar: 10 },
        efficiency: { costPerConversion: 20, revenuePerDollar: 10, efficiencyScore: 85 },
      },
      {
        actionId: 'action-002',
        actionType: 'ads',
        targetSlug: 'product-launch',
        attributionWindows: {
          '7d': { conversions: 15, revenue: 3000, sessions: 800, users: 600, ctr: 1.8, conversionRate: 1.9, roas: 3.8, costPerConversion: 133, revenuePerDollar: 1.5 },
          '14d': { conversions: 28, revenue: 5600, sessions: 1500, users: 1100, ctr: 1.8, conversionRate: 1.9, roas: 3.8, costPerConversion: 133, revenuePerDollar: 1.5 },
          '28d': { conversions: 52, revenue: 10400, sessions: 2800, users: 2000, ctr: 1.8, conversionRate: 1.9, roas: 3.8, costPerConversion: 133, revenuePerDollar: 1.5 },
        },
        totalAttribution: { conversions: 52, revenue: 10400, sessions: 2800, users: 2000, ctr: 1.8, conversionRate: 1.9, roas: 3.8, costPerConversion: 133, revenuePerDollar: 1.5 },
        efficiency: { costPerConversion: 133, revenuePerDollar: 1.5, efficiencyScore: 65 },
      },
    ],
    performanceInsights: {
      bestPerformingType: 'email',
      worstPerformingType: 'ads',
      optimizationOpportunities: [
        '2 actions are underperforming and need optimization',
        '3 actions are performing excellently and should be scaled',
        '1 actions have high ROI and could benefit from increased budget'
      ],
      predictiveInsights: [
        '3 actions are showing strong recent performance trends',
        'Consider seasonal trends when planning future growth actions',
        'Monitor attribution windows to identify optimal timing for action execution'
      ],
    },
    recommendations: {
      scaleActions: ['action-001', 'action-003', 'action-005'],
      optimizeActions: ['action-002'],
      pauseActions: [],
      budgetRecommendations: [
        {
          actionId: 'action-001',
          currentBudget: 500,
          recommendedBudget: 750,
          expectedROI: 6.3
        },
        {
          actionId: 'action-003',
          currentBudget: 1500,
          recommendedBudget: 2250,
          expectedROI: 6.3
        },
        {
          actionId: 'action-005',
          currentBudget: 300,
          recommendedBudget: 450,
          expectedROI: 8.25
        }
      ],
    },
  };
}

/**
 * Mock attribution data for development
 */
function getMockAttributionData() {
  return [
    {
      actionKey: 'action-001',
      date: '2025-10-15',
      source: 'google',
      medium: 'organic',
      conversions: 25,
      revenue: 5000,
      sessions: 1200,
      users: 800,
      events: 2400,
      timestamp: '2025-10-15T00:00:00Z',
    },
    {
      actionKey: 'action-002',
      date: '2025-10-16',
      source: 'google',
      medium: 'cpc',
      conversions: 15,
      revenue: 3000,
      sessions: 800,
      users: 600,
      events: 1600,
      timestamp: '2025-10-16T00:00:00Z',
    },
    // Add more mock data as needed
  ];
}
