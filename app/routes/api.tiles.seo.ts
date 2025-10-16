/**
 * API Route: SEO Tile Data
 * 
 * GET /api/tiles/seo
 * 
 * Returns SEO tile data for dashboard
 * 
 * @module routes/api/tiles/seo
 */


import { loadSEOTile } from '../services/seo/tile-loader';

export async function loader({ request }: any) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop') || 'default-shop.myshopify.com';
    
    const tileState = await loadSEOTile({ shopDomain });
    
    return Response.json(tileState);
    
  } catch (error: any) {
    console.error('[API] SEO tile error:', error);
    
    return Response.json(
      {
        status: 'error',
        error: error.message || 'Failed to load SEO tile',
        fact: {
          id: Date.now(),
          createdAt: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

