/**
 * Time-series Analytics
 * 
 * Track metrics over time (daily, weekly, monthly).
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

export interface TimeSeriesDataPoint {
  date: string;
  sessions: number;
  users: number;
  revenue: number;
  transactions: number;
  conversionRate: number;
}

export async function getTimeSeriesData(
  dateRange: { start: string; end: string },
  granularity: 'day' | 'week' | 'month' = 'day'
): Promise<TimeSeriesDataPoint[]> {
  const startTime = Date.now();
  
  try {
    const config = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    const [response] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate: dateRange.start, endDate: dateRange.end }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'totalRevenue' },
        { name: 'transactions' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    const dataPoints: TimeSeriesDataPoint[] = (response.rows || []).map((row) => {
      const date = row.dimensionValues?.[0]?.value || '';
      const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
      const users = parseInt(row.metricValues?.[1]?.value || '0', 10);
      const revenue = parseFloat(row.metricValues?.[2]?.value || '0');
      const transactions = parseInt(row.metricValues?.[3]?.value || '0', 10);
      const conversionRate = sessions > 0 ? (transactions / sessions) * 100 : 0;

      return {
        date: formatDate(date),
        sessions,
        users,
        revenue,
        transactions,
        conversionRate,
      };
    });

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getTimeSeriesData', true, duration);

    return dataPoints;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getTimeSeriesData', false, duration);
    throw error;
  }
}

function formatDate(dateStr: string): string {
  // Convert YYYYMMDD to YYYY-MM-DD
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  return dateStr;
}

