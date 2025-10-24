/**
 * Action Attribution API Routes
 *
 * GET /api/actions/:id/attribution - Get current attribution data
 * POST /api/actions/:id/attribution - Refresh attribution from GA4
 *
 * Part of Growth Engine: Action ROI tracking and queue re-ranking
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
/**
 * Get attribution data for an action
 *
 * Returns:
 * - Action record with realized ROI
 * - Latest attribution record
 * - Fresh GA4 data for 28-day window
 */
export declare function loader({ params }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * Refresh attribution data from GA4
 *
 * Triggers fresh GA4 queries for all 3 windows (7d, 14d, 28d)
 * Updates action_queue and creates new action_attribution record
 */
export declare function action({ params }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.actions.$id.attribution.d.ts.map