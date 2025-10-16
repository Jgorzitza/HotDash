/**
 * Exit Page Analysis
 * 
 * Track pages where users exit the site.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

export interface ExitPageMetrics {
  pagePath: string;
  exits: number;
  pageViews: number;
  exitRate: number;
  sessions: number;
}

export async function getExitPages(
  dateRange?: { start: string; end: string }
): Promise<ExitPageMetrics[]> {
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
        { name: 'exits' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
      ],
      orderBys: [{ metric: { metricName: 'exits' }, desc: true }],
      limit: 20,
    });

    const exitPages: ExitPageMetrics[] = (response.rows || []).map((row) => {
      const pagePath = row.dimensionValues?.[0]?.value || '/';
      const exits = parseInt(row.metricValues?.[0]?.value || '0', 10);
      const pageViews = parseInt(row.metricValues?.[1]?.value || '0', 10);
      const sessions = parseInt(row.metricValues?.[2]?.value || '0', 10);
      const exitRate = pageViews > 0 ? (exits / pageViews) * 100 : 0;

      return {
        pagePath,
        exits,
        pageViews,
        exitRate,
        sessions,
      };
    });

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getExitPages', true, duration);

    return exitPages;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getExitPages', false, duration);
    throw error;
  }
}

