/**
 * Simple in-memory rate limiter for MCP server
 * Tracks requests per client IP and enforces limits
 */
export declare class RateLimiter {
    private requests;
    private readonly maxRequests;
    private readonly windowMs;
    constructor(maxRequests?: number, windowMs?: number);
    /**
     * Check if request should be allowed
     * Returns true if allowed, false if rate limit exceeded
     */
    checkLimit(clientId: string): boolean;
    /**
     * Get remaining requests for a client
     */
    getRemaining(clientId: string): number;
    /**
     * Get reset time for a client (ms since epoch)
     */
    getResetTime(clientId: string): number;
    /**
     * Clean up expired entries
     */
    private cleanup;
    /**
     * Get stats about rate limiting
     */
    getStats(): {
        activeClients: number;
        maxRequests: number;
        windowMs: number;
    };
}
export declare const rateLimiter: RateLimiter;
//# sourceMappingURL=rate-limiter.d.ts.map