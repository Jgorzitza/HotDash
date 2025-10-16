/**
 * API Route: Dashboard Tiles
 * 
 * GET /api/dashboard/tiles
 * 
 * Returns all dashboard tile data in standardized format.
 */



export async function loader({ request }: any) {
  try {
    const { loadDashboardTiles } = await import('../lib/analytics/loaders.ts');
    const data = await loadDashboardTiles();

    return Response.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Dashboard tiles error:', error);
    
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to load dashboard tiles',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

