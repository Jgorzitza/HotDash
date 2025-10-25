/**
 * API Rate Limiter
 *
 * Provides rate limiting for external APIs:
 * - Shopify Admin API
 * - Publer API
 * - Chatwoot API
 */
export interface RateLimitConfig {
    maxRequestsPerSecond: number;
    burstSize: number;
    retryOn429: boolean;
    maxRetries: number;
    initialBackoffMs: number;
    maxBackoffMs: number;
    backoffMultiplier: number;
}
export interface RateLimitInfo {
    api: string;
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
}
export interface RequestQueueItem<T> {
    id: string;
    execute: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: Error) => void;
    retryCount: number;
    enqueuedAt: number;
}
export declare class RateLimiter {
    private config;
    private api;
    private tokens;
    private lastRefill;
    private queue;
    private processing;
    private rateLimitInfo?;
    constructor(api: string, config?: Partial<RateLimitConfig>);
    execute<T>(fn: () => Promise<T>): Promise<T>;
    private refillTokens;
    private processQueue;
    private executeWithRetry;
    private isRateLimitError;
    private isServerError;
    private calculateBackoff;
    private sleep;
    updateRateLimitInfo(info: Partial<RateLimitInfo>): void;
    getRateLimitInfo(): RateLimitInfo | undefined;
    getQueueStats(): {
        queueLength: number;
        tokens: number;
        processing: boolean;
    };
    clear(): void;
}
export declare function getShopifyRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter;
export declare function getPublerRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter;
export declare function getChatwootRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter;
export declare function getRateLimiter(api: string, config?: Partial<RateLimitConfig>): RateLimiter;
export declare function getAllRateLimiterStats(): Record<string, {
    queueLength: number;
    tokens: number;
    processing: boolean;
}>;
//# sourceMappingURL=rate-limiter.d.ts.map