/**
 * Action Queue Detail API Route
 *
 * GET /api/action-queue/:id - Get action details
 * PATCH /api/action-queue/:id - Update action
 * DELETE /api/action-queue/:id - Delete action
 *
 * Task: ENGINEER-GE-001
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
/**
 * GET /api/action-queue/:id
 *
 * Get detailed information about a specific action
 */
export declare function loader({ params }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * PATCH /api/action-queue/:id
 *
 * Update an action (edit draft, evidence, etc.)
 */
export declare function action({ request, params }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.action-queue.$id.d.ts.map