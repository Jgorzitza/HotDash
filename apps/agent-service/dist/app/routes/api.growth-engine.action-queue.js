/**
 * Growth Engine Action Queue API
 *
 * Provides endpoints for managing the Action Queue system
 */
import { ActionQueueService } from "~/services/action-queue";
// ============================================================================
// GET /api/growth-engine/action-queue
// ============================================================================
export async function loader({ request }) {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status') || 'pending';
    const agent = url.searchParams.get('agent');
    const type = url.searchParams.get('type');
    const risk_tier = url.searchParams.get('risk_tier');
    try {
        const actions = await ActionQueueService.getActions({
            limit,
            status,
            agent: agent || undefined,
            type: type || undefined,
            risk_tier: risk_tier || undefined
        });
        return Response.json({
            success: true,
            data: actions,
            count: actions.length
        });
    }
    catch (error) {
        console.error('Error fetching action queue:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch action queue'
        }, { status: 500 });
    }
}
// ============================================================================
// POST /api/growth-engine/action-queue
// ============================================================================
export async function action({ request }) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    try {
        const body = await request.json();
        const { action, actionId, operatorId } = body;
        switch (action) {
            case 'approve':
                return await ActionQueueService.approveAction(actionId, operatorId)
                    .then(result => Response.json({
                    success: true,
                    data: result,
                    message: 'Action approved successfully'
                }))
                    .catch(error => Response.json({
                    success: false,
                    error: error.message
                }, { status: 400 }));
            case 'reject':
                return await ActionQueueService.rejectAction(actionId, operatorId)
                    .then(result => Response.json({
                    success: true,
                    data: result,
                    message: 'Action rejected successfully'
                }))
                    .catch(error => Response.json({
                    success: false,
                    error: error.message
                }, { status: 400 }));
            case 'execute':
                return await ActionQueueService.executeAction(actionId, operatorId)
                    .then(result => Response.json({
                    success: true,
                    data: result,
                    message: 'Action executed successfully'
                }))
                    .catch(error => Response.json({
                    success: false,
                    error: error.message
                }, { status: 400 }));
            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    }
    catch (error) {
        console.error('Error processing action queue request:', error);
        return Response.json({
            success: false,
            error: 'Failed to process request'
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.growth-engine.action-queue.js.map