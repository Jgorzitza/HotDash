/**
 * API Route: SEO Anomaly Drill-Down
 * 
 * GET /api/seo/anomalies/:id
 * 
 * Returns detailed information about a specific anomaly
 * 
 * @module routes/api/seo/anomalies/$id
 */


import { getLandingPageAnomalies } from '../services/ga/ingest';
import { detectTrafficAnomalies } from '../lib/seo/anomalies';

export async function loader({ params, request }: any) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop') || 'default-shop.myshopify.com';
    
    if (!id) {
      return Response.json({ success: false, error: 'Anomaly ID required' }, { status: 400 });
    }
    
    // Fetch all anomalies
    const gaResult = await getLandingPageAnomalies({ shopDomain });
    
    const trafficInputs = gaResult.data
      .filter(item => item.isAnomaly)
      .map(item => ({
        landingPage: item.landingPage,
        currentSessions: item.sessions,
        previousSessions: Math.round(item.sessions / (1 + item.wowDelta)),
        wowDelta: item.wowDelta,
      }));
    
    const anomalies = detectTrafficAnomalies(trafficInputs);
    
    // Find specific anomaly
    const anomaly = anomalies.find(a => a.id === id);
    
    if (!anomaly) {
      return Response.json({ success: false, error: 'Anomaly not found' }, { status: 404 });
    }
    
    // Get historical data for this URL (mock for now)
    const historicalData = {
      last7Days: [
        { date: '2025-10-09', sessions: anomaly.metric.previous || 0 },
        { date: '2025-10-10', sessions: anomaly.metric.previous || 0 },
        { date: '2025-10-11', sessions: anomaly.metric.previous || 0 },
        { date: '2025-10-12', sessions: anomaly.metric.previous || 0 },
        { date: '2025-10-13', sessions: anomaly.metric.previous || 0 },
        { date: '2025-10-14', sessions: anomaly.metric.previous || 0 },
        { date: '2025-10-15', sessions: anomaly.metric.current },
      ],
    };
    
    // Get related anomalies (same URL or similar pattern)
    const relatedAnomalies = anomalies
      .filter(a => a.id !== id && a.affectedUrl === anomaly.affectedUrl)
      .slice(0, 5);
    
    return Response.json({
      success: true,
      data: {
        anomaly,
        historical: historicalData,
        related: relatedAnomalies,
        recommendations: [
          'Check for recent content changes on this page',
          'Review backlinks to this URL',
          'Verify page is still indexed in Google',
          'Check for technical SEO issues (speed, mobile-friendliness)',
          'Compare with competitor rankings for same keywords',
        ],
      },
      metadata: {
        shopDomain,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API] SEO anomaly drill-down error:', error);
    
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to fetch anomaly details',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

