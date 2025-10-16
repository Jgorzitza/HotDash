/**
 * LRU Cache for Frequent Reads
 * Owner: integrations agent
 * Date: 2025-10-15
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

export interface LRUCacheOptions {
  maxSize: number;
  ttlMs: number;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];
  private readonly maxSize: number;
  private readonly ttlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(options: LRUCacheOptions) {
    this.maxSize = options.maxSize;
    this.ttlMs = options.ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.misses++;
      return null;
    }

    this.hits++;
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.updateAccessOrder(key);
    
    return entry.value;
  }

  set(key: string, value: T): void {
    const now = Date.now();
    
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      entry.value = value;
      entry.expiresAt = now + this.ttlMs;
      entry.lastAccessed = now;
      this.updateAccessOrder(key);
    } else {
      if (this.cache.size >= this.maxSize) {
        this.evictLRU();
      }

      this.cache.set(key, {
        value,
        expiresAt: now + this.ttlMs,
        accessCount: 0,
        lastAccessed: now,
      });
      this.accessOrder.push(key);
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0,
    };
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;
    
    const lruKey = this.accessOrder.shift()!;
    this.cache.delete(lruKey);
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
}

// Global caches for different data types
export const shopifyCache = new LRUCache<any>({
  maxSize: 100,
  ttlMs: 5 * 60 * 1000, // 5 minutes
});

export const supabaseCache = new LRUCache<any>({
  maxSize: 200,
  ttlMs: 2 * 60 * 1000, // 2 minutes
});

export const analyticsCache = new LRUCache<any>({
  maxSize: 50,
  ttlMs: 10 * 60 * 1000, // 10 minutes
});
