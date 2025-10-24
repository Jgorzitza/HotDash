/**
 * Action Queue Reject API Route
 *
 * POST /api/action-queue/:id/reject - Reject an action
 *
 * Task: ENGINEER-GE-001
 */
import type { ActionFunctionArgs } from "react-router";
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
export declare function action({ request, params }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.action-queue.$id.reject.d.ts.map