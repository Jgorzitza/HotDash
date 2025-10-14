/**
 * Webhook Queue System
 *
 * Queue-based processing for Chatwoot webhooks with:
 * - Asynchronous processing (not blocking webhook endpoint)
 * - Replay protection (idempotency)
 * - Persistent storage
 * - Retry logic with exponential backoff
 *
 * Direction Reference: docs/directions/chatwoot.md Task 2
 */
export interface WebhookQueueItem {
    id: string;
    conversationId: number;
    messageId: string;
    payload: any;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    processedAt?: Date;
    error?: string;
    metadata?: Record<string, any>;
}
/**
 * In-memory queue with persistence hooks
 * For production, consider Redis or database-backed queue
 */
export declare class WebhookQueue {
    private queue;
    private processing;
    private processedIds;
    /**
     * Enqueue webhook for processing
     * Returns null if already processed (idempotency)
     */
    enqueue(payload: any): WebhookQueueItem | null;
    /**
     * Process next item in queue
     */
    processNext(handler: (item: WebhookQueueItem) => Promise<void>): Promise<boolean>;
    /**
     * Process all pending items
     */
    processAll(handler: (item: WebhookQueueItem) => Promise<void>): Promise<void>;
    /**
     * Start background processor
     */
    startProcessor(handler: (item: WebhookQueueItem) => Promise<void>, intervalMs?: number): void;
    /**
     * Get queue statistics
     */
    getStats(): {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        failed: number;
        processedCount: number;
    };
    /**
     * Cleanup old completed items
     */
    cleanup(maxAgeMs?: number): number;
}
export declare const webhookQueue: WebhookQueue;
//# sourceMappingURL=webhook-queue.d.ts.map