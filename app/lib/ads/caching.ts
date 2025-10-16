/**
 * Caching for Heavy Ads Reports
 * 
 * Purpose: Cache expensive ad performance calculations
 * Owner: ads agent
 * Date: 2025-10-15
 */

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

export class AdsCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttlMs: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttlMs,
      createdAt: Date.now(),
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): number {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    return removed;
  }
}

export const campaignPerformanceCache = new AdsCache<any>(5 * 60 * 1000);
export const aggregatedPerformanceCache = new AdsCache<any>(5 * 60 * 1000);
export const budgetPacingCache = new AdsCache<any>(1 * 60 * 1000);

