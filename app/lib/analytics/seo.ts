/**
 * SEO Performance Metrics
 * 
 * Track organic search performance, keywords, and rankings.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

export interface SEOMetrics {
  organicSessions: number;
  organicUsers: number;
  organicRevenue: number;
  organicConversions: number;
  organicConversionRate: number;
  topKeywords: Array<{
    keyword: string;
    sessions: number;
    bounceRate: number;
    conversions: number;
  }>;
  topLandingPages: Array<{
    page: string;
    sessions: number;
    bounceRate: number;
    avgDuration: number;
  }>;
  trend: {
    sessionsChange: number;
    revenueChange: number;
  };
}

export async function getSEOMetrics(
  dateRange?: { start: string; end: string }
): Promise<SEOMetrics> {
  const startTime = Date.now();
  
  try {
    const config = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = dateRange?.start || thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = dateRange?.end || today.toISOString().split('T')[0];

    // Fetch organic traffic metrics
    const [organicResponse] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'totalRevenue' },
        { name: 'conversions' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'sessionDefaultChannelGroup',
          stringFilter: {
            matchType: 'CONTAINS',
            value: 'Organic',
          },
        },
      },
    });

    const organicRow = organicResponse.rows?.[0];
    const organicSessions = parseInt(organicRow?.metricValues?.[0]?.value || '0', 10);
    const organicUsers = parseInt(organicRow?.metricValues?.[1]?.value || '0', 10);
    const organicRevenue = parseFloat(organicRow?.metricValues?.[2]?.value || '0');
    const organicConversions = parseInt(organicRow?.metricValues?.[3]?.value || '0', 10);
    const organicConversionRate = organicSessions > 0 
      ? (organicConversions / organicSessions) * 100 
      : 0;

    // Fetch top landing pages for organic traffic
    const [landingPagesResponse] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'landingPage' }],
      metrics: [
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'sessionDefaultChannelGroup',
          stringFilter: {
            matchType: 'CONTAINS',
            value: 'Organic',
          },
        },
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    const topLandingPages = (landingPagesResponse.rows || []).map((row) => ({
      page: row.dimensionValues?.[0]?.value || '/',
      sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
      bounceRate: parseFloat(row.metricValues?.[1]?.value || '0'),
      avgDuration: parseFloat(row.metricValues?.[2]?.value || '0'),
    }));

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getSEOMetrics', true, duration);

    return {
      organicSessions,
      organicUsers,
      organicRevenue,
      organicConversions,
      organicConversionRate,
      topKeywords: [], // GA4 doesn't provide keyword data by default
      topLandingPages,
      trend: {
        sessionsChange: 0, // TODO: Calculate trend
        revenueChange: 0,
      },
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getSEOMetrics', false, duration);
    throw error;
  }
}

