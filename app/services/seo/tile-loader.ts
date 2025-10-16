/**
 * SEO Tile Loader
 * 
 * Fetches and prepares SEO data for dashboard tiles
 * 
 * @module services/seo/tile-loader
 */

import { getLandingPageAnomalies } from '../ga/ingest';
import { detectTrafficAnomalies, aggregateSEOAnomalies } from '../../lib/seo/anomalies';
import { createSEOTileData, createSEOTileState } from './tile-data';
import type { TileState } from '../../components/tiles/TileCard';
import type { SEOTileData } from './tile-data';

export interface LoadSEOTileOptions {
  shopDomain: string;
  includeRankings?: boolean;
  sampleSize?: number; // Limit number of anomalies returned
  minSeverity?: 'critical' | 'warning' | 'info'; // Filter by minimum severity
}

/**
 * Load SEO tile data
 */
export async function loadSEOTile(
  options: LoadSEOTileOptions
): Promise<TileState<SEOTileData>> {
  try {
    const { shopDomain } = options;
    
    // Fetch traffic anomalies from GA4
    const gaResult = await getLandingPageAnomalies({ shopDomain });
    
    // Convert GA anomalies to detection format
    const trafficInputs = gaResult.data
      .filter(item => item.isAnomaly)
      .map(item => ({
        landingPage: item.landingPage,
        currentSessions: item.sessions,
        previousSessions: Math.round(item.sessions / (1 + item.wowDelta)),
        wowDelta: item.wowDelta,
      }));
    
    // Detect anomalies
    let trafficAnomalies = detectTrafficAnomalies(trafficInputs);

    // Apply severity filter if specified
    if (options.minSeverity) {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const minLevel = severityOrder[options.minSeverity];
      trafficAnomalies = trafficAnomalies.filter(a => severityOrder[a.severity] <= minLevel);
    }

    // Apply sampling if specified
    if (options.sampleSize && trafficAnomalies.length > options.sampleSize) {
      trafficAnomalies = trafficAnomalies.slice(0, options.sampleSize);
    }

    // TODO: Add ranking data when Search Console is integrated
    // For now, only use traffic anomalies
    const allAnomalies = trafficAnomalies;
    
    // Create tile data
    const tileData = createSEOTileData(allAnomalies);
    
    // Wrap in TileState
    return createSEOTileState(tileData, gaResult.source);
    
  } catch (error: any) {
    console.error('[SEO Tile Loader] Error:', error);
    
    return {
      status: 'error',
      error: error.message || 'Failed to load SEO data',
      fact: {
        id: Date.now(),
        createdAt: new Date().toISOString(),
      },
    };
  }
}

/**
 * Load SEO tile data with caching
 */
export async function loadSEOTileWithCache(
  options: LoadSEOTileOptions
): Promise<TileState<SEOTileData>> {
  const { seoCache } = await import('./cache');
  const cacheKey = `seo-tile:${options.shopDomain}`;

  // Check cache first
  const cached = seoCache.get<TileState<SEOTileData>>(cacheKey);
  if (cached) {
    return {
      ...cached,
      source: 'cache',
    };
  }

  // Fetch fresh data
  const fresh = await loadSEOTile(options);

  // Cache if successful
  if (fresh.status === 'ok' && fresh.data) {
    seoCache.set(cacheKey, fresh);
  }

  return fresh;
}

