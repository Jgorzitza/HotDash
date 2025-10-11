/**
 * Simple in-memory rate limiter for MCP server
 * Tracks requests per client IP and enforces limits
 */
export class RateLimiter {
    requests = new Map();
    maxRequests;
    windowMs;
    constructor(maxRequests = 100, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        // Clean up expired entries every minute
        setInterval(() => this.cleanup(), 60000);
    }
    /**
     * Check if request should be allowed
     * Returns true if allowed, false if rate limit exceeded
     */
    checkLimit(clientId) {
        const now = Date.now();
        const entry = this.requests.get(clientId);
        if (!entry || now > entry.resetTime) {
            // New window or expired - allow and reset
            this.requests.set(clientId, {
                count: 1,
                resetTime: now + this.windowMs,
            });
            return true;
        }
        if (entry.count >= this.maxRequests) {
            // Rate limit exceeded
            return false;
        }
        // Increment counter
        entry.count++;
        return true;
    }
    /**
     * Get remaining requests for a client
     */
    getRemaining(clientId) {
        const entry = this.requests.get(clientId);
        if (!entry || Date.now() > entry.resetTime) {
            return this.maxRequests;
        }
        return Math.max(0, this.maxRequests - entry.count);
    }
    /**
     * Get reset time for a client (ms since epoch)
     */
    getResetTime(clientId) {
        const entry = this.requests.get(clientId);
        return entry?.resetTime || Date.now() + this.windowMs;
    }
    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [clientId, entry] of this.requests.entries()) {
            if (now > entry.resetTime) {
                this.requests.delete(clientId);
            }
        }
    }
    /**
     * Get stats about rate limiting
     */
    getStats() {
        return {
            activeClients: this.requests.size,
            maxRequests: this.maxRequests,
            windowMs: this.windowMs,
        };
    }
}
export const rateLimiter = new RateLimiter(Number(process.env.RATE_LIMIT_MAX || 100), Number(process.env.RATE_LIMIT_WINDOW_MS || 60000));
//# sourceMappingURL=rate-limiter.js.map