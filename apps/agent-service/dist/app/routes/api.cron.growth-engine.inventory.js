/**
 * Hourly Inventory Agent Cron Job
 *
 * POST /api/cron/growth-engine/inventory
 *
 * Runs hourly inventory analysis to monitor stock levels and generate reorder proposals.
 * Populates the Action Queue with inventory actions.
 *
 * Schedule: Hourly
 *
 * @module routes/api/cron/growth-engine/inventory
 */
import { SpecialistAgents } from "~/lib/growth-engine/specialist-agents";
import { logDecision } from "~/services/decisions.server";
export async function action({ request }) {
    const startTime = Date.now();
    try {
        // Verify this is a legitimate cron request
        const authHeader = request.headers.get('authorization');
        const expectedAuth = process.env.CRON_SECRET || 'default-cron-secret';
        if (authHeader !== `Bearer ${expectedAuth}`) {
            return Response.json({
                success: false,
                error: "Unauthorized cron request",
            }, { status: 401 });
        }
        console.log('[Inventory Agent] Starting hourly analysis...');
        // Initialize specialist agents
        const specialists = new SpecialistAgents();
        // Run inventory agent
        const actions = await specialists.runAgent('inventory');
        const duration = Date.now() - startTime;
        // Log to decision log
        await logDecision({
            scope: 'build',
            actor: 'inventory',
            action: 'hourly_analysis_completed',
            status: 'completed',
            rationale: `Inventory agent completed hourly analysis, generated ${actions.length} actions`,
            payload: {
                actionsGenerated: actions.length,
                durationMs: duration,
                timestamp: new Date().toISOString(),
            },
        });
        console.log(`[Inventory Agent] Completed in ${duration}ms, generated ${actions.length} actions`);
        return Response.json({
            success: true,
            actionsGenerated: actions.length,
            durationMs: duration,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Inventory Agent] Error:', errorMessage);
        // Log error to decision log
        await logDecision({
            scope: 'build',
            actor: 'inventory',
            action: 'hourly_analysis_failed',
            status: 'error',
            rationale: `Inventory agent failed: ${errorMessage}`,
            payload: {
                error: errorMessage,
                durationMs: duration,
                timestamp: new Date().toISOString(),
            },
        });
        return Response.json({
            success: false,
            error: errorMessage,
            durationMs: duration,
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.cron.growth-engine.inventory.js.map