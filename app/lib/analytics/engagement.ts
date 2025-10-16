/**
 * Engagement Metrics
 * 
 * Track time-on-page, scroll depth, and user engagement.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

export interface EngagementMetrics {
  pagePath: string;
  avgTimeOnPage: number;
  avgScrollDepth: number;
  engagementRate: number;
  engagedSessions: number;
  totalSessions: number;
}

export async function getEngagementMetrics(
  dateRange?: { start: string; end: string }
): Promise<EngagementMetrics[]> {
  const startTime = Date.now();
  
  try {
    const config = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = dateRange?.start || thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = dateRange?.end || today.toISOString().split('T')[0];

    const [response] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'userEngagementDuration' },
        { name: 'engagedSessions' },
        { name: 'sessions' },
        { name: 'engagementRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 50,
    });

    const engagement: EngagementMetrics[] = (response.rows || []).map((row) => {
      const pagePath = row.dimensionValues?.[0]?.value || '/';
      const totalEngagementDuration = parseFloat(row.metricValues?.[0]?.value || '0');
      const engagedSessions = parseInt(row.metricValues?.[1]?.value || '0', 10);
      const totalSessions = parseInt(row.metricValues?.[2]?.value || '0', 10);
      const engagementRate = parseFloat(row.metricValues?.[3]?.value || '0');

      const avgTimeOnPage = totalSessions > 0 ? totalEngagementDuration / totalSessions : 0;

      return {
        pagePath,
        avgTimeOnPage,
        avgScrollDepth: 0, // GA4 doesn't provide scroll depth by default
        engagementRate,
        engagedSessions,
        totalSessions,
      };
    });

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getEngagementMetrics', true, duration);

    return engagement;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getEngagementMetrics', false, duration);
    throw error;
  }
}

