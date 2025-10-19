/**
 * Draft Cache — Avoid regenerating identical queries
 *
 * LRU cache for draft replies to reduce:
 * - LLM API calls
 * - Processing time
 * - Token costs
 */

interface CacheEntry {
  draft: string;
  confidence: number;
  ragSources: string[];
  createdAt: number; // Unix timestamp
  hits: number;
}

export class DraftCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttlMs: number;

  constructor(options: { maxSize?: number; ttlMinutes?: number } = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
    this.ttlMs = (options.ttlMinutes || 60) * 60 * 1000;
  }

  /**
   * Generate cache key from conversation context
   */
  private getCacheKey(messages: string[]): string {
    // Use last 3 messages as cache key
    const recentMessages = messages.slice(-3);
    return recentMessages.join("|");
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.createdAt > this.ttlMs;
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cached draft if available
   */
  get(messages: string[]): CacheEntry | null {
    const key = this.getCacheKey(messages);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check expiration
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Increment hit counter
    entry.hits++;

    return entry;
  }

  /**
   * Store draft in cache
   */
  set(
    messages: string[],
    draft: string,
    confidence: number,
    ragSources: string[] = [],
  ): void {
    const key = this.getCacheKey(messages);

    // Evict if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, {
      draft,
      confidence,
      ragSources,
      createdAt: Date.now(),
      hits: 0,
    });
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    avgHitsPerEntry: number;
  } {
    const totalHits = Array.from(this.cache.values()).reduce(
      (sum, e) => sum + e.hits,
      0,
    );
    const avgHits = this.cache.size > 0 ? totalHits / this.cache.size : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track total requests
      totalHits,
      avgHitsPerEntry: Number(avgHits.toFixed(2)),
    };
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance
let globalCache: DraftCache | null = null;

/**
 * Get or create global draft cache instance
 */
export function getDraftCache(): DraftCache {
  if (!globalCache) {
    globalCache = new DraftCache({
      maxSize: 100,
      ttlMinutes: 60,
    });
  }
  return globalCache;
}
