/**
 * Ads Recommendations API Route
 *
 * Purpose: API endpoint for generating campaign recommendations (HITL)
 * Owner: ads agent
 * Date: 2025-10-16
 */

import { createAdapter, getAdapterConfig } from '../../lib/ads/adapters';
import { generateRecommendations, type BudgetConstraint } from '../../services/ads/recommendations';
import { adsTelemetry } from '../../lib/ads/telemetry';
import { waitForRateLimit } from '../../middleware/rate-limit';
import { logAPICall } from '../../middleware/audit';
import { createSupabaseClient } from '../../lib/supabase/client';

export async function loader({ request }: any) {
  const startTime = Date.now();
  const url = new URL(request.url);

  const totalBudget = parseFloat(url.searchParams.get('totalBudget') || '10000');
  const dateStart = url.searchParams.get('dateStart') || getDefaultStartDate();
  const dateEnd = url.searchParams.get('dateEnd') || getDefaultEndDate();

  try {
    // Fetch current campaigns
    const config = getAdapterConfig((process.env.NODE_ENV as any) || 'development');
    const platforms: Array<'meta' | 'google' | 'tiktok'> = ['meta', 'google', 'tiktok'];

    const allCampaigns = [] as any[];
    for (const platform of platforms) {
      const adapter = createAdapter(platform, config);
      await waitForRateLimit('ga4');
      const campaigns = await adapter.fetchCampaigns(dateStart, dateEnd);
      allCampaigns.push(...campaigns);
    }

    // Generate recommendations
    const constraint: BudgetConstraint = {
      totalBudget,
      minBudgetPerCampaign: 100,
    };

    const recommendations = generateRecommendations(allCampaigns, constraint);

    // Record telemetry
    const duration = Date.now() - startTime;
    adsTelemetry.recordEvent({
      eventType: 'calculation',
      operation: 'generate_recommendations',
      durationMs: duration,
      metadata: { recommendationCount: recommendations.recommendations.length },
    });

    // Persist recommendations batch (best-effort)
    try {
      const supa = createSupabaseClient(true);
      const rows = recommendations.recommendations.map((r) => ({
        recommendation_id: r.recommendationId,
        type: r.type,
        priority: r.priority,
        campaign_id: r.campaignId ?? null,
        campaign_name: r.campaignName ?? null,
        platform: r.platform,
        title: r.title,
        description: r.description,
        reasoning: r.reasoning,
        evidence: r.evidence,
        action: r.action,
        requires_approval: r.requiresApproval,
        estimated_impact: r.estimatedImpact,
        confidence: r.confidence,
        status: 'pending',
      }));
      if (rows.length > 0) {
        await supa.from('ads_recommendations').upsert(rows, { onConflict: 'recommendation_id' });
      }
    } catch (dbErr) {
      // Swallow errors; UI remains functional without persistence
    }

    const resp = Response.json({
      ...recommendations,
      meta: {
        dateStart,
        dateEnd,
        totalBudget,
        campaignCount: allCampaigns.length,
      },
    });

    await logAPICall({
      scope: 'ads-api',
      actor: 'system',
      action: 'generate_recommendations',
      request: { method: request.method, url: request.url },
      response: { status: 200 },
      timing: { startTime, endTime: Date.now(), durationMs: Date.now() - startTime },
      payload: { dateStart, dateEnd, totalBudget },
    });

    return resp;
  } catch (error) {
    const duration = Date.now() - startTime;

    adsTelemetry.recordEvent({
      eventType: 'error',
      operation: 'generate_recommendations',
      durationMs: duration,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    const resp = Response.json(
      {
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );


    await logAPICall({
      scope: 'ads-api',
      actor: 'system',
      action: 'generate_recommendations',
      request: { method: request.method, url: request.url },
      response: { status: 500 },
      timing: { startTime, endTime: Date.now(), durationMs: duration },
      error: { message: error instanceof Error ? error.message : String(error) },
    });

    return resp;
  }
}

export async function action({ request }: any) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { recommendationId, action, feedback } = body;

    // TODO: Store approval/rejection in Supabase
    // This would record:
    // - recommendationId
    // - action (approve/reject)
    // - feedback (optional human feedback)
    // - timestamp
    // - user who approved/rejected

    // Persist approval/rejection (best-effort)
    try {
      const supa = createSupabaseClient(true);
      const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';
      const patch: any = { status: newStatus, feedback: feedback ?? null };
      if (newStatus === 'approved') patch.approved_at = new Date().toISOString();
      await supa
        .from('ads_recommendations')
        .update(patch)
        .eq('recommendation_id', recommendationId);
    } catch (dbErr) {
      // swallow persistence errors
    }

    adsTelemetry.recordEvent({
      eventType: 'api_call',
      operation: 'recommendation_action',
      durationMs: Date.now() - startTime,
      metadata: { recommendationId, action },
    });

    const resp = Response.json({
      success: true,
      recommendationId,
      action,
      message: `Recommendation ${action}ed successfully`,
    });

    await logAPICall({
      scope: 'ads-api',
      actor: 'system',
      action: 'recommendation_action',
      request: { method: request.method, url: request.url },
      response: { status: 200 },
      timing: { startTime, endTime: Date.now(), durationMs: Date.now() - startTime },
      payload: { recommendationId, action, feedback },
    });

    return resp;
  } catch (error) {
    const resp = Response.json(
      {
        error: 'Failed to process recommendation action',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );

    await logAPICall({
      scope: 'ads-api',
      actor: 'system',
      action: 'recommendation_action',
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

