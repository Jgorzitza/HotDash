/**
 * Rate Limiter Tests
 * Tests: 8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RateLimiter,
  getShopifyRateLimiter,
  getPublerRateLimiter,
  getChatwootRateLimiter,
} from '../../../app/lib/rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter('test-api', {
      maxRequestsPerSecond: 10,
      burstSize: 20,
      retryOn429: true,
      maxRetries: 3,
      initialBackoffMs: 100,
      maxBackoffMs: 1000,
      backoffMultiplier: 2,
    });
  });

  describe('Token Bucket Algorithm', () => {
    it('should allow burst requests', async () => {
      const requests: Promise<string>[] = [];
      for (let i = 0; i < 20; i++) {
        requests.push(limiter.execute(async () => `request-${i}`));
      }

      const results = await Promise.all(requests);
      expect(results).toHaveLength(20);
      expect(results[0]).toBe('request-0');
    });

    it('should queue requests when tokens exhausted', async () => {
      const startTime = Date.now();
      
      // Request 25 items (20 burst + 5 queued)
      const requests: Promise<string>[] = [];
      for (let i = 0; i < 25; i++) {
        requests.push(limiter.execute(async () => `request-${i}`));
      }

      await Promise.all(requests);
      const elapsed = Date.now() - startTime;

      // Should take at least 100ms to process the extra 5 (10 req/s = 100ms/req)
      expect(elapsed).toBeGreaterThan(50);
    });
  });

  describe('Retry Logic', () => {
    it('should retry on 429 errors', async () => {
      let attemptCount = 0;
      const mockFn = vi.fn(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error('429 Rate limit exceeded');
        }
        return 'success';
      });

      const result = await limiter.execute(mockFn);
      expect(result).toBe('success');
      expect(attemptCount).toBe(2);
    });

    it('should retry on server errors (500+)', async () => {
      let attemptCount = 0;
      const mockFn = vi.fn(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error('500 Internal Server Error');
        }
        return 'success';
      });

      const result = await limiter.execute(mockFn);
      expect(result).toBe('success');
      expect(attemptCount).toBe(2);
    });

    it('should throw after max retries', async () => {
      const mockFn = vi.fn(async () => {
        throw new Error('429 Rate limit exceeded');
      });

      await expect(limiter.execute(mockFn)).rejects.toThrow('Rate limit exceeded');
      expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should not retry on client errors', async () => {
      const mockFn = vi.fn(async () => {
        throw new Error('404 Not found');
      });

      await expect(limiter.execute(mockFn)).rejects.toThrow('404');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rate Limit Info Management', () => {
    it('should update and retrieve rate limit info', () => {
      limiter.updateRateLimitInfo({
        limit: 100,
        remaining: 50,
        reset: 1234567890,
      });

      const info = limiter.getRateLimitInfo();
      expect(info).toEqual({
        api: 'test-api',
        limit: 100,
        remaining: 50,
        reset: 1234567890,
      });
    });
  });
});

describe('Rate Limiter Registry', () => {
  it('should provide Shopify rate limiter', () => {
    const limiter = getShopifyRateLimiter();
    expect(limiter).toBeDefined();
    const stats = limiter.getQueueStats();
    expect(stats.tokens).toBe(10);
  });

  it('should provide Publer rate limiter', () => {
    const limiter = getPublerRateLimiter();
    expect(limiter).toBeDefined();
    const stats = limiter.getQueueStats();
    expect(stats.tokens).toBe(15);
  });

  it('should provide Chatwoot rate limiter', () => {
    const limiter = getChatwootRateLimiter();
    expect(limiter).toBeDefined();
    const stats = limiter.getQueueStats();
    expect(stats.tokens).toBe(30);
  });
});
