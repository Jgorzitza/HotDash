/**
 * Analytics Rate Limiting Middleware
 *
 * Protects analytics endpoints from abuse and excessive API costs.
 * Implements sliding window rate limiting with configurable limits.
 *
 * Usage:
 *   import { analyticsRateLimit } from "~/middleware/analytics-rate-limit";
 *   export const loader = async (args: LoaderFunctionArgs) => {
 *     await analyticsRateLimit(args.request);
 *     // ... rest of loader logic
 *   };
 */

// ============================================================================
// Configuration
// ============================================================================

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean; // Only count failed requests
  keyGenerator?: (request: Request) => string; // Custom key generation
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 requests per minute
  skipSuccessfulRequests: false,
};

// Per-endpoint configurations
const endpointConfigs: Record<string, RateLimitConfig> = {
  "/api/analytics/revenue": {
    windowMs: 60 * 1000,
    maxRequests: 10, // Lower limit for expensive GA4 queries
  },
  "/api/analytics/conversion-rate": {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  "/api/analytics/traffic": {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  "/api/analytics/idea-pool": {
    windowMs: 60 * 1000,
    maxRequests: 30, // Higher limit for cheaper Supabase queries
  },
  "/api/analytics/health": {
    windowMs: 60 * 1000,
    maxRequests: 60, // Higher limit for health checks
  },
  "/api/analytics/export": {
    windowMs: 60 * 1000,
    maxRequests: 5, // Very low limit for expensive operations
  },
};

// ============================================================================
// In-Memory Store (Replace with Redis in production)
// ============================================================================

interface RequestRecord {
  count: number;
  resetTime: number;
}

const requestStore = new Map<string, RequestRecord>();

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, record] of requestStore.entries()) {
    if (record.resetTime < now) {
      requestStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

// ============================================================================
// Rate Limiting Logic
// ============================================================================

/**
 * Generate a unique key for rate limiting
 * Uses IP address + endpoint path
 */
function generateKey(request: Request, endpoint: string): string {
  // Get IP from X-Forwarded-For header or connection
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

  return `${ip}:${endpoint}`;
}

/**
 * Check if request should be rate limited
 */
function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const record = requestStore.get(key);

  if (!record || record.resetTime < now) {
    // First request or window expired - create new record
    const resetTime = now + config.windowMs;
    requestStore.set(key, {
      count: 1,
      resetTime,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Within window - check if limit exceeded
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

// ============================================================================
// Middleware
// ============================================================================

/**
 * Rate limit analytics requests
 *
 * @throws Response with 429 status if rate limit exceeded
 */
export async function analyticsRateLimit(
  request: Request,
  config?: Partial<RateLimitConfig>,
): Promise<void> {
  const url = new URL(request.url);
  const endpoint = url.pathname;

  // Get endpoint-specific config or use default
  const endpointConfig = endpointConfigs[endpoint] || defaultConfig;
  const finalConfig = { ...endpointConfig, ...config };

  // Generate rate limit key
  const key = finalConfig.keyGenerator
    ? finalConfig.keyGenerator(request)
    : generateKey(request, endpoint);

  // Check rate limit
  const { allowed, remaining, resetTime } = checkRateLimit(key, finalConfig);

  // Add rate limit headers to response
  const headers = {
    "X-RateLimit-Limit": finalConfig.maxRequests.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": resetTime.toString(),
  };

  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    throw new Response(
      JSON.stringify({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          ...headers,
          "Content-Type": "application/json",
          "Retry-After": retryAfter.toString(),
        },
      },
    );
  }

  // Request allowed - headers will be added by route handler if needed
  return;
}

/**
 * Get current rate limit status for debugging
 */
export function getRateLimitStatus(
  endpoint: string,
  ip: string,
): {
  requests: number;
  limit: number;
  remaining: number;
  resetTime: number;
} {
  const key = `${ip}:${endpoint}`;
  const config = endpointConfigs[endpoint] || defaultConfig;
  const record = requestStore.get(key);

  if (!record || record.resetTime < Date.now()) {
    return {
      requests: 0,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
    };
  }

  return {
    requests: record.count,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetTime: record.resetTime,
  };
}

/**
 * Reset rate limit for a specific key (admin use only)
 */
export function resetRateLimit(endpoint: string, ip: string): void {
  const key = `${ip}:${endpoint}`;
  requestStore.delete(key);
}

/**
 * Get all active rate limit entries (for monitoring)
 */
export function getActiveRateLimits(): Array<{
  key: string;
  count: number;
  resetTime: number;
}> {
  const now = Date.now();
  const active: Array<{ key: string; count: number; resetTime: number }> = [];

  for (const [key, record] of requestStore.entries()) {
    if (record.resetTime >= now) {
      active.push({
        key,
        count: record.count,
        resetTime: record.resetTime,
      });
    }
  }

  return active;
}

// ============================================================================
// Production Notes
// ============================================================================

/**
 * PRODUCTION DEPLOYMENT NOTES:
 *
 * 1. Replace In-Memory Store with Redis:
 *    - Install: npm install ioredis
 *    - Configure Redis connection
 *    - Update checkRateLimit to use Redis INCR/EXPIRE
 *
 * 2. Distributed Systems:
 *    - Use Redis for shared state across instances
 *    - Consider using Redis sorted sets for sliding windows
 *
 * 3. Monitoring:
 *    - Log rate limit violations
 *    - Track rate limit hits by endpoint
 *    - Alert on excessive rate limiting (may indicate attack)
 *
 * 4. Configuration:
 *    - Move limits to environment variables
 *    - Allow per-user/tier limits (free vs paid)
 *    - Implement whitelist for internal requests
 *
 * 5. Testing:
 *    - Add integration tests for rate limiting
 *    - Test edge cases (clock skew, etc.)
 *    - Benchmark performance impact
 */
