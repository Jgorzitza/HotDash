/**
 * Daily Content/SEO/Performance Agent Cron Job
 *
 * POST /api/cron/growth-engine/content-seo-perf
 *
 * Runs daily content, SEO, and performance analysis.
 * Populates the Action Queue with optimization actions.
 *
 * Schedule: Daily at 4 AM UTC
 *
 * @module routes/api/cron/growth-engine/content-seo-perf
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
        console.log('[Content/SEO/Perf Agent] Starting daily analysis...');
        // Initialize specialist agents
        const specialists = new SpecialistAgents();
        // Run content/SEO/perf agent
        const actions = await specialists.runAgent('content-seo-perf');
        const duration = Date.now() - startTime;
        // Log to decision log
        await logDecision({
            scope: 'build',
            actor: 'content',
            action: 'daily_analysis_completed',
            status: 'completed',
            rationale: `Content/SEO/Perf agent completed daily analysis, generated ${actions.length} actions`,
            payload: {
                actionsGenerated: actions.length,
                durationMs: duration,
                timestamp: new Date().toISOString(),
            },
        });
        console.log(`[Content/SEO/Perf Agent] Completed in ${duration}ms, generated ${actions.length} actions`);
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
        console.error('[Content/SEO/Perf Agent] Error:', errorMessage);
        // Log error to decision log
        await logDecision({
            scope: 'build',
            actor: 'content',
            action: 'daily_analysis_failed',
            status: 'error',
            rationale: `Content/SEO/Perf agent failed: ${errorMessage}`,
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
//# sourceMappingURL=api.cron.growth-engine.content-seo-perf.js.map