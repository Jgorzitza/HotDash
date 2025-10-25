/**
 * Action Queue Edit API Route
 *
 * POST /api/action-queue/:id/edit - Edit an action before approval
 *
 * Task: ENGINEER-GE-001
 */
import type { ActionFunctionArgs } from "react-router";
/**
 * POST /api/action-queue/:id/edit
 *
 * Edit an action's draft, evidence, or other fields before approval
 *
 * Body:
 * - operator_id: string (required) - ID of the operator editing
 * - operator_name: string (optional) - Name of the operator
 * - updates: object (required) - Fields to update
 *   - draft: string (optional)
 *   - evidence: object (optional)
 *   - expected_impact: object (optional)
 *   - confidence: number (optional)
 *   - rollback_plan: string (optional)
 * - notes: string (optional) - Edit notes
 */
export declare function action({ request, params }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.action-queue.$id.edit.d.ts.map