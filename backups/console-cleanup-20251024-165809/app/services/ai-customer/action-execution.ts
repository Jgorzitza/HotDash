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

import { createClient } from "@supabase/supabase-js";

/**
 * Action types supported by CEO Agent
 */
export type ActionType = "cx" | "inventory" | "social" | "product" | "ads";

/**
 * Action execution status
 */
export type ExecutionStatus =
  | "pending"
  | "in_progress"
  | "success"
  | "failed"
  | "cancelled";

/**
 * Action execution request
 */
export interface ActionExecutionRequest {
  actionId: string;
  actionType: ActionType;
  approvalId: number; // Reference to approval record
  payload: Record<string, any>; // Action-specific data
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
  duration: number; // Milliseconds
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
export async function executeAction(
  request: ActionExecutionRequest,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<ActionExecutionResult> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const startTime = Date.now();
  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Verify approval exists
    const { data: approval, error: approvalError } = await supabase
      .from("decision_log")
      .select("*")
      .eq("id", request.approvalId)
      .single();

    if (approvalError || !approval) {
      throw new Error(`Approval ${request.approvalId} not found`);
    }

    // Check approval status
    const approvalStatus = (approval.payload as any)?.approvalStatus;
    if (approvalStatus !== "approved") {
      throw new Error(
        `Approval ${request.approvalId} not approved (status: ${approvalStatus})`,
      );
    }

    // Track API calls
    const apiCalls: ExecutionReceipt["apiCalls"] = [];

    // Route to appropriate service
    let result: Record<string, any>;

    switch (request.actionType) {
      case "cx":
        result = await executeCXAction(request, apiCalls);
        break;

      case "inventory":
        result = await executeInventoryAction(request, apiCalls);
        break;

      case "social":
        result = await executeSocialAction(request, apiCalls);
        break;

      case "product":
        result = await executeProductAction(request, apiCalls);
        break;

      case "ads":
        result = await executeAdsAction(request, apiCalls);
        break;

      default:
        throw new Error(`Unsupported action type: ${request.actionType}`);
    }

    const duration = Date.now() - startTime;

    // Create receipt
    const receipt: ExecutionReceipt = {
      executedAt: new Date().toISOString(),
      executedBy: "ceo_agent",
      actionType: request.actionType,
      approvalId: request.approvalId,
      payload: request.payload,
      result,
      duration,
      apiCalls,
    };

    // Store in decision_log
    await supabase.from("decision_log").insert({
      scope: "ceo_agent",
      actor: request.ceoContext?.userId || "ceo_agent",
      action: `${request.actionType}.${request.actionId}`,
      rationale: `CEO Agent action execution via approval ${request.approvalId}`,
      payload: {
        executionId,
        actionId: request.actionId,
        receipt,
        ceoContext: request.ceoContext,
      },
    });

    return {
      executionId,
      actionId: request.actionId,
      status: "success",
      result,
      receipt,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Create error receipt
    const receipt: ExecutionReceipt = {
      executedAt: new Date().toISOString(),
      executedBy: "ceo_agent",
      actionType: request.actionType,
      approvalId: request.approvalId,
      payload: request.payload,
      error: errorMessage,
      duration,
      apiCalls: [],
    };

    // Log error to decision_log
    await supabase.from("decision_log").insert({
      scope: "ceo_agent",
      actor: request.ceoContext?.userId || "ceo_agent",
      action: `${request.actionType}.${request.actionId}.error`,
      rationale: `CEO Agent action execution failed: ${errorMessage}`,
      payload: {
        executionId,
        actionId: request.actionId,
        error: errorMessage,
        receipt,
      },
    });

    return {
      executionId,
      actionId: request.actionId,
      status: "failed",
      error: errorMessage,
      receipt,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Execute CX (Customer Experience) action
 */
async function executeCXAction(
  request: ActionExecutionRequest,
  apiCalls: ExecutionReceipt["apiCalls"],
): Promise<Record<string, any>> {
  const { payload } = request;
  const callStart = Date.now();

  // Call Chatwoot API to send reply, update status, etc.
  const response = await fetch("/api/chatwoot/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  apiCalls.push({
    service: "chatwoot",
    endpoint: "/api/chatwoot/action",
    method: "POST",
    status: response.status,
    duration: Date.now() - callStart,
  });

  if (!response.ok) {
    throw new Error(`CX action failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Execute inventory action
 */
async function executeInventoryAction(
  request: ActionExecutionRequest,
  apiCalls: ExecutionReceipt["apiCalls"],
): Promise<Record<string, any>> {
  const { payload } = request;
  const callStart = Date.now();

  // Call inventory management API to reorder, update ROP, etc.
  const response = await fetch("/api/inventory/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  apiCalls.push({
    service: "inventory",
    endpoint: "/api/inventory/action",
    method: "POST",
    status: response.status,
    duration: Date.now() - callStart,
  });

  if (!response.ok) {
    throw new Error(`Inventory action failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Execute social media action
 */
async function executeSocialAction(
  request: ActionExecutionRequest,
  apiCalls: ExecutionReceipt["apiCalls"],
): Promise<Record<string, any>> {
  const { payload } = request;
  const callStart = Date.now();

  // Call Publer/social API to schedule post, update content, etc.
  const response = await fetch("/api/social/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  apiCalls.push({
    service: "social",
    endpoint: "/api/social/action",
    method: "POST",
    status: response.status,
    duration: Date.now() - callStart,
  });

  if (!response.ok) {
    throw new Error(`Social action failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Execute product management action
 */
async function executeProductAction(
  request: ActionExecutionRequest,
  apiCalls: ExecutionReceipt["apiCalls"],
): Promise<Record<string, any>> {
  const { payload } = request;
  const callStart = Date.now();

  // Call Shopify product API to create draft, update details, etc.
  const response = await fetch("/api/product/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  apiCalls.push({
    service: "product",
    endpoint: "/api/product/action",
    method: "POST",
    status: response.status,
    duration: Date.now() - callStart,
  });

  if (!response.ok) {
    throw new Error(`Product action failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Execute ads/marketing action
 */
async function executeAdsAction(
  request: ActionExecutionRequest,
  apiCalls: ExecutionReceipt["apiCalls"],
): Promise<Record<string, any>> {
  const { payload } = request;
  const callStart = Date.now();

  // Call Google Ads API to update campaigns, budgets, etc.
  const response = await fetch("/api/ads/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  apiCalls.push({
    service: "ads",
    endpoint: "/api/ads/action",
    method: "POST",
    status: response.status,
    duration: Date.now() - callStart,
  });

  if (!response.ok) {
    throw new Error(`Ads action failed: ${response.statusText}`);
  }

  return await response.json();
}
