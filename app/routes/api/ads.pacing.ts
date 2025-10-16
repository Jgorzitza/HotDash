/**
 * Ads Pacing API Route
 *
 * Purpose: Return budget pacing analyses and alerts
 */

import { createAdapter, getAdapterConfig } from '../../lib/ads/adapters';
import type { AdPlatform } from '../../lib/ads/tracking';
import { computePacingAlerts } from '../../services/ads/pacing-monitor';
import { waitForRateLimit } from '../../middleware/rate-limit';
import { logAPICall } from '../../middleware/audit';

export async function loader({ request }: any) {
  const startTime = Date.now();
  const url = new URL(request.url);

  const platform = url.searchParams.get('platform') as AdPlatform | null;
  const dateStart = url.searchParams.get('dateStart') || getDefaultStartDate();
  const dateEnd = url.searchParams.get('dateEnd') || getDefaultEndDate();

  try {
    const config = getAdapterConfig((process.env.NODE_ENV as any) || 'development');
    const platforms: AdPlatform[] = platform ? [platform] : ['meta', 'google', 'tiktok'];

    const allCampaigns: any[] = [];
    for (const p of platforms) {
      const adapter = createAdapter(p, config);
      await waitForRateLimit('ga4');
      const campaigns = await adapter.fetchCampaigns(dateStart, dateEnd);
      allCampaigns.push(...campaigns);
    }

    const { pacings, alerts } = computePacingAlerts(allCampaigns);

    const resp = Response.json({
      pacings,
      alerts,
      meta: { platform: platform || 'all', dateStart, dateEnd, count: pacings.length },
    });

    await logAPICall({
      scope: 'ads-api',
      actor: 'system',
      action: 'fetch_pacing',
      request: { method: request.method, url: request.url },
      response: { status: 200 },
      timing: { startTime, endTime: Date.now(), durationMs: Date.now() - startTime },
      payload: { dateStart, dateEnd, platform: platform || 'all' },
    });

    return resp;
  } catch (error) {
    const resp = Response.json(
      {
        error: 'Failed to compute pacing',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );

    await logAPICall({
      scope: 'ads-api',
      actor: 'system',
      action: 'fetch_pacing',
      request: { method: request.method, url: request.url },
      response: { status: 500 },
      timing: { startTime, endTime: Date.now(), durationMs: Date.now() - startTime },
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

