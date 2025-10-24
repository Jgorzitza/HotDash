/**
 * Action Queue Detail API Route
 *
 * GET /api/action-queue/:id - Get action details
 * PATCH /api/action-queue/:id - Update action
 * DELETE /api/action-queue/:id - Delete action
 *
 * Task: ENGINEER-GE-001
 */
import { ActionQueueService } from "~/services/action-queue";
/**
 * GET /api/action-queue/:id
 *
 * Get detailed information about a specific action
 */
export async function loader({ params }) {
    const { id } = params;
    if (!id) {
        return Response.json({
            success: false,
            error: 'Action ID is required'
        }, { status: 400 });
    }
    try {
        const action = await ActionQueueService.getActionById(id);
        if (!action) {
            return Response.json({
                success: false,
                error: 'Action not found'
            }, { status: 404 });
        }
        return Response.json({
            success: true,
            data: action
        });
    }
    catch (error) {
        console.error(`[Action Queue API] Error fetching action ${id}:`, error);
        return Response.json({
            success: false,
            error: 'Failed to fetch action',
            message: error.message
        }, { status: 500 });
    }
}
/**
 * PATCH /api/action-queue/:id
 *
 * Update an action (edit draft, evidence, etc.)
 */
export async function action({ request, params }) {
    const { id } = params;
    if (!id) {
        return Response.json({
            success: false,
            error: 'Action ID is required'
        }, { status: 400 });
    }
    if (request.method === 'PATCH') {
        try {
            const updates = await request.json();
            const action = await ActionQueueService.updateAction(id, updates);
            return Response.json({
                success: true,
                data: action,
                message: 'Action updated successfully'
            });
        }
        catch (error) {
            console.error(`[Action Queue API] Error updating action ${id}:`, error);
            return Response.json({
                success: false,
                error: 'Failed to update action',
                message: error.message
            }, { status: 400 });
        }
    }
    if (request.method === 'DELETE') {
        try {
            await ActionQueueService.deleteAction(id);
            return Response.json({
                success: true,
                message: 'Action deleted successfully'
            });
        }
        catch (error) {
            console.error(`[Action Queue API] Error deleting action ${id}:`, error);
            return Response.json({
                success: false,
                error: 'Failed to delete action',
                message: error.message
            }, { status: 400 });
        }
    }
    return Response.json({
        error: 'Method not allowed'
    }, { status: 405 });
}
//# sourceMappingURL=api.action-queue.$id.js.map