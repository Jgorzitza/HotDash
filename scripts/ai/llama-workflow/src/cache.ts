/**
 * Simple in-memory cache for query results
 * TTL: 5 minutes (300 seconds)
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class QueryCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private ttlMs: number;

  constructor(ttlSeconds: number = 300) {
    this.ttlMs = ttlSeconds * 1000;
  }

  /**
   * Generate cache key from query string and parameters
   */
  private generateKey(query: string, params?: Record<string, any>): string {
    const normalized = query.toLowerCase().trim();
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${normalized}:${paramsStr}`;
  }

  /**
   * Get cached result if available and not expired
   */
  get(query: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(query, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Store result in cache with TTL
   */
  set(query: string, value: T, params?: Record<string, any>): void {
    const key = this.generateKey(query, params);
    const expiresAt = Date.now() + this.ttlMs;

    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries (cleanup)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      ttlSeconds: this.ttlMs / 1000,
    };
  }
}

// Global cache instance (5-minute TTL)
export const queryCache = new QueryCache(300);

// Run cleanup every 60 seconds
setInterval(() => {
  queryCache.cleanup();
}, 60000);

