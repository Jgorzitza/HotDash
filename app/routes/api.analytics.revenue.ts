/**
 * API Route: Analytics Revenue
 * 
 * GET /api/analytics/revenue
 * 
 * Returns revenue metrics for the last 30 days with trend comparison.
 * Used by dashboard tiles to display revenue, AOV, and transaction data.
 */


import { getRevenueMetrics } from '../../lib/analytics/ga4.ts';

export async function loader({ request }: any) {
  try {
    const metrics = await getRevenueMetrics();
    
    return Response.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Revenue metrics error:', error);
    
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to fetch revenue metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

