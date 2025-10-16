/**
 * Demographics & Device Analytics
 * 
 * Track device types, operating systems, browsers, and geographic data.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

export interface DeviceMetrics {
  deviceCategory: string;
  operatingSystem: string;
  browser: string;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
}

export interface GeoMetrics {
  country: string;
  city: string;
  sessions: number;
  users: number;
  revenue: number;
  conversions: number;
}

export async function getDeviceBreakdown(
  dateRange?: { start: string; end: string }
): Promise<DeviceMetrics[]> {
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
        { name: 'deviceCategory' },
        { name: 'operatingSystem' },
        { name: 'browser' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 50,
    });

    const devices: DeviceMetrics[] = (response.rows || []).map((row) => ({
      deviceCategory: row.dimensionValues?.[0]?.value || 'Unknown',
      operatingSystem: row.dimensionValues?.[1]?.value || 'Unknown',
      browser: row.dimensionValues?.[2]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
      users: parseInt(row.metricValues?.[1]?.value || '0', 10),
      bounceRate: parseFloat(row.metricValues?.[2]?.value || '0'),
      avgSessionDuration: parseFloat(row.metricValues?.[3]?.value || '0'),
      conversions: parseInt(row.metricValues?.[4]?.value || '0', 10),
    }));

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getDeviceBreakdown', true, duration);

    return devices;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getDeviceBreakdown', false, duration);
    throw error;
  }
}

export async function getGeoBreakdown(
  dateRange?: { start: string; end: string }
): Promise<GeoMetrics[]> {
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
        { name: 'country' },
        { name: 'city' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'totalRevenue' },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 100,
    });

    const geoData: GeoMetrics[] = (response.rows || []).map((row) => ({
      country: row.dimensionValues?.[0]?.value || 'Unknown',
      city: row.dimensionValues?.[1]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
      users: parseInt(row.metricValues?.[1]?.value || '0', 10),
      revenue: parseFloat(row.metricValues?.[2]?.value || '0'),
      conversions: parseInt(row.metricValues?.[3]?.value || '0', 10),
    }));

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getGeoBreakdown', true, duration);

    return geoData;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getGeoBreakdown', false, duration);
    throw error;
  }
}

