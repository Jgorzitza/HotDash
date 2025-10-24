/**
 * Action Queue API Routes
 *
 * Complete CRUD operations for Action Queue system
 * Implements HITL approval workflow with filtering, sorting, and pagination
 *
 * Task: ENGINEER-GE-001
 */
import { ActionQueueService } from "~/services/action-queue";
/**
 * GET /api/action-queue
 *
 * List actions with filtering, sorting, and pagination
 *
 * Query Parameters:
 * - limit: number (default: 10, max: 100)
 * - offset: number (default: 0)
 * - status: string (pending|approved|rejected|executed)
 * - agent: string (filter by agent name)
 * - type: string (filter by action type)
 * - risk_tier: string (policy|safety|perf|none)
 * - priority: string (high|medium|low)
 * - category: string (inventory|growth|content|seo)
 * - sort_by: string (score|confidence|expected_impact|created_at)
 * - sort_order: string (asc|desc, default: desc)
 */
export async function loader({ request }) {
    const url = new URL(request.url);
    // Pagination
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    // Filtering
    const status = url.searchParams.get('status') || 'pending';
    const agent = url.searchParams.get('agent');
    const type = url.searchParams.get('type');
    const risk_tier = url.searchParams.get('risk_tier');
    const priority = url.searchParams.get('priority');
    const category = url.searchParams.get('category');
    // Sorting
    const sort_by = url.searchParams.get('sort_by') || 'score';
    const sort_order = url.searchParams.get('sort_order') || 'desc';
    try {
        const [actions, total] = await Promise.all([
            ActionQueueService.getActions({
                limit,
                offset,
                status,
                agent: agent || undefined,
                type: type || undefined,
                risk_tier: risk_tier || undefined,
                priority: priority || undefined,
                category: category || undefined,
                sort_by,
                sort_order
            }),
            ActionQueueService.getActionCount({
                status,
                agent: agent || undefined,
                type: type || undefined,
                risk_tier: risk_tier || undefined,
                priority: priority || undefined,
                category: category || undefined
            })
        ]);
        return Response.json({
            success: true,
            data: actions,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + actions.length < total
            },
            filters: {
                status,
                agent,
                type,
                risk_tier,
                priority,
                category
            },
            sorting: {
                sort_by,
                sort_order
            }
        });
    }
    catch (error) {
        console.error('[Action Queue API] Error fetching actions:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch action queue',
            message: error.message
        }, { status: 500 });
    }
}
/**
 * POST /api/action-queue
 *
 * Create a new action in the queue
 */
export async function action({ request }) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    try {
        const body = await request.json();
        const action = await ActionQueueService.createAction(body);
        return Response.json({
            success: true,
            data: action,
            message: 'Action created successfully'
        }, { status: 201 });
    }
    catch (error) {
        console.error('[Action Queue API] Error creating action:', error);
        return Response.json({
            success: false,
            error: 'Failed to create action',
            message: error.message
        }, { status: 400 });
    }
}
//# sourceMappingURL=api.action-queue.js.map