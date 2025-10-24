/**
 * Action Queue Reject API Route
 *
 * POST /api/action-queue/:id/reject - Reject an action
 *
 * Task: ENGINEER-GE-001
 */
import { ActionQueueService } from "~/services/action-queue";
import { logDecision } from "~/services/decisions.server";
/**
 * POST /api/action-queue/:id/reject
 *
 * Reject an action
 *
 * Body:
 * - operator_id: string (required) - ID of the operator rejecting
 * - operator_name: string (optional) - Name of the operator
 * - reason: string (required) - Reason for rejection
 * - notes: string (optional) - Additional notes
 */
export async function action({ request, params }) {
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
        const { operator_id, operator_name, reason, notes } = body;
        if (!operator_id) {
            return Response.json({
                success: false,
                error: 'operator_id is required'
            }, { status: 400 });
        }
        if (!reason) {
            return Response.json({
                success: false,
                error: 'reason is required'
            }, { status: 400 });
        }
        // Get action details before rejection
        const actionBefore = await ActionQueueService.getActionById(id);
        if (!actionBefore) {
            return Response.json({
                success: false,
                error: 'Action not found'
            }, { status: 404 });
        }
        // Reject the action
        const rejectedAction = await ActionQueueService.rejectAction(id, operator_id);
        // Log the rejection decision
        await logDecision({
            scope: 'action-queue',
            actor: operator_name || operator_id,
            action: 'action_rejected',
            rationale: `Rejected action: ${actionBefore.type} for ${actionBefore.target}. Reason: ${reason}${notes ? `. Notes: ${notes}` : ''}`,
            evidenceUrl: `/api/action-queue/${id}`,
            payload: {
                actionId: id,
                actionType: actionBefore.type,
                target: actionBefore.target,
                agent: actionBefore.agent,
                reason,
                notes
            }
        });
        return Response.json({
            success: true,
            data: rejectedAction,
            message: 'Action rejected successfully'
        });
    }
    catch (error) {
        console.error(`[Action Queue API] Error rejecting action ${id}:`, error);
        return Response.json({
            success: false,
            error: 'Failed to reject action',
            message: error.message
        }, { status: 400 });
    }
}
//# sourceMappingURL=api.action-queue.$id.reject.js.map