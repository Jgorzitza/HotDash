/**
 * API Route: SEO Anomalies
 * 
 * GET /api/seo/anomalies
 * 
 * Returns comprehensive SEO anomaly detection including:
 * - Traffic drops > 20% week-over-week (from GA4)
 * - Keyword ranking losses (from Search Console)
 * - Core Web Vitals failures (from CrUX/PageSpeed)
 * - Crawl errors (from Search Console)
 * 
 * Response includes severity classification (critical, warning, info)
 * and aggregated summary for dashboard tile display.
 * 
 * @module routes/api/seo/anomalies
 */


import { getLandingPageAnomalies } from '../services/ga/ingest';
import {
  detectTrafficAnomalies,
  detectRankingAnomalies,
  detectVitalsAnomalies,
  detectCrawlAnomalies,
  aggregateSEOAnomalies,
  type SEOAnomaly,
  type TrafficAnomalyInput,
  type RankingAnomalyInput,
  type VitalsAnomalyInput,
  type CrawlErrorInput,
} from '../lib/seo/anomalies';

/**
 * Mock data generators for Search Console and Core Web Vitals
 * TODO: Replace with real Search Console API integration
 */
function getMockRankingData(): RankingAnomalyInput[] {
  // In production, this would call Google Search Console API
  // For now, return empty array until Search Console integration is ready
  return [];
}

function getMockVitalsData(): VitalsAnomalyInput[] {
  // In production, this would call PageSpeed Insights API or CrUX API
  // For now, return empty array until vitals integration is ready
  return [];
}

function getMockCrawlErrors(): CrawlErrorInput[] {
  // In production, this would call Google Search Console API
  // For now, return empty array until Search Console integration is ready
  return [];
}

export async function loader({ request }: any) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop') || 'default-shop.myshopify.com';
    
    // Fetch traffic anomalies from GA4
    const gaResult = await getLandingPageAnomalies({ shopDomain });
    
    // Convert GA anomalies to TrafficAnomalyInput format
    const trafficInputs: TrafficAnomalyInput[] = gaResult.data
      .filter(item => item.isAnomaly)
      .map(item => ({
        landingPage: item.landingPage,
        currentSessions: item.sessions,
        previousSessions: Math.round(item.sessions / (1 + item.wowDelta)),
        wowDelta: item.wowDelta,
      }));

    // Detect all anomaly types
    const trafficAnomalies = detectTrafficAnomalies(trafficInputs);
    const rankingAnomalies = detectRankingAnomalies(getMockRankingData());
    const vitalsAnomalies = detectVitalsAnomalies(getMockVitalsData());
    const crawlAnomalies = detectCrawlAnomalies(getMockCrawlErrors());

    // Aggregate all anomalies
    const allAnomalies: SEOAnomaly[] = [
      ...trafficAnomalies,
      ...rankingAnomalies,
      ...vitalsAnomalies,
      ...crawlAnomalies,
    ];

    const aggregated = aggregateSEOAnomalies(allAnomalies);

    return Response.json({
      success: true,
      data: {
        anomalies: aggregated.all,
        critical: aggregated.critical,
        warning: aggregated.warning,
        info: aggregated.info,
        summary: aggregated.summary,
      },
      metadata: {
        shopDomain,
        timestamp: new Date().toISOString(),
        sources: {
          traffic: gaResult.source,
          ranking: 'mock',
          vitals: 'mock',
          crawl: 'mock',
        },
      },
    });
  } catch (error: any) {
    console.error('[API] SEO anomalies error:', error);
    
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to fetch SEO anomalies',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

