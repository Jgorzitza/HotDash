/**
 * API Route: Analytics Traffic
 * 
 * GET /api/analytics/traffic
 * 
 * Returns traffic metrics for the last 30 days with trend comparison.
 * Used by dashboard tiles to display sessions, organic traffic, and SEO data.
 */

import { json, type LoaderFunctionArgs } from 'react-router';
import { getTrafficMetrics } from '../../lib/analytics/ga4';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const metrics = await getTrafficMetrics();
    
    return json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Traffic metrics error:', error);
    
    return json(
      {
        success: false,
        error: error.message || 'Failed to fetch traffic metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

