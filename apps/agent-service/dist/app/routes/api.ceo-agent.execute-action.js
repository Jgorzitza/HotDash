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
import { executeAction, } from "../services/ai-customer/action-execution";
export async function action({ request }) {
    try {
        const body = await request.json();
        const { actionId, actionType, approvalId, payload, ceoContext } = body;
        // Validate required parameters
        if (!actionId || typeof actionId !== "string") {
            const errorResponse = {
                success: false,
                error: "Missing or invalid required parameter: actionId",
                timestamp: new Date().toISOString(),
            };
            return Response.json(errorResponse, { status: 400 });
        }
        if (!actionType ||
            !["cx", "inventory", "social", "product", "ads"].includes(actionType)) {
            const errorResponse = {
                success: false,
                error: "Invalid actionType. Must be one of: cx, inventory, social, product, ads",
                timestamp: new Date().toISOString(),
            };
            return Response.json(errorResponse, { status: 400 });
        }
        if (!approvalId || typeof approvalId !== "number") {
            const errorResponse = {
                success: false,
                error: "Missing or invalid required parameter: approvalId (must be number)",
                timestamp: new Date().toISOString(),
            };
            return Response.json(errorResponse, { status: 400 });
        }
        if (!payload || typeof payload !== "object") {
            const errorResponse = {
                success: false,
                error: "Missing or invalid required parameter: payload (must be object)",
                timestamp: new Date().toISOString(),
            };
            return Response.json(errorResponse, { status: 400 });
        }
        // Get Supabase credentials from environment
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role for decision_log writes
        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase configuration");
        }
        // Execute action
        const executionRequest = {
            actionId,
            actionType,
            approvalId,
            payload,
            ceoContext,
        };
        const result = await executeAction(executionRequest, supabaseUrl, supabaseKey);
        const response = {
            success: result.status === "success",
            data: result,
            timestamp: new Date().toISOString(),
        };
        return Response.json(response);
    }
    catch (error) {
        console.error("[API] CEO Agent action execution error:", error);
        const errorResponse = {
            success: false,
            error: error.message || "Failed to execute action",
            timestamp: new Date().toISOString(),
        };
        return Response.json(errorResponse, { status: 500 });
    }
}
//# sourceMappingURL=api.ceo-agent.execute-action.js.map