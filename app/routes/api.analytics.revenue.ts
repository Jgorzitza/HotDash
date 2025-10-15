/**
 * API Route: Analytics Revenue
 * 
 * GET /api/analytics/revenue
 * 
 * Returns revenue metrics for the last 30 days with trend comparison.
 * Used by dashboard tiles to display revenue, AOV, and transaction data.
 */

import { json, type LoaderFunctionArgs } from 'react-router';
import { getRevenueMetrics } from '../../lib/analytics/ga4';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const metrics = await getRevenueMetrics();
    
    return json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Revenue metrics error:', error);
    
    return json(
      {
        success: false,
        error: error.message || 'Failed to fetch revenue metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

