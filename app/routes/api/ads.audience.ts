/**
 * Ads Audience Insights API Route
 *
 * Purpose: Analyze audience performance, overlap, lookalikes (read-only)
 */

import { analyzeAudiencePerformance, compareAudiences, detectAudienceOverlap, recommendLookalikeAudience, type AudienceMetrics } from '../../lib/ads/audience-insights';
import { logAPICall } from '../../middleware/audit';

export async function loader({ request }: any) {
  const startTime = Date.now();
  const url = new URL(request.url);

  try {
    // Optionally accept audience metrics via ?demo=true to generate mock
    const demo = url.searchParams.get('demo') === 'true';

    let metrics: AudienceMetrics[] = [];
    if (demo) {
      metrics = demoAudiences();
    } else {
      // No external fetch yet; expect clients to POST later if needed
      metrics = demoAudiences();
    }

    const performances = metrics.map(analyzeAudiencePerformance);
    const comparison = compareAudiences(performances);

    // Overlap demo: pick first two audiences
    const overlap = metrics.length >= 2
      ? detectAudienceOverlap(metrics[0].size, metrics[1].size, Math.floor(Math.min(metrics[0].size, metrics[1].size) * 0.3), metrics[0].audienceName, metrics[1].audienceName)
      : null;

    // Lookalike demo: recommend from top performer at 3% similarity
    const lookalike = recommendLookalikeAudience(comparison.topPerformer, 3);

    const resp = Response.json({ performances, comparison, overlap, lookalike });

    await logAPICall({
      scope: 'ads-api',
      actor: 'system',
      action: 'audience_insights',
      request: { method: request.method, url: request.url },
      response: { status: 200 },
      timing: { startTime, endTime: Date.now(), durationMs: Date.now() - startTime },
    });

    return resp;
  } catch (error) {
    const resp = Response.json(
      {
        error: 'Failed to compute audience insights',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );

    await logAPICall({
      scope: 'ads-api',
      actor: 'system',
      action: 'audience_insights',
      request: { method: request.method, url: request.url },
      response: { status: 500 },
      timing: { startTime, endTime: Date.now(), durationMs: Date.now() - startTime },
      error: { message: error instanceof Error ? error.message : String(error) },
    });

    return resp;
  }
}

function demoAudiences(): AudienceMetrics[] {
  return [
    { audienceId: 'a1', audienceName: 'Purchasers L90', type: 'custom', platform: 'meta', size: 120000, impressions: 500000, clicks: 6000, conversions: 450, adSpend: 12000, revenue: 72000 },
    { audienceId: 'a2', audienceName: 'ATC L30', type: 'custom', platform: 'meta', size: 90000, impressions: 300000, clicks: 4000, conversions: 200, adSpend: 9000, revenue: 27000 },
    { audienceId: 'a3', audienceName: 'LLA 1%', type: 'lookalike', platform: 'meta', size: 800000, impressions: 1500000, clicks: 12000, conversions: 600, adSpend: 30000, revenue: 90000 },
  ];
}

