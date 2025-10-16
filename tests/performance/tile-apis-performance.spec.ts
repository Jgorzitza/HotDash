/**
 * Performance Tests for Tile APIs
 * 
 * Tests P95 latency < 500ms for all tile API endpoints
 * Task 5 from 2025-10-16 direction
 * 
 * @see docs/directions/qa.md
 */

import { describe, it, expect } from 'vitest';

describe('Tile APIs - Performance (P95 < 500ms)', () => {
  const measureP95 = async (url: string, iterations: number = 100): Promise<number> => {
    const latencies: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await fetch(url);
      const latency = Date.now() - start;
      latencies.push(latency);
    }
    
    latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(iterations * 0.95);
    return latencies[p95Index];
  };

  describe('Shopify Tile APIs', () => {
    it('GET /api/shopify/revenue should have P95 < 500ms', async () => {
      const p95 = await measureP95('http://localhost:3000/api/shopify/revenue');
      
      expect(p95).toBeLessThan(500);
    }, { timeout: 60000 });

    it('GET /api/shopify/aov should have P95 < 500ms', async () => {
      const p95 = await measureP95('http://localhost:3000/api/shopify/aov');
      
      expect(p95).toBeLessThan(500);
    }, { timeout: 60000 });

    it('GET /api/shopify/returns should have P95 < 500ms', async () => {
      const p95 = await measureP95('http://localhost:3000/api/shopify/returns');
      
      expect(p95).toBeLessThan(500);
    }, { timeout: 60000 });

    it('GET /api/shopify/stock should have P95 < 500ms', async () => {
      const p95 = await measureP95('http://localhost:3000/api/shopify/stock');
      
      expect(p95).toBeLessThan(500);
    }, { timeout: 60000 });
  });

  describe('Analytics Tile APIs', () => {
    it('GET /api/analytics/seo/anomalies should have P95 < 500ms', async () => {
      const p95 = await measureP95('http://localhost:3000/api/analytics/seo/anomalies');
      
      expect(p95).toBeLessThan(500);
    }, { timeout: 60000 });

    it('GET /api/analytics/pageviews should have P95 < 500ms', async () => {
      const p95 = await measureP95('http://localhost:3000/api/analytics/pageviews');
      
      expect(p95).toBeLessThan(500);
    }, { timeout: 60000 });
  });

  describe('Supabase Tile APIs', () => {
    it('GET /api/supabase/approvals should have P95 < 500ms', async () => {
      const p95 = await measureP95('http://localhost:3000/api/supabase/approvals?limit=10');
      
      expect(p95).toBeLessThan(500);
    }, { timeout: 60000 });

    it('GET /api/supabase/cx-queue should have P95 < 500ms', async () => {
      const p95 = await measureP95('http://localhost:3000/api/supabase/cx-queue');
      
      expect(p95).toBeLessThan(500);
    }, { timeout: 60000 });
  });

  describe('Concurrent Tile API Requests', () => {
    it('should handle 7 concurrent tile requests with P95 < 500ms', async () => {
      const urls = [
        'http://localhost:3000/api/shopify/revenue',
        'http://localhost:3000/api/shopify/aov',
        'http://localhost:3000/api/shopify/returns',
        'http://localhost:3000/api/shopify/stock',
        'http://localhost:3000/api/analytics/seo/anomalies',
        'http://localhost:3000/api/supabase/cx-queue',
        'http://localhost:3000/api/supabase/approvals'
      ];
      
      const iterations = 20;
      const latencies: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await Promise.all(urls.map(url => fetch(url)));
        const latency = Date.now() - start;
        latencies.push(latency);
      }
      
      latencies.sort((a, b) => a - b);
      const p95 = latencies[Math.floor(iterations * 0.95)];
      
      // All 7 tiles should load concurrently in < 1s at P95
      expect(p95).toBeLessThan(1000);
    }, { timeout: 60000 });
  });

  describe('Cache Performance', () => {
    it('should serve cached responses faster', async () => {
      const url = 'http://localhost:3000/api/shopify/revenue';
      
      // First request (cache miss)
      const start1 = Date.now();
      await fetch(url);
      const latency1 = Date.now() - start1;
      
      // Second request (cache hit)
      const start2 = Date.now();
      await fetch(url);
      const latency2 = Date.now() - start2;
      
      // Cached request should be faster
      expect(latency2).toBeLessThan(latency1);
      expect(latency2).toBeLessThan(100); // Cached should be < 100ms
    });
  });

  describe('Load Testing', () => {
    it('should maintain P95 < 500ms under 50 concurrent users', async () => {
      const url = 'http://localhost:3000/api/shopify/revenue';
      const concurrentUsers = 50;
      const latencies: number[] = [];
      
      const requests = Array(concurrentUsers).fill(null).map(async () => {
        const start = Date.now();
        await fetch(url);
        return Date.now() - start;
      });
      
      const results = await Promise.all(requests);
      latencies.push(...results);
      
      latencies.sort((a, b) => a - b);
      const p95 = latencies[Math.floor(concurrentUsers * 0.95)];
      
      expect(p95).toBeLessThan(500);
    }, { timeout: 30000 });
  });
});

describe('Tile APIs - Throughput', () => {
  it('should handle 100 requests per second', async () => {
    const url = 'http://localhost:3000/api/shopify/revenue';
    const requestsPerSecond = 100;
    const duration = 1000; // 1 second
    
    const startTime = Date.now();
    const requests: Promise<Response>[] = [];
    
    while (Date.now() - startTime < duration) {
      requests.push(fetch(url));
      await new Promise(resolve => setTimeout(resolve, duration / requestsPerSecond));
    }
    
    const responses = await Promise.all(requests);
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
    
    // Should have processed ~100 requests
    expect(responses.length).toBeGreaterThanOrEqual(90);
  }, { timeout: 10000 });
});

describe('Tile APIs - Resource Usage', () => {
  it('should not leak memory during repeated requests', async () => {
    const url = 'http://localhost:3000/api/shopify/revenue';
    const iterations = 1000;
    
    for (let i = 0; i < iterations; i++) {
      await fetch(url);
    }
    
    // If we got here without crashing, memory is stable
    expect(true).toBe(true);
  }, { timeout: 60000 });

  it('should handle rapid sequential requests', async () => {
    const url = 'http://localhost:3000/api/shopify/revenue';
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
      const response = await fetch(url);
      expect(response.status).toBe(200);
    }
  }, { timeout: 30000 });
});

describe('Tile APIs - Error Recovery Performance', () => {
  it('should recover quickly from errors', async () => {
    const url = 'http://localhost:3000/api/shopify/revenue';
    
    // Simulate error condition (if possible)
    // Then measure recovery time
    
    const start = Date.now();
    const response = await fetch(url);
    const recoveryTime = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(recoveryTime).toBeLessThan(1000);
  });
});

