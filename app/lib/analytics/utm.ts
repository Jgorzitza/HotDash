/**
 * UTM Campaign Tracking
 * 
 * Track UTM parameters (source, medium, campaign) for marketing attribution.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

export interface UTMMetrics {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  users: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  costPerConversion: number;
}

export async function getUTMBreakdown(
  dateRange?: { start: string; end: string }
): Promise<UTMMetrics[]> {
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
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
        { name: 'sessionCampaignName' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 100,
    });

    const utmData: UTMMetrics[] = (response.rows || []).map((row) => {
      const source = row.dimensionValues?.[0]?.value || '(direct)';
      const medium = row.dimensionValues?.[1]?.value || '(none)';
      const campaign = row.dimensionValues?.[2]?.value || '(not set)';
      const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
      const users = parseInt(row.metricValues?.[1]?.value || '0', 10);
      const conversions = parseInt(row.metricValues?.[2]?.value || '0', 10);
      const revenue = parseFloat(row.metricValues?.[3]?.value || '0');

      const conversionRate = sessions > 0 ? (conversions / sessions) * 100 : 0;
      const costPerConversion = conversions > 0 ? revenue / conversions : 0;

      return {
        source,
        medium,
        campaign,
        sessions,
        users,
        conversions,
        revenue,
        conversionRate,
        costPerConversion,
      };
    });

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getUTMBreakdown', true, duration);

    return utmData;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getUTMBreakdown', false, duration);
    throw error;
  }
}

