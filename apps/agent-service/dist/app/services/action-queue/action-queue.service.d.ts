/**
 * Action Queue Service
 *
 * Provides business logic for managing the Action Queue system
 * Implements standardized contract with Top-10 ranking and operator approval workflow
 */
import type { ActionQueueItem } from "~/lib/growth-engine/action-queue";
export interface ActionQueueCreateInput {
    type: string;
    target: string;
    draft: string;
    evidence: {
        mcp_request_ids: string[];
        dataset_links: string[];
        telemetry_refs: string[];
    };
    expected_impact: {
        metric: string;
        delta: number;
        unit: string;
    };
    confidence: number;
    ease: 'simple' | 'medium' | 'hard';
    risk_tier: 'policy' | 'safety' | 'perf' | 'none';
    can_execute: boolean;
    rollback_plan: string;
    freshness_label: string;
    agent: string;
}
export interface ActionQueueUpdateInput {
    status?: 'pending' | 'approved' | 'rejected' | 'executed';
    approved_by?: string;
    approved_at?: Date;
    executed_by?: string;
    executed_at?: Date;
    execution_result?: any;
}
export declare class ActionQueueService {
    /**
     * Create a new action in the queue
     */
    static createAction(input: ActionQueueCreateInput): Promise<ActionQueueItem>;
    /**
     * Get actions from the queue with filtering, sorting, and pagination
     */
    static getActions(options?: {
        limit?: number;
        offset?: number;
        status?: string;
        agent?: string;
        type?: string;
        risk_tier?: string;
        priority?: string;
        category?: string;
        sort_by?: string;
        sort_order?: string;
    }): Promise<ActionQueueItem[]>;
    /**
     * Get count of actions matching filters
     */
    static getActionCount(options?: {
        status?: string;
        agent?: string;
        type?: string;
        risk_tier?: string;
        priority?: string;
        category?: string;
    }): Promise<number>;
    /**
     * Get top N actions by score (for the main queue view)
     */
    static getTopActions(limit?: number): Promise<ActionQueueItem[]>;
    /**
     * Get action by ID
     */
    static getActionById(id: string): Promise<ActionQueueItem | null>;
    /**
     * Update action status and metadata
     */
    static updateAction(id: string, updates: ActionQueueUpdateInput): Promise<ActionQueueItem>;
    /**
     * Approve an action
     */
    static approveAction(id: string, operatorId: string): Promise<ActionQueueItem>;
    /**
     * Reject an action
     */
    static rejectAction(id: string, operatorId: string): Promise<ActionQueueItem>;
    /**
     * Delete an action
     */
    static deleteAction(id: string): Promise<void>;
    /**
     * Execute an approved action
     */
    static executeAction(id: string, operatorId: string): Promise<ActionQueueItem>;
    /**
     * Execute action based on type
     */
    private static executeActionByType;
    /**
     * Get action queue statistics
     */
    static getStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        executed: number;
        rejected: number;
    }>;
    /**
     * Map database row to ActionQueueItem
     */
    private static mapDbRowToActionQueueItem;
}
//# sourceMappingURL=action-queue.service.d.ts.map