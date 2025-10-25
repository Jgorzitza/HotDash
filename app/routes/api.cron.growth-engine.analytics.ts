/**
 * Daily Analytics Agent Cron Job
 * 
 * POST /api/cron/growth-engine/analytics
 * 
 * Runs daily analytics analysis to identify high-value opportunities.
 * Analyzes GSC and GA4 data to populate the Action Queue.
 * 
 * Schedule: Daily at 3 AM UTC
 * 
 * @module routes/api/cron/growth-engine/analytics
 */

import { type ActionFunctionArgs } from "react-router";
import { SpecialistAgents } from "~/lib/growth-engine/specialist-agents";
import { logDecision } from "~/services/decisions.server";

export async function action({ request }: ActionFunctionArgs) {
  const startTime = Date.now();

  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET || 'default-cron-secret';
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized cron request",
        },
        { status: 401 }
      );
    }


    // Initialize specialist agents
    const specialists = new SpecialistAgents();

    // Run analytics agent
    const actions = await specialists.runAgent('analytics');

    const duration = Date.now() - startTime;

    // Log to decision log
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'daily_analysis_completed',
      status: 'completed',
      rationale: `Analytics agent completed daily analysis, generated ${actions.length} actions`,
      payload: {
        actionsGenerated: actions.length,
        durationMs: duration,
        timestamp: new Date().toISOString(),
      },
    });


    return Response.json({
      success: true,
      actionsGenerated: actions.length,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[Analytics Agent] Error:', errorMessage);

    // Log error to decision log
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'daily_analysis_failed',
      status: 'error',
      rationale: `Analytics agent failed: ${errorMessage}`,
      payload: {
        error: errorMessage,
        durationMs: duration,
        timestamp: new Date().toISOString(),
      },
    });

    return Response.json(
      {
        success: false,
        error: errorMessage,
        durationMs: duration,
      },
      { status: 500 }
    );
  }
}

