/**
 * Social Post Queue Service
 *
 * Manages queuing and retry logic for failed social posts
 * Tracks post status and handles automatic retries
 */
import { createPublerAdapter } from "~/services/publer/adapter";
const DEFAULT_RETRY_CONFIG = {
    maxAttempts: 5,
    initialDelay: 5000,
    maxDelay: 300000,
    backoffMultiplier: 2,
};
export class SocialPostQueue {
    queue;
    processing;
    retryConfig;
    adapter;
    constructor(retryConfig) {
        this.queue = new Map();
        this.processing = new Set();
        this.retryConfig = {
            ...DEFAULT_RETRY_CONFIG,
            ...retryConfig,
        };
        this.adapter = createPublerAdapter();
    }
    enqueue(approval, priority = 5) {
        const queuedPost = {
            id: crypto.randomUUID(),
            approval,
            status: "queued",
            priority,
            attempts: 0,
            maxAttempts: this.retryConfig.maxAttempts,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.queue.set(queuedPost.id, queuedPost);
        return queuedPost;
    }
    getNextPost() {
        const now = Date.now();
        const readyPosts = Array.from(this.queue.values()).filter((post) => {
            if (this.processing.has(post.id))
                return false;
            if (post.status === "completed" ||
                (post.status === "failed" && post.attempts >= post.maxAttempts))
                return false;
            if (post.nextRetryAt && new Date(post.nextRetryAt).getTime() > now)
                return false;
            return true;
        });
        if (readyPosts.length === 0)
            return null;
        readyPosts.sort((a, b) => {
            if (a.priority !== b.priority)
                return b.priority - a.priority;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        return readyPosts[0];
    }
    async processPost(post) {
        this.processing.add(post.id);
        try {
            post.status = post.attempts > 0 ? "retrying" : "processing";
            post.attempts += 1;
            post.lastAttemptAt = new Date().toISOString();
            post.updatedAt = new Date().toISOString();
            this.queue.set(post.id, post);
            const result = await this.adapter.publishApproval(post.approval);
            if (result.success) {
                post.status = "completed";
                post.receipt = result.receipt;
                post.error = undefined;
            }
            else {
                post.error = result.error || "Unknown error";
                if (post.attempts < post.maxAttempts) {
                    const retryDelay = this.calculateRetryDelay(post.attempts);
                    const nextRetry = new Date(Date.now() + retryDelay);
                    post.nextRetryAt = nextRetry.toISOString();
                    post.status = "queued";
                }
                else {
                    post.status = "failed";
                }
            }
        }
        catch (error) {
            post.error = error instanceof Error ? error.message : "Unknown error";
            if (post.attempts < post.maxAttempts) {
                const retryDelay = this.calculateRetryDelay(post.attempts);
                const nextRetry = new Date(Date.now() + retryDelay);
                post.nextRetryAt = nextRetry.toISOString();
                post.status = "queued";
            }
            else {
                post.status = "failed";
            }
        }
        finally {
            post.updatedAt = new Date().toISOString();
            this.queue.set(post.id, post);
            this.processing.delete(post.id);
        }
    }
    calculateRetryDelay(attempt) {
        const delay = this.retryConfig.initialDelay *
            Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
        return Math.min(delay, this.retryConfig.maxDelay);
    }
    async processQueue() {
        let post = this.getNextPost();
        while (post) {
            await this.processPost(post);
            post = this.getNextPost();
        }
    }
    getPost(id) {
        return this.queue.get(id);
    }
    getAllPosts(status) {
        const posts = Array.from(this.queue.values());
        if (status)
            return posts.filter((post) => post.status === status);
        return posts;
    }
    getStats() {
        const posts = Array.from(this.queue.values());
        return {
            total: posts.length,
            queued: posts.filter((p) => p.status === "queued").length,
            processing: posts.filter((p) => p.status === "processing").length,
            completed: posts.filter((p) => p.status === "completed").length,
            failed: posts.filter((p) => p.status === "failed").length,
            retrying: posts.filter((p) => p.status === "retrying").length,
        };
    }
    cleanup(maxAgeMs) {
        const now = Date.now();
        const cutoff = now - maxAgeMs;
        let removed = 0;
        for (const [id, post] of this.queue.entries()) {
            if (post.status === "completed" || post.status === "failed") {
                const updatedAt = new Date(post.updatedAt).getTime();
                if (updatedAt < cutoff) {
                    this.queue.delete(id);
                    removed++;
                }
            }
        }
        return removed;
    }
    cancel(id) {
        const post = this.queue.get(id);
        if (!post)
            return false;
        if (post.status === "processing" || post.status === "completed")
            return false;
        post.status = "failed";
        post.error = "Cancelled by user";
        post.updatedAt = new Date().toISOString();
        this.queue.set(id, post);
        return true;
    }
    clear() {
        this.queue.clear();
        this.processing.clear();
    }
}
export function createSocialPostQueue(retryConfig) {
    return new SocialPostQueue(retryConfig);
}
let queueInstance = null;
export function getSocialPostQueue() {
    if (!queueInstance) {
        queueInstance = createSocialPostQueue();
    }
    return queueInstance;
}
//# sourceMappingURL=queue.js.map