/**
 * Growth Engine Specialist Agents API
 * 
 * Provides endpoints for running specialist agents and managing their outputs
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { db } from "~/db.server";
import { SpecialistAgentOrchestrator } from "~/lib/growth-engine/specialist-agents";
import { createActionItem } from "~/lib/growth-engine/action-queue";

// ============================================================================
// GET /api/growth-engine/specialist-agents
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const agent = url.searchParams.get('agent');
  const status = url.searchParams.get('status') || 'all';
  
  try {
    if (agent) {
      // Get specific agent runs
      const { rows } = await db.query(
        `SELECT * FROM specialist_agent_runs 
         WHERE agent_name = $1 
         ORDER BY start_time DESC 
         LIMIT 10`,
        [agent]
      );
      
      return Response.json({
        success: true,
        data: rows
      });
    } else {
      // Get all agent runs
      const { rows } = await db.query(
        `SELECT * FROM specialist_agent_runs 
         ORDER BY start_time DESC 
         LIMIT 50`
      );
      
      return Response.json({
        success: true,
        data: rows
      });
    }
  } catch (error) {
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

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  
  try {
    const body = await request.json();
    const { action, agent, runType } = body;
    
    switch (action) {
      case 'run':
        return await runSpecialistAgent(agent, runType);
      case 'run_all':
        return await runAllSpecialistAgents();
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing specialist agent request:', error);
    return Response.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
}

async function runSpecialistAgent(agentName: string, runType: string = 'manual') {
  try {
    // Start agent run
    const { rows: runRows } = await db.query(
      `INSERT INTO specialist_agent_runs (agent_name, run_type, status, start_time)
       VALUES ($1, $2, 'running', NOW())
       RETURNING *`,
      [agentName, runType]
    );
    
    const runId = runRows[0].id;
    
    try {
      // Run the specific agent
      const orchestrator = new SpecialistAgentOrchestrator();
      const actions = await orchestrator.runAgent(agentName);
      
      // Store actions in action_queue
      for (const action of actions) {
        await db.query(
          `INSERT INTO action_queue (
            type, target, draft, evidence, expected_impact, confidence, 
            ease, risk_tier, can_execute, rollback_plan, freshness_label, agent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            action.type, action.target, action.draft, JSON.stringify(action.evidence),
            JSON.stringify(action.expected_impact), action.confidence, action.ease,
            action.risk_tier, action.can_execute, action.rollback_plan,
            action.freshness_label, action.agent
          ]
        );
      }
      
      // Update run status
      await db.query(
        `UPDATE specialist_agent_runs 
         SET status = 'completed', end_time = NOW(), actions_emitted = $1
         WHERE id = $2`,
        [actions.length, runId]
      );
      
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
    } catch (error) {
      // Update run status to failed
      await db.query(
        `UPDATE specialist_agent_runs 
         SET status = 'failed', end_time = NOW(), error_message = $1
         WHERE id = $2`,
        [error instanceof Error ? error.message : 'Unknown error', runId]
      );
      
      throw error;
    }
  } catch (error) {
    console.error(`Error running ${agentName} agent:`, error);
    return Response.json({
      success: false,
      error: `Failed to run ${agentName} agent`
    }, { status: 500 });
  }
}

async function runAllSpecialistAgents() {
  try {
    const orchestrator = new SpecialistAgentOrchestrator();
    const allActions = await orchestrator.runAllAgents();
    
    // Store all actions in action_queue
    for (const action of allActions) {
      await db.query(
        `INSERT INTO action_queue (
          type, target, draft, evidence, expected_impact, confidence, 
          ease, risk_tier, can_execute, rollback_plan, freshness_label, agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          action.type, action.target, action.draft, JSON.stringify(action.evidence),
          JSON.stringify(action.expected_impact), action.confidence, action.ease,
          action.risk_tier, action.can_execute, action.rollback_plan,
          action.freshness_label, action.agent
        ]
      );
    }
    
  return Response.json({
    success: true,
    data: {
      totalActions: allActions.length,
      agentsRun: ['analytics', 'inventory', 'content-seo-perf', 'risk']
    },
    message: 'All specialist agents completed successfully'
  });
  } catch (error) {
    console.error('Error running all specialist agents:', error);
  return Response.json({
    success: false,
    error: 'Failed to run all specialist agents'
  }, { status: 500 });
  }
}
