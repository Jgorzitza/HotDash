import type { Feedback, ApprovalRow } from './types.js';
/**
 * Save a feedback sample for training/evaluation
 */
export declare function saveFeedbackSample(sample: Partial<Feedback> & {
    conversationId: number;
    inputText: string;
}): Promise<void>;
/**
 * Save approval state for later resumption
 */
export declare function saveApprovalState(conversationId: number, state: any): Promise<ApprovalRow>;
/**
 * List all pending approvals
 */
export declare function listPendingApprovals(): Promise<ApprovalRow[]>;
/**
 * Load approval state by ID
 */
export declare function loadApprovalState(id: string): Promise<ApprovalRow | null>;
//# sourceMappingURL=store.d.ts.map