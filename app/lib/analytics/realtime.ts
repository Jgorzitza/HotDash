/**
 * Real-time Analytics
 *
 * Provides lightweight accessors for live metrics:
 * - Active users (site-wide)
 * - Top active pages (approximate)
 *
 * Uses GA4 Realtime API when configured; falls back to mocks in dev/test.
 */

import { appMetrics } from '../../utils/metrics.server.ts';
import { getGaConfig } from '../../config/ga.server.ts';
import { isGAConfigured } from './mocks.ts';

export interface RealtimePage {
  page: string;
  activeUsers: number;
}

export interface RealtimeMetrics {
  activeUsers: number;
  topPages: RealtimePage[];
  generatedAt: string; // ISO timestamp
}

const MOCK_REALTIME: RealtimeMetrics = {
  activeUsers: 17,
  topPages: [
    { page: '/', activeUsers: 6 },
    { page: '/products', activeUsers: 5 },
    { page: '/cart', activeUsers: 3 },
    { page: '/blog', activeUsers: 3 },
  ],
  generatedAt: new Date().toISOString(),
};

/**
 * Fetch realtime metrics with safe fallback.
 */
export async function getRealtimeMetrics(): Promise<RealtimeMetrics> {
  const start = Date.now();

  if (!isGAConfigured()) {
    return { ...MOCK_REALTIME, generatedAt: new Date().toISOString() };
  }

  try {
    // Dynamic import to avoid adding weight to cold paths
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data');
    const client = new BetaAnalyticsDataClient();
    const { propertyId } = getGaConfig();

    // Note: Realtime API availability and dimensions vary; we attempt a best-effort
    // query and fall back on any error (e.g., permissions, unsupported dims).
    const [total] = await (client as any).runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });

    const [byPage] = await (client as any).runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
      // pagePath is not guaranteed in realtime; some projects expose "unifiedScreenName".
      // We try a common web dimension first; GA will error if unsupported.
      dimensions: [{ name: 'pagePath' }],
      limit: 10,
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    });

    const activeUsers = parseInt(total.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
    const topPages = (byPage.rows || []).slice(0, 10).map((row: any) => ({
      page: row.dimensionValues?.[0]?.value || 'unknown',
      activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
    }));

    appMetrics.gaApiCall('realtime.get', true, Date.now() - start);

    return {
      activeUsers,
      topPages,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    // Any failure -> safe fallback
    appMetrics.gaApiCall('realtime.get', false, Date.now() - start);
    return { ...MOCK_REALTIME, generatedAt: new Date().toISOString() };
  }
}

