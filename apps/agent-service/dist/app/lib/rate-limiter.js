/**
 * API Rate Limiter
 *
 * Provides rate limiting for external APIs:
 * - Shopify Admin API
 * - Publer API
 * - Chatwoot API
 */
const DEFAULT_CONFIG = {
    maxRequestsPerSecond: 10,
    burstSize: 20,
    retryOn429: true,
    maxRetries: 3,
    initialBackoffMs: 1000,
    maxBackoffMs: 30000,
    backoffMultiplier: 2,
};
export class RateLimiter {
    config;
    api;
    tokens;
    lastRefill;
    queue = [];
    processing = false;
    rateLimitInfo;
    constructor(api, config) {
        this.api = api;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.tokens = this.config.burstSize;
        this.lastRefill = Date.now();
    }
    async execute(fn) {
        return new Promise((resolve, reject) => {
            const item = {
                id: crypto.randomUUID(),
                execute: fn,
                resolve: resolve,
                reject,
                retryCount: 0,
                enqueuedAt: Date.now(),
            };
            this.queue.push(item);
            this.processQueue();
        });
    }
    refillTokens() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const tokensToAdd = Math.floor((elapsed / 1000) * this.config.maxRequestsPerSecond);
        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.tokens + tokensToAdd, this.config.burstSize);
            this.lastRefill = now;
        }
    }
    async processQueue() {
        if (this.processing)
            return;
        this.processing = true;
        while (this.queue.length > 0) {
            this.refillTokens();
            if (this.tokens < 1) {
                await this.sleep(1000 / this.config.maxRequestsPerSecond);
                continue;
            }
            const item = this.queue.shift();
            if (!item)
                break;
            this.tokens -= 1;
            try {
                const result = await this.executeWithRetry(item);
                item.resolve(result);
            }
            catch (error) {
                item.reject(error instanceof Error ? error : new Error("Unknown error"));
            }
        }
        this.processing = false;
    }
    async executeWithRetry(item) {
        try {
            return await item.execute();
        }
        catch (error) {
            if (this.isRateLimitError(error) &&
                this.config.retryOn429 &&
                item.retryCount < this.config.maxRetries) {
                const backoff = this.calculateBackoff(item.retryCount);
                await this.sleep(backoff);
                item.retryCount += 1;
                return this.executeWithRetry(item);
            }
            if (this.isServerError(error) &&
                item.retryCount < this.config.maxRetries) {
                const backoff = this.calculateBackoff(item.retryCount);
                await this.sleep(backoff);
                item.retryCount += 1;
                return this.executeWithRetry(item);
            }
            throw error;
        }
    }
    isRateLimitError(error) {
        if (error instanceof Error) {
            return (error.message.toLowerCase().includes("429") ||
                error.message.toLowerCase().includes("rate limit"));
        }
        return false;
    }
    isServerError(error) {
        if (error instanceof Error) {
            const match = error.message.match(/\b5\d{2}\b/);
            return !!match;
        }
        return false;
    }
    calculateBackoff(retryCount) {
        const delay = this.config.initialBackoffMs *
            Math.pow(this.config.backoffMultiplier, retryCount);
        return Math.min(delay, this.config.maxBackoffMs);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    updateRateLimitInfo(info) {
        this.rateLimitInfo = {
            api: this.api,
            limit: info.limit || 0,
            remaining: info.remaining || 0,
            reset: info.reset || 0,
            retryAfter: info.retryAfter,
        };
        if (info.remaining !== undefined) {
            this.tokens = Math.min(info.remaining, this.config.burstSize);
        }
    }
    getRateLimitInfo() {
        return this.rateLimitInfo;
    }
    getQueueStats() {
        return {
            queueLength: this.queue.length,
            tokens: this.tokens,
            processing: this.processing,
        };
    }
    clear() {
        this.queue = [];
        this.tokens = this.config.burstSize;
        this.lastRefill = Date.now();
        this.processing = false;
    }
}
class RateLimiterRegistry {
    limiters = new Map();
    get(api, config) {
        if (!this.limiters.has(api)) {
            this.limiters.set(api, new RateLimiter(api, config));
        }
        return this.limiters.get(api);
    }
    getAllStats() {
        const stats = {};
        for (const [api, limiter] of this.limiters.entries()) {
            stats[api] = limiter.getQueueStats();
        }
        return stats;
    }
    clearAll() {
        for (const limiter of this.limiters.values()) {
            limiter.clear();
        }
    }
}
const registry = new RateLimiterRegistry();
export function getShopifyRateLimiter(config) {
    return registry.get("shopify", {
        maxRequestsPerSecond: 2,
        burstSize: 10,
        ...config,
    });
}
export function getPublerRateLimiter(config) {
    return registry.get("publer", {
        maxRequestsPerSecond: 5,
        burstSize: 15,
        ...config,
    });
}
export function getChatwootRateLimiter(config) {
    return registry.get("chatwoot", {
        maxRequestsPerSecond: 10,
        burstSize: 30,
        ...config,
    });
}
export function getRateLimiter(api, config) {
    return registry.get(api, config);
}
export function getAllRateLimiterStats() {
    return registry.getAllStats();
}
//# sourceMappingURL=rate-limiter.js.map