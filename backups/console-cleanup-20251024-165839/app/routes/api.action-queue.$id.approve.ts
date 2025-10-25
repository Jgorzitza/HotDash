/**
 * Action Queue Approve API Route
 * 
 * POST /api/action-queue/:id/approve - Approve an action
 * 
 * Task: ENGINEER-GE-001
 */

import type { ActionFunctionArgs } from "react-router";
import { ActionQueueService } from "~/services/action-queue";
import { logDecision } from "~/services/decisions.server";

/**
 * POST /api/action-queue/:id/approve
 * 
 * Approve an action for execution
 * 
 * Body:
 * - operator_id: string (required) - ID of the operator approving
 * - operator_name: string (optional) - Name of the operator
 * - notes: string (optional) - Approval notes
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
    const { operator_id, operator_name, notes } = body;
    
    if (!operator_id) {
      return Response.json({
        success: false,
        error: 'operator_id is required'
      }, { status: 400 });
    }
    
    // Get action details before approval
    const actionBefore = await ActionQueueService.getActionById(id);
    
    if (!actionBefore) {
      return Response.json({
        success: false,
        error: 'Action not found'
      }, { status: 404 });
    }
    
    // Approve the action
    const approvedAction = await ActionQueueService.approveAction(id, operator_id);
    
    // Log the approval decision
    await logDecision({
      scope: 'action-queue',
      actor: operator_name || operator_id,
      action: 'action_approved',
      rationale: notes || `Approved action: ${actionBefore.type} for ${actionBefore.target}`,
      evidenceUrl: `/api/action-queue/${id}`,
      payload: {
        actionId: id,
        actionType: actionBefore.type,
        target: actionBefore.target,
        agent: actionBefore.agent,
        expectedImpact: actionBefore.expected_impact,
        confidence: actionBefore.confidence,
        riskTier: actionBefore.risk_tier
      }
    });
    
    return Response.json({
      success: true,
      data: approvedAction,
      message: 'Action approved successfully'
    });
  } catch (error: any) {
    console.error(`[Action Queue API] Error approving action ${id}:`, error);
    return Response.json({
      success: false,
      error: 'Failed to approve action',
      message: error.message
    }, { status: 400 });
  }
}

