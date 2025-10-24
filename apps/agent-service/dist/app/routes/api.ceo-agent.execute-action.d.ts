/**
 * API Route: CEO Agent - Execute Approved Action
 *
 * POST /api/ceo-agent/execute-action
 *
 * Executes a CEO-approved action through the appropriate service.
 * All actions must have prior approval via HITL workflow.
 *
 * Request Body:
 * - actionId: string (required) - Unique action identifier
 * - actionType: 'cx' | 'inventory' | 'social' | 'product' | 'ads' (required)
 * - approvalId: number (required) - Reference to approval decision_log record
 * - payload: object (required) - Action-specific parameters
 * - ceoContext: object (optional) - CEO user context
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-008
 */
import { type ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.ceo-agent.execute-action.d.ts.map