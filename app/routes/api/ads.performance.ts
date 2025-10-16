/**
 * Ads Performance API Route
 *
 * Purpose: API endpoint for fetching ad performance data
 * Owner: ads agent
 * Date: 2025-10-16
 */

import { createAdapter, getAdapterConfig } from '../../lib/ads/adapters';
import { calculateCampaignPerformance, aggregateCampaignPerformance } from '../../lib/ads/tracking';
import { campaignPerformanceCache } from '../../lib/ads/caching';
import { adsTelemetry } from '../../lib/ads/telemetry';
import { checkPerformanceBudget } from '../../lib/ads/performance-budget';
import type { AdPlatform } from '../../lib/ads/tracking';
import { waitForRateLimit } from '../../middleware/rate-limit';
import { trackCacheOperation } from '../../metrics/prometheus.server';
import { logAPICall } from '../../middleware/audit';

export async function loader({ request }: any) {
  const startTime = Date.now();
  const url = new URL(request.url);

  // Parse query parameters
  const platform = url.searchParams.get('platform') as AdPlatform | null;
  const dateStart = url.searchParams.get('dateStart') || getDefaultStartDate();
  const dateEnd = url.searchParams.get('dateEnd') || getDefaultEndDate();
  const campaignId = url.searchParams.get('campaignId');

  try {
    // Check cache first
    const cacheKey = `performance_${platform || 'all'}_${dateStart}_${dateEnd}_${campaignId || 'all'}`;
    const cached = campaignPerformanceCache.get(cacheKey);

    if (cached) {
      trackCacheOperation('campaignPerformanceCache', true);
      adsTelemetry.recordEvent({
        eventType: 'cache_hit',
        operation: 'fetch_performance',
        durationMs: Date.now() - startTime,
      });

      const resp = Response.json(cached);
      await logAPICall({
        scope: 'ads-api',
        actor: 'system',
        action: 'fetch_performance',
        request: { method: request.method, url: request.url },
        response: { status: 200 },
        timing: { startTime, endTime: Date.now(), durationMs: Date.now() - startTime },
      });
      return resp;
    }

    // Fetch from adapters
    const config = getAdapterConfig((process.env.NODE_ENV as any) || 'development');
    const platforms: AdPlatform[] = platform ? [platform] : ['meta', 'google', 'tiktok'];

    const allCampaigns = [] as any[];
    for (const p of platforms) {
      const adapter = createAdapter(p, config);

      if (campaignId) {
        await waitForRateLimit('ga4');
        const campaign = await adapter.fetchCampaignById(campaignId);
        allCampaigns.push(campaign);
      } else {
        await waitForRateLimit('ga4');
        const campaigns = await adapter.fetchCampaigns(dateStart, dateEnd);
        allCampaigns.push(...campaigns);
      }
    }

    // Calculate performance
    const campaignsWithPerformance = allCampaigns.map(calculateCampaignPerformance);
    const aggregated = aggregateCampaignPerformance(allCampaigns);

    const response = {
      campaigns: campaignsWithPerformance,
      aggregated,
      meta: {
        dateStart,
        dateEnd,
        platform: platform || 'all',
        count: campaignsWithPerformance.length,
      },
    };

    // Cache the result
    campaignPerformanceCache.set(cacheKey, response);
    trackCacheOperation('campaignPerformanceCache', false);

    // Record telemetry
    const duration = Date.now() - startTime;
    adsTelemetry.recordEvent({
      eventType: 'api_call',
      operation: 'fetch_performance',
      durationMs: duration,
      metadata: { platform, campaignCount: allCampaigns.length },
    });

    // Check performance budget
    const perfCheck = checkPerformanceBudget('/api/ads/performance', duration);
    if (!perfCheck.withinBudget) {
      console.warn('Performance budget exceeded:', perfCheck.violations);
    }

    const resp = Response.json(response);
    await logAPICall({
      scope: 'ads-api',
      actor: 'system',
      action: 'fetch_performance',
      request: { method: request.method, url: request.url },
      response: { status: 200 },
      timing: { startTime, endTime: Date.now(), durationMs: Date.now() - startTime },
      payload: { platform: platform || 'all', dateStart, dateEnd },
    });
    return resp;

  } catch (error) {
    const duration = Date.now() - startTime;

    adsTelemetry.recordEvent({
      eventType: 'error',
      operation: 'fetch_performance',
      durationMs: duration,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    const resp = Response.json(
      {
        error: 'Failed to fetch ad performance',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );

    await logAPICall({
      scope: 'ads-api',
      actor: 'system',
      action: 'fetch_performance',
      request: { method: request.method, url: request.url },
      response: { status: 500 },
      timing: { startTime, endTime: Date.now(), durationMs: duration },
      error: { message: error instanceof Error ? error.message : String(error) },
    });

    return resp;
  }
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
}

function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0];
}

