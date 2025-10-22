/**
 * Growth Engine Action Queue API
 * 
 * Provides endpoints for managing the Action Queue system
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { db } from "~/db.server";

// ============================================================================
// GET /api/growth-engine/action-queue
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const status = url.searchParams.get('status') || 'pending';
  const agent = url.searchParams.get('agent');
  
  try {
    let query = `
      SELECT 
        id, type, target, draft, evidence, expected_impact, 
        confidence, ease, risk_tier, can_execute, rollback_plan, 
        freshness_label, agent, score, status, created_at, updated_at
      FROM action_queue 
      WHERE status = $1
    `;
    
    const params: any[] = [status];
    let paramIndex = 2;
    
    if (agent) {
      query += ` AND agent = $${paramIndex}`;
      params.push(agent);
      paramIndex++;
    }
    
    query += ` ORDER BY score DESC LIMIT $${paramIndex}`;
    params.push(limit);
    
    const { rows } = await db.query(query, params);
    
    return json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching action queue:', error);
    return json({
      success: false,
      error: 'Failed to fetch action queue'
    }, { status: 500 });
  }
}

// ============================================================================
// POST /api/growth-engine/action-queue
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }
  
  try {
    const body = await request.json();
    const { action, actionId, operatorId } = body;
    
    switch (action) {
      case 'approve':
        return await approveAction(actionId, operatorId);
      case 'reject':
        return await rejectAction(actionId, operatorId);
      case 'execute':
        return await executeAction(actionId, operatorId);
      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing action queue request:', error);
    return json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
}

async function approveAction(actionId: string, operatorId: string) {
  try {
    const { rows } = await db.query(
      `UPDATE action_queue 
       SET status = 'approved', approved_at = NOW(), approved_by = $1, updated_at = NOW()
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [operatorId, actionId]
    );
    
    if (rows.length === 0) {
      return json({ error: 'Action not found or already processed' }, { status: 404 });
    }
    
    return json({
      success: true,
      data: rows[0],
      message: 'Action approved successfully'
    });
  } catch (error) {
    console.error('Error approving action:', error);
    return json({ error: 'Failed to approve action' }, { status: 500 });
  }
}

async function rejectAction(actionId: string, operatorId: string) {
  try {
    const { rows } = await db.query(
      `UPDATE action_queue 
       SET status = 'rejected', approved_at = NOW(), approved_by = $1, updated_at = NOW()
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [operatorId, actionId]
    );
    
    if (rows.length === 0) {
      return json({ error: 'Action not found or already processed' }, { status: 404 });
    }
    
    return json({
      success: true,
      data: rows[0],
      message: 'Action rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting action:', error);
    return json({ error: 'Failed to reject action' }, { status: 500 });
  }
}

async function executeAction(actionId: string, operatorId: string) {
  try {
    // First, get the action details
    const { rows: actionRows } = await db.query(
      'SELECT * FROM action_queue WHERE id = $1 AND status = $2',
      [actionId, 'approved']
    );
    
    if (actionRows.length === 0) {
      return json({ error: 'Action not found or not approved' }, { status: 404 });
    }
    
    const action = actionRows[0];
    
    // Execute the action (this would call the appropriate service)
    const executionResult = await executeActionByType(action);
    
    // Update the action with execution result
    const { rows } = await db.query(
      `UPDATE action_queue 
       SET status = 'executed', executed_at = NOW(), executed_by = $1, 
           execution_result = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [operatorId, JSON.stringify(executionResult), actionId]
    );
    
    return json({
      success: true,
      data: rows[0],
      message: 'Action executed successfully'
    });
  } catch (error) {
    console.error('Error executing action:', error);
    return json({ error: 'Failed to execute action' }, { status: 500 });
  }
}

async function executeActionByType(action: any) {
  // This would contain the actual execution logic for each action type
  // For now, return a mock result
  return {
    success: true,
    message: `Executed ${action.type} action for ${action.target}`,
    timestamp: new Date().toISOString()
  };
}
