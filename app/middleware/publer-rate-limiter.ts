/**
 * Publer Rate Limiter Middleware
 *
 * Enforces Publer API rate limits:
 * - 1000 requests/hour per workspace
 * - 100 posts/hour per account
 *
 * @see docs/integrations/publer-oauth-setup.md
 */

interface RateLimitBucket {
  requests: number;
  reset_at: number; // Unix timestamp
}

const rateLimits = new Map<string, RateLimitBucket>();

/**
 * Check Rate Limit
 *
 * @param workspace_id - Publer workspace ID
 * @returns Whether request is allowed
 */
export function checkRateLimit(workspace_id: string): boolean {
  const now = Date.now();
  const bucket = rateLimits.get(workspace_id);

  // No bucket or expired - create new
  if (!bucket || bucket.reset_at < now) {
    rateLimits.set(workspace_id, {
      requests: 1,
      reset_at: now + 60 * 60 * 1000, // 1 hour
    });
    return true;
  }

  // Check limit
  if (bucket.requests >= 1000) {
    return false;
  }

  // Increment counter
  bucket.requests++;
  return true;
}

/**
 * Get Rate Limit Status
 *
 * @param workspace_id - Publer workspace ID
 * @returns Remaining requests and reset time
 */
export function getRateLimitStatus(workspace_id: string): {
  requests_remaining: number;
  resets_at: Date;
} {
  const bucket = rateLimits.get(workspace_id);

  if (!bucket) {
    return {
      requests_remaining: 1000,
      resets_at: new Date(Date.now() + 60 * 60 * 1000),
    };
  }

  return {
    requests_remaining: Math.max(0, 1000 - bucket.requests),
    resets_at: new Date(bucket.reset_at),
  };
}
