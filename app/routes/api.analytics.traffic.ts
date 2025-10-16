/**
 * API Route: Analytics Traffic
 * 
 * GET /api/analytics/traffic
 * 
 * Returns traffic metrics for the last 30 days with trend comparison.
 * Used by dashboard tiles to display sessions, organic traffic, and SEO data.
 */



export async function loader({ request }: any) {
  try {
    const { getTrafficMetrics } = await import('../lib/analytics/ga4.ts');
    const metrics = await getTrafficMetrics();

    return Response.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Traffic metrics error:', error);
    
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to fetch traffic metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

