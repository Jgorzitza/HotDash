/**
 * Action Queue Edit API Route
 * 
 * POST /api/action-queue/:id/edit - Edit an action before approval
 * 
 * Task: ENGINEER-GE-001
 */

import type { ActionFunctionArgs } from "react-router";
import { ActionQueueService } from "~/services/action-queue";
import { logDecision } from "~/services/decisions.server";

/**
 * POST /api/action-queue/:id/edit
 * 
 * Edit an action's draft, evidence, or other fields before approval
 * 
 * Body:
 * - operator_id: string (required) - ID of the operator editing
 * - operator_name: string (optional) - Name of the operator
 * - updates: object (required) - Fields to update
 *   - draft: string (optional)
 *   - evidence: object (optional)
 *   - expected_impact: object (optional)
 *   - confidence: number (optional)
 *   - rollback_plan: string (optional)
 * - notes: string (optional) - Edit notes
 */
export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  
  const { id } = params;
  
  if (!id) {
    return Response.json({
      success: false,
      error: 'Action ID is required'
    }, { status: 400 });
  }
  
  try {
    const body = await request.json();
    const { operator_id, operator_name, updates, notes } = body;
    
    if (!operator_id) {
      return Response.json({
        success: false,
        error: 'operator_id is required'
      }, { status: 400 });
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      return Response.json({
        success: false,
        error: 'updates object is required and must not be empty'
      }, { status: 400 });
    }
    
    // Get action details before edit
    const actionBefore = await ActionQueueService.getActionById(id);
    
    if (!actionBefore) {
      return Response.json({
        success: false,
        error: 'Action not found'
      }, { status: 404 });
    }
    
    // Check if action can be edited (only pending actions)
    if (actionBefore.status !== 'pending') {
      return Response.json({
        success: false,
        error: `Cannot edit action with status: ${actionBefore.status}. Only pending actions can be edited.`
      }, { status: 400 });
    }
    
    // Update the action
    const updatedAction = await ActionQueueService.updateAction(id, updates);
    
    // Log the edit decision
    await logDecision({
      scope: 'action-queue',
      actor: operator_name || operator_id,
      action: 'action_edited',
      rationale: `Edited action: ${actionBefore.type} for ${actionBefore.target}${notes ? `. Notes: ${notes}` : ''}`,
      evidenceUrl: `/api/action-queue/${id}`,
      payload: {
        actionId: id,
        actionType: actionBefore.type,
        target: actionBefore.target,
        agent: actionBefore.agent,
        updatedFields: Object.keys(updates),
        notes
      }
    });
    
    return Response.json({
      success: true,
      data: updatedAction,
      message: 'Action edited successfully'
    });
  } catch (error: any) {
    console.error(`[Action Queue API] Error editing action ${id}:`, error);
    return Response.json({
      success: false,
      error: 'Failed to edit action',
      message: error.message
    }, { status: 400 });
  }
}

