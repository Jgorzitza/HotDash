/**
 * Custom Reports API
 * 
 * Generate custom analytics reports with flexible dimensions and metrics.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

export interface ReportConfig {
  name: string;
  dimensions: string[];
  metrics: string[];
  dateRange: { start: string; end: string };
  filters?: any[];
  orderBy?: { metric?: string; dimension?: string; desc?: boolean };
  limit?: number;
}

export interface ReportResult {
  name: string;
  data: any[];
  summary: {
    totalRows: number;
    dateRange: { start: string; end: string };
    generatedAt: string;
  };
}

export async function generateCustomReport(config: ReportConfig): Promise<ReportResult> {
  const startTime = Date.now();
  
  try {
    const gaConfig = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    const request: any = {
      property: `properties/${gaConfig.propertyId}`,
      dateRanges: [{ 
        startDate: config.dateRange.start, 
        endDate: config.dateRange.end 
      }],
      dimensions: config.dimensions.map(name => ({ name })),
      metrics: config.metrics.map(name => ({ name })),
      limit: config.limit || 100,
    };

    if (config.orderBy) {
      if (config.orderBy.metric) {
        request.orderBys = [{
          metric: { metricName: config.orderBy.metric },
          desc: config.orderBy.desc !== false,
        }];
      } else if (config.orderBy.dimension) {
        request.orderBys = [{
          dimension: { dimensionName: config.orderBy.dimension },
          desc: config.orderBy.desc !== false,
        }];
      }
    }

    const [response] = await client.runReport(request);

    const data = (response.rows || []).map((row) => {
      const result: any = {};
      
      config.dimensions.forEach((dim, index) => {
        result[dim] = row.dimensionValues?.[index]?.value || '';
      });
      
      config.metrics.forEach((metric, index) => {
        const value = row.metricValues?.[index]?.value || '0';
        result[metric] = metric.includes('Rate') || metric.includes('Percentage')
          ? parseFloat(value)
          : metric.includes('Revenue') || metric.includes('Value')
          ? parseFloat(value)
          : parseInt(value, 10);
      });
      
      return result;
    });

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('generateCustomReport', true, duration);

    return {
      name: config.name,
      data,
      summary: {
        totalRows: data.length,
        dateRange: config.dateRange,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('generateCustomReport', false, duration);
    throw error;
  }
}

// Predefined report templates
export const REPORT_TEMPLATES = {
  topPages: {
    name: 'Top Pages Report',
    dimensions: ['pagePath', 'pageTitle'],
    metrics: ['screenPageViews', 'averageSessionDuration', 'bounceRate'],
    orderBy: { metric: 'screenPageViews', desc: true },
    limit: 50,
  },
  trafficSources: {
    name: 'Traffic Sources Report',
    dimensions: ['sessionSource', 'sessionMedium', 'sessionCampaignName'],
    metrics: ['sessions', 'totalUsers', 'conversions'],
    orderBy: { metric: 'sessions', desc: true },
    limit: 50,
  },
  deviceBreakdown: {
    name: 'Device Breakdown Report',
    dimensions: ['deviceCategory', 'operatingSystem', 'browser'],
    metrics: ['sessions', 'bounceRate', 'averageSessionDuration'],
    orderBy: { metric: 'sessions', desc: true },
    limit: 50,
  },
  geographicReport: {
    name: 'Geographic Report',
    dimensions: ['country', 'city'],
    metrics: ['sessions', 'totalUsers', 'totalRevenue'],
    orderBy: { metric: 'sessions', desc: true },
    limit: 100,
  },
};

