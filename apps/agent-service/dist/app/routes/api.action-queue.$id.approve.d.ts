/**
 * Action Queue Approve API Route
 *
 * POST /api/action-queue/:id/approve - Approve an action
 *
 * Task: ENGINEER-GE-001
 */
import type { ActionFunctionArgs } from "react-router";
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
export declare function action({ request, params }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.action-queue.$id.approve.d.ts.map