/**
 * AI-Customer CEO Agent Action Execution Service
 *
 * Executes approved actions from CEO Agent after HITL approval.
 * Supports 5 action types: CX, inventory, social, product, ads.
 * Tracks success/failure and stores audit receipts.
 *
 * @module app/services/ai-customer/action-execution
 * @see docs/directions/ai-customer.md AI-CUSTOMER-008
 */
/**
 * Action types supported by CEO Agent
 */
export type ActionType = "cx" | "inventory" | "social" | "product" | "ads";
/**
 * Action execution status
 */
export type ExecutionStatus = "pending" | "in_progress" | "success" | "failed" | "cancelled";
/**
 * Action execution request
 */
export interface ActionExecutionRequest {
    actionId: string;
    actionType: ActionType;
    approvalId: number;
    payload: Record<string, any>;
    ceoContext?: {
        userId: string;
        approvedAt: string;
        modifications?: Record<string, any>;
    };
}
/**
 * Action execution result
 */
export interface ActionExecutionResult {
    executionId: string;
    actionId: string;
    status: ExecutionStatus;
    result?: Record<string, any>;
    error?: string;
    receipt: ExecutionReceipt;
    timestamp: string;
}
/**
 * Audit receipt for executed action
 */
export interface ExecutionReceipt {
    executedAt: string;
    executedBy: "ceo_agent";
    actionType: ActionType;
    approvalId: number;
    payload: Record<string, any>;
    result?: Record<string, any>;
    error?: string;
    duration: number;
    apiCalls: Array<{
        service: string;
        endpoint: string;
        method: string;
        status: number;
        duration: number;
    }>;
}
/**
 * Execute approved CEO Agent action
 *
 * Strategy:
 * 1. Validate approval exists and is approved
 * 2. Route to appropriate service (CX, inventory, social, product, ads)
 * 3. Execute action via backend API
 * 4. Track API calls and timing
 * 5. Store result and receipt in decision_log
 * 6. Return execution result
 *
 * @param request - Action execution request with approval context
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @returns Action execution result with receipt
 */
export declare function executeAction(request: ActionExecutionRequest, supabaseUrl: string, supabaseKey: string): Promise<ActionExecutionResult>;
//# sourceMappingURL=action-execution.d.ts.map