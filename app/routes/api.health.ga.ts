/**
 * API Route: GA Service Health
 * 
 * GET /api/health/ga
 * 
 * Returns health status of GA4 service.
 */


import { isGAConfigured } from '../lib/analytics/mocks';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../config/ga.server';

export async function loader({ request }: any) {
  const configured = isGAConfigured();

  if (!configured) {
    return Response.json({
      status: 'degraded',
      configured: false,
      message: 'GA4 not configured, using mock data',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const config = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    // Quick health check - fetch minimal data
    const today = new Date().toISOString().split('T')[0];
    const [response] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate: today, endDate: today }],
      metrics: [{ name: 'sessions' }],
      limit: 1,
    });

    return Response.json({
      status: 'healthy',
      configured: true,
      propertyId: config.propertyId,
      lastSuccess: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return Response.json({
      status: 'unhealthy',
      configured: true,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

