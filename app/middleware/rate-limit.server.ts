/**
 * Rate limiting middleware for API routes
 * 
 * Implements token bucket algorithm for rate limiting
 * to protect against abuse and ensure fair resource usage.
 */

interface RateLimitConfig {
  maxRequests: number; // Maximum requests per window
  windowMs: number; // Time window in milliseconds
  keyGenerator?: (request: Request) => string; // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   * 
   * @param request - Request object
   * @returns { allowed: boolean, remaining: number, resetAt: number }
   */
  check(request: Request): { allowed: boolean; remaining: number; resetAt: number } {
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(request)
      : this.getDefaultKey(request);

    const now = Date.now();
    const entry = this.limits.get(key);

    // No entry or expired window - allow and create new entry
    if (!entry || now >= entry.resetAt) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: now + this.config.windowMs,
      };
    }

    // Within window - check count
    if (entry.count < this.config.maxRequests) {
      entry.count++;
      return {
        allowed: true,
        remaining: this.config.maxRequests - entry.count,
        resetAt: entry.resetAt,
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Default key generator using IP address
   */
  private getDefaultKey(request: Request): string {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const url = new URL(request.url);
    return `${ip}:${url.pathname}`;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetAt) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Get current rate limit stats
   */
  getStats(): { totalKeys: number; activeKeys: number } {
    const now = Date.now();
    const activeKeys = Array.from(this.limits.values()).filter(
      (entry) => now < entry.resetAt,
    ).length;

    return {
      totalKeys: this.limits.size,
      activeKeys,
    };
  }
}

// Default rate limiters for different route types
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000, // per minute
});

export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 requests
  windowMs: 60 * 1000, // per minute
});

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    apiRateLimiter.cleanup();
    authRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Middleware wrapper for rate limiting
 * 
 * @example
 * ```typescript
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   return withRateLimit(request, apiRateLimiter, async () => {
 *     // Your loader logic here
 *     return Response.json({ data: 'example' });
 *   });
 * }
 * ```
 */
export async function withRateLimit(
  request: Request,
  limiter: RateLimiter,
  handler: () => Promise<Response>,
): Promise<Response> {
  const result = limiter.check(request);

  if (!result.allowed) {
    return Response.json(
      {
        error: "Rate limit exceeded",
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": limiter["config"].maxRequests.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
        },
      },
    );
  }

  const response = await handler();

  // Add rate limit headers to response
  response.headers.set("X-RateLimit-Limit", limiter["config"].maxRequests.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(result.resetAt).toISOString());

  return response;
}

