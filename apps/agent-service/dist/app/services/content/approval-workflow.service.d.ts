/**
 * Content Approval Workflow Service
 *
 * Manages content approval workflow including:
 * - Content review queue
 * - Approval notifications
 * - Version control for approved content
 * - Integration with scheduling service
 */
export interface ContentApproval {
    id: string;
    content_entry_id?: string;
    scheduled_content_id?: string;
    content_type: 'social_post' | 'blog_post' | 'product_description' | 'email_campaign';
    title: string;
    content: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'changes_requested';
    submitted_by: string;
    submitted_at: string;
    reviewed_by?: string;
    reviewed_at?: string;
    rejection_reason?: string;
    requested_changes?: string;
    version: number;
    previous_version_id?: string;
    metadata?: Record<string, any>;
}
export interface ApprovalStats {
    pending_review: number;
    approved_today: number;
    rejected_today: number;
    average_review_time_minutes: number;
}
export declare class ContentApprovalWorkflowService {
    /**
     * Submit content for approval
     */
    static submitForApproval(input: {
        content_entry_id?: string;
        scheduled_content_id?: string;
        content_type: 'social_post' | 'blog_post' | 'product_description' | 'email_campaign';
        title: string;
        content: string;
        submitted_by: string;
        metadata?: Record<string, any>;
    }): Promise<ContentApproval>;
    /**
     * Get approval by ID
     */
    static getApprovalById(id: string): Promise<ContentApproval | null>;
    /**
     * Get pending approvals
     */
    static getPendingApprovals(options?: {
        content_type?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        items: ContentApproval[];
        total: number;
    }>;
    /**
     * Approve content
     */
    static approveContent(id: string, reviewed_by: string, options?: {
        schedule_for?: string;
        publish_immediately?: boolean;
    }): Promise<ContentApproval>;
    /**
     * Reject content
     */
    static rejectContent(id: string, reviewed_by: string, rejection_reason: string): Promise<ContentApproval>;
    /**
     * Request changes to content
     */
    static requestChanges(id: string, reviewed_by: string, requested_changes: string): Promise<ContentApproval>;
    /**
     * Get approval history for content
     */
    static getApprovalHistory(content_entry_id: string): Promise<ContentApproval[]>;
    /**
     * Get approval statistics
     */
    static getApprovalStats(): Promise<ApprovalStats>;
    /**
     * Map database row to ContentApproval
     */
    private static mapDbRowToContentApproval;
}
//# sourceMappingURL=approval-workflow.service.d.ts.map