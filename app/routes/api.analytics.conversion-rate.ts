/**
 * API Route: Conversion Rate
 *
 * GET /api/analytics/conversion-rate
 *
 * Returns conversion rate metrics for dashboard tiles.
 */



export async function loader({ request }: any) {
  try {
    const { getConversionMetrics } = await import('../lib/analytics/ga4.ts');
    const metrics = await getConversionMetrics();


    return Response.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Conversion rate error:', error);

    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to fetch conversion rate',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

