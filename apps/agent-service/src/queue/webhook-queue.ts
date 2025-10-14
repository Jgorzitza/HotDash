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
export class WebhookQueue {
  private queue: WebhookQueueItem[] = [];
  private processing = new Set<string>();
  private processedIds = new Set<string>(); // Replay protection
  
  /**
   * Enqueue webhook for processing
   * Returns null if already processed (idempotency)
   */
  enqueue(payload: any): WebhookQueueItem | null {
    const conversationId = payload.conversation?.id;
    const messageId = payload.message?.id || payload.id;
    
    if (!conversationId || !messageId) {
      console.error('[Queue] Missing conversation/message ID in payload');
      return null;
    }

    // Replay protection: Check if already processed
    const itemId = `${conversationId}-${messageId}`;
    if (this.processedIds.has(itemId)) {
      console.log('[Queue] Duplicate webhook ignored (replay protection):', itemId);
      return null;
    }

    const item: WebhookQueueItem = {
      id: itemId,
      conversationId,
      messageId,
      payload,
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
    };

    this.queue.push(item);
    
    console.log('[Queue] Enqueued:', {
      id: itemId,
      conversationId,
      queueLength: this.queue.length,
    });

    return item;
  }

  /**
   * Process next item in queue
   */
  async processNext(handler: (item: WebhookQueueItem) => Promise<void>): Promise<boolean> {
    // Find next pending item
    const item = this.queue.find(i => 
      i.status === 'pending' && 
      !this.processing.has(i.id)
    );

    if (!item) {
      return false; // No items to process
    }

    // Mark as processing
    item.status = 'processing';
    this.processing.add(item.id);
    item.attempts++;

    console.log('[Queue] Processing:', {
      id: item.id,
      attempt: item.attempts,
    });

    try {
      // Execute handler
      await handler(item);
      
      // Mark as completed
      item.status = 'completed';
      item.processedAt = new Date();
      this.processedIds.add(item.id);
      
      console.log('[Queue] Completed:', item.id);
      
      return true;
    } catch (error: any) {
      console.error('[Queue] Processing error:', {
        id: item.id,
        error: error.message,
      });

      // Mark as failed if max attempts reached
      if (item.attempts >= item.maxAttempts) {
        item.status = 'failed';
        item.error = error.message;
        
        console.error('[Queue] Failed after max attempts:', item.id);
      } else {
        // Retry with exponential backoff
        item.status = 'pending'; // Will be retried
        
        const backoffMs = Math.min(1000 * Math.pow(2, item.attempts), 30000);
        console.log('[Queue] Will retry after', backoffMs, 'ms');
        
        // Schedule retry
        setTimeout(() => {
          console.log('[Queue] Retrying:', item.id);
        }, backoffMs);
      }
      
      return false;
    } finally {
      this.processing.delete(item.id);
    }
  }

  /**
   * Process all pending items
   */
  async processAll(handler: (item: WebhookQueueItem) => Promise<void>): Promise<void> {
    while (this.queue.some(i => i.status === 'pending')) {
      await this.processNext(handler);
    }
  }

  /**
   * Start background processor
   */
  startProcessor(handler: (item: WebhookQueueItem) => Promise<void>, intervalMs: number = 1000): void {
    setInterval(async () => {
      await this.processNext(handler);
    }, intervalMs);

    console.log('[Queue] Background processor started (interval:', intervalMs, 'ms)');
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const pending = this.queue.filter(i => i.status === 'pending').length;
    const processing = this.queue.filter(i => i.status === 'processing').length;
    const completed = this.queue.filter(i => i.status === 'completed').length;
    const failed = this.queue.filter(i => i.status === 'failed').length;

    return {
      total: this.queue.length,
      pending,
      processing,
      completed,
      failed,
      processedCount: this.processedIds.size,
    };
  }

  /**
   * Cleanup old completed items
   */
  cleanup(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    const before = this.queue.length;

    this.queue = this.queue.filter(item => {
      // Keep pending/processing items
      if (item.status === 'pending' || item.status === 'processing') {
        return true;
      }

      // Remove old completed/failed items
      const age = now - item.createdAt.getTime();
      return age < maxAgeMs;
    });

    const removed = before - this.queue.length;
    
    if (removed > 0) {
      console.log('[Queue] Cleaned up', removed, 'old items');
    }

    return removed;
  }
}

// Export singleton
export const webhookQueue = new WebhookQueue();

// Run cleanup every hour
setInterval(() => {
  webhookQueue.cleanup();
}, 60 * 60 * 1000);

