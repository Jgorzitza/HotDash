/**
 * Ad Copy Approval API Route
 *
 * Handles HITL workflow for ad copy changes.
 * Supports creating approval requests, approving/rejecting, and applying changes.
 *
 * @module app/routes/api.ads.approve-copy
 */
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
/**
 * GET /api/ads/approve-copy
 *
 * Query parameters:
 * - id: Specific approval ID (optional)
 * - campaignId: Filter by campaign ID (optional)
 * - status: Filter by status (optional)
 *
 * @param request - Fetch request object
 * @returns JSON response with approval data
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * POST /api/ads/approve-copy
 *
 * Actions:
 * - create: Create new approval request
 * - approve: Approve a pending request
 * - reject: Reject a pending request
 * - apply: Mark an approved request as applied
 *
 * @param request - Fetch request object
 * @returns JSON response with updated approval
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.ads.approve-copy.d.ts.map