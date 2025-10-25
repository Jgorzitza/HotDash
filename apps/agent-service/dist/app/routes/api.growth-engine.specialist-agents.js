/**
 * Growth Engine Specialist Agents API
 *
 * Provides endpoints for running specialist agents and managing their outputs
 */
import { SpecialistAgentOrchestrator } from "~/lib/growth-engine/specialist-agents";
// SECURITY FIX: Removed unsafe createDbShim function that used $queryRawUnsafe
// Use Prisma's type-safe query methods or $queryRaw with template literals instead
// ============================================================================
// GET /api/growth-engine/specialist-agents
// ============================================================================
export async function loader({ request }) {
    const prisma = (await import("~/db.server")).default;
    const { Prisma } = await import("@prisma/client");
    const url = new URL(request.url);
    const agent = url.searchParams.get('agent');
    const status = url.searchParams.get('status') || 'all';
    try {
        if (agent) {
            // Get specific agent runs - SECURITY FIX: Use $queryRaw with template literals
            const rows = await prisma.$queryRaw `
        SELECT * FROM specialist_agent_runs
        WHERE agent_name = ${agent}
        ORDER BY start_time DESC
        LIMIT 10
      `;
            return Response.json({
                success: true,
                data: rows
            });
        }
        else {
            // Get all agent runs - SECURITY FIX: Use $queryRaw with template literals
            const rows = await prisma.$queryRaw `
        SELECT * FROM specialist_agent_runs
        ORDER BY start_time DESC
        LIMIT 50
      `;
            return Response.json({
                success: true,
                data: rows
            });
        }
    }
    catch (error) {
        console.error('Error fetching specialist agent runs:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch specialist agent runs'
        }, { status: 500 });
    }
}
// ============================================================================
// POST /api/growth-engine/specialist-agents
// ============================================================================
export async function action({ request }) {
    const prisma = (await import("~/db.server")).default;
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    try {
        const body = await request.json();
        const { action, agent, runType } = body;
        switch (action) {
            case 'run':
                return await runSpecialistAgent(prisma, agent, runType);
            case 'run_all':
                return await runAllSpecialistAgents(prisma);
            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    }
    catch (error) {
        console.error('Error processing specialist agent request:', error);
        return Response.json({
            success: false,
            error: 'Failed to process request'
        }, { status: 500 });
    }
}
async function runSpecialistAgent(prisma, agentName, runType = 'manual') {
    const { Prisma } = await import("@prisma/client");
    try {
        // Start agent run - SECURITY FIX: Use $queryRaw with template literals
        const runRows = await prisma.$queryRaw `
      INSERT INTO specialist_agent_runs (agent_name, run_type, status, start_time)
      VALUES (${agentName}, ${runType}, 'running', NOW())
      RETURNING *
    `;
        const runId = runRows[0].id;
        try {
            // Run the specific agent
            const orchestrator = new SpecialistAgentOrchestrator();
            const actions = await orchestrator.runAgent(agentName);
            // Store actions in action_queue - SECURITY FIX: Use $queryRaw with template literals
            for (const action of actions) {
                await prisma.$queryRaw `
          INSERT INTO action_queue (
            type, target, draft, evidence, expected_impact, confidence,
            ease, risk_tier, can_execute, rollback_plan, freshness_label, agent
          ) VALUES (
            ${action.type}, ${action.target}, ${action.draft}, ${JSON.stringify(action.evidence)},
            ${JSON.stringify(action.expected_impact)}, ${action.confidence}, ${action.ease},
            ${action.risk_tier}, ${action.can_execute}, ${action.rollback_plan},
            ${action.freshness_label}, ${action.agent}
          )
        `;
            }
            // Update run status - SECURITY FIX: Use $queryRaw with template literals
            await prisma.$queryRaw `
        UPDATE specialist_agent_runs
        SET status = 'completed', end_time = NOW(), actions_emitted = ${actions.length}
        WHERE id = ${runId}
      `;
            return Response.json({
                success: true,
                data: {
                    runId,
                    agent: agentName,
                    actionsEmitted: actions.length,
                    status: 'completed'
                },
                message: `${agentName} agent completed successfully`
            });
        }
        catch (error) {
            // Update run status to failed - SECURITY FIX: Use $queryRaw with template literals
            await prisma.$queryRaw `
        UPDATE specialist_agent_runs
        SET status = 'failed', end_time = NOW(), error_message = ${error.message}
        WHERE id = ${runId}
      `;
            throw error;
        }
    }
    catch (error) {
        console.error(`Error running ${agentName} agent:`, error);
        return Response.json({
            success: false,
            error: `Failed to run ${agentName} agent`
        }, { status: 500 });
    }
}
async function runAllSpecialistAgents(prisma) {
    const { Prisma } = await import("@prisma/client");
    try {
        const orchestrator = new SpecialistAgentOrchestrator();
        const allActions = await orchestrator.runAllAgents();
        // Store all actions in action_queue - SECURITY FIX: Use $queryRaw with template literals
        for (const action of allActions) {
            await prisma.$queryRaw `
        INSERT INTO action_queue (
          type, target, draft, evidence, expected_impact, confidence,
          ease, risk_tier, can_execute, rollback_plan, freshness_label, agent
        ) VALUES (
          ${action.type}, ${action.target}, ${action.draft}, ${JSON.stringify(action.evidence)},
          ${JSON.stringify(action.expected_impact)}, ${action.confidence}, ${action.ease},
          ${action.risk_tier}, ${action.can_execute}, ${action.rollback_plan},
          ${action.freshness_label}, ${action.agent}
        )
      `;
        }
        return Response.json({
            success: true,
            data: {
                totalActions: allActions.length,
                agentsRun: ['analytics', 'inventory', 'content-seo-perf', 'risk']
            },
            message: 'All specialist agents completed successfully'
        });
    }
    catch (error) {
        console.error('Error running all specialist agents:', error);
        return Response.json({
            success: false,
            error: 'Failed to run all specialist agents'
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.growth-engine.specialist-agents.js.map