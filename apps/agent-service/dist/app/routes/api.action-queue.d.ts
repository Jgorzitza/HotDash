/**
 * Action Queue API Routes
 *
 * Complete CRUD operations for Action Queue system
 * Implements HITL approval workflow with filtering, sorting, and pagination
 *
 * Task: ENGINEER-GE-001
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
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
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * POST /api/action-queue
 *
 * Create a new action in the queue
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.action-queue.d.ts.map