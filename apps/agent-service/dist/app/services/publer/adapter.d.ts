/**
 * Publer HITL (Human-In-The-Loop) Adapter
 *
 * Handles the flow: Draft → Pending Review → Approved → Published
 * Integrates with approval system for social posts
 * Stores receipts in database after publishing
 */
import type { PublerJobStatus } from "./types";
export interface SocialPostApproval {
    id: string;
    type: "social_post";
    status: "draft" | "pending_review" | "approved" | "rejected";
    content: {
        text: string;
        accountIds: string[];
        scheduledAt?: string;
        media?: Array<{
            url: string;
            type: "image" | "video";
            alt_text?: string;
        }>;
    };
    metadata: {
        platform?: string;
        estimated_reach?: number;
        estimated_engagement_rate?: number;
    };
    created_at: string;
    approved_at?: string;
    approved_by?: string;
}
export interface PublishResult {
    success: boolean;
    jobId?: string;
    error?: string;
    receipt?: SocialPostReceipt;
}
export interface SocialPostReceipt {
    id: string;
    approval_id: string;
    publer_job_id: string;
    platform: string;
    content: string;
    published_at: string;
    status: "pending" | "processing" | "complete" | "failed";
    post_url?: string;
    performance_metrics?: {
        reach?: number;
        engagement?: number;
        clicks?: number;
    };
}
export declare class PublerAdapter {
    private client;
    constructor();
    /**
     * Convert approval to Publer post format
     */
    private convertApprovalToPost;
    /**
     * Publish an approved social post
     */
    publishApproval(approval: SocialPostApproval): Promise<PublishResult>;
    checkPublishStatus(jobId: string): Promise<PublerJobStatus | null>;
    updateReceiptFromJobStatus(receipt: SocialPostReceipt, jobStatus: PublerJobStatus): SocialPostReceipt;
    listAccounts(): Promise<import("./types").PublerAccount[]>;
    getRateLimitInfo(): import("./types").PublerRateLimitInfo;
    isRateLimitApproaching(): boolean;
}
export declare function createPublerAdapter(): PublerAdapter;
//# sourceMappingURL=adapter.d.ts.map