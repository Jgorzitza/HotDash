/**
 * Continuous Risk Agent Cron Job
 * 
 * POST /api/cron/growth-engine/risk
 * 
 * Runs continuous risk monitoring for fraud detection and compliance.
 * Populates the Action Queue with risk mitigation actions.
 * 
 * Schedule: Every 15 minutes
 * 
 * @module routes/api/cron/growth-engine/risk
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

    // Run risk agent
    const actions = await specialists.runAgent('risk');

    const duration = Date.now() - startTime;

    // Log to decision log (only if actions generated to avoid log spam)
    if (actions.length > 0) {
      await logDecision({
        scope: 'build',
        actor: 'support',
        action: 'risk_monitoring_completed',
        status: 'completed',
        rationale: `Risk agent completed monitoring, generated ${actions.length} actions`,
        payload: {
          actionsGenerated: actions.length,
          durationMs: duration,
          timestamp: new Date().toISOString(),
        },
      });
    }


    return Response.json({
      success: true,
      actionsGenerated: actions.length,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[Risk Agent] Error:', errorMessage);

    // Log error to decision log
    await logDecision({
      scope: 'build',
      actor: 'support',
      action: 'risk_monitoring_failed',
      status: 'error',
      rationale: `Risk agent failed: ${errorMessage}`,
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

