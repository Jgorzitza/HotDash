/**
 * Social Post Queue Service
 *
 * Manages queuing and retry logic for failed social posts
 * Tracks post status and handles automatic retries
 */
import type { SocialPostApproval, SocialPostReceipt } from "~/services/publer/adapter";
export interface QueuedPost {
    id: string;
    approval: SocialPostApproval;
    status: "queued" | "processing" | "completed" | "failed" | "retrying";
    priority: number;
    attempts: number;
    maxAttempts: number;
    lastAttemptAt?: string;
    nextRetryAt?: string;
    error?: string;
    receipt?: SocialPostReceipt;
    createdAt: string;
    updatedAt: string;
}
export interface QueueStats {
    total: number;
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    retrying: number;
}
export interface RetryConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}
export declare class SocialPostQueue {
    private queue;
    private processing;
    private retryConfig;
    private adapter;
    constructor(retryConfig?: Partial<RetryConfig>);
    enqueue(approval: SocialPostApproval, priority?: number): QueuedPost;
    private getNextPost;
    private processPost;
    private calculateRetryDelay;
    processQueue(): Promise<void>;
    getPost(id: string): QueuedPost | undefined;
    getAllPosts(status?: QueuedPost["status"]): QueuedPost[];
    getStats(): QueueStats;
    cleanup(maxAgeMs: number): number;
    cancel(id: string): boolean;
    clear(): void;
}
export declare function createSocialPostQueue(retryConfig?: Partial<RetryConfig>): SocialPostQueue;
export declare function getSocialPostQueue(): SocialPostQueue;
//# sourceMappingURL=queue.d.ts.map