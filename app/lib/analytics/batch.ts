/**
 * Batch Query Optimization
 * 
 * Batch multiple GA4 queries for better performance.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

export interface BatchQuery {
  name: string;
  dimensions: string[];
  metrics: string[];
  filters?: any;
}

export interface BatchResult {
  name: string;
  data: any[];
  error?: string;
}

export async function executeBatchQueries(
  queries: BatchQuery[],
  dateRange: { start: string; end: string }
): Promise<BatchResult[]> {
  const startTime = Date.now();
  
  try {
    const config = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    // Execute all queries in parallel
    const promises = queries.map(async (query) => {
      try {
        const [response] = await client.runReport({
          property: `properties/${config.propertyId}`,
          dateRanges: [dateRange],
          dimensions: query.dimensions.map(name => ({ name })),
          metrics: query.metrics.map(name => ({ name })),
          dimensionFilter: query.filters,
        });

        const data = (response.rows || []).map((row) => {
          const result: any = {};
          
          query.dimensions.forEach((dim, index) => {
            result[dim] = row.dimensionValues?.[index]?.value || '';
          });
          
          query.metrics.forEach((metric, index) => {
            const value = row.metricValues?.[index]?.value || '0';
            result[metric] = parseFloat(value);
          });
          
          return result;
        });

        return { name: query.name, data };
      } catch (error: any) {
        return { name: query.name, data: [], error: error.message };
      }
    });

    const results = await Promise.all(promises);

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('executeBatchQueries', true, duration);

    return results;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('executeBatchQueries', false, duration);
    throw error;
  }
}

