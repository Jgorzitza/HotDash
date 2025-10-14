/**
 * Simple in-memory cache with TTL support
 * Used for dashboard tile data to reduce API calls
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Simple in-memory cache implementation with TTL support
 * 
 * @example
 * ```typescript
 * const data = cache.get<MyType>('my-key');
 * if (!data) {
 *   const freshData = await fetchData();
 *   cache.set('my-key', freshData);
 * }
 * ```
 */
class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get a cached value by key
   * 
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set a cached value with optional TTL
   * 
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Delete a cached value by key
   * 
   * @param key - Cache key to delete
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache entries by pattern
   * 
   * @param pattern - String pattern or RegExp to match keys
   * @example
   * ```typescript
   * // Invalidate all sales caches
   * cache.invalidate(/^sales:/);
   * 
   * // Invalidate specific shop caches
   * cache.invalidate('shop123');
   * ```
   */
  invalidate(pattern: string | RegExp): number {
    let count = 0;
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean up expired entries
   * Called automatically every 60 seconds
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const cache = new SimpleCache();

// Cleanup expired entries every minute
if (typeof setInterval !== "undefined") {
  setInterval(() => cache.cleanup(), 60 * 1000);
}

/**
 * Helper to wrap async functions with caching
 * 
 * @param key - Unique cache key for this operation
 * @param fetcher - Async function to fetch fresh data
 * @param ttl - Optional time to live in milliseconds
 * @returns Cached data if available, otherwise fetches and caches
 * 
 * @example
 * ```typescript
 * const data = await withCache(
 *   'sales:shop123',
 *   () => fetchSalesData('shop123'),
 *   5 * 60 * 1000 // 5 minutes
 * );
 * ```
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number,
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}

