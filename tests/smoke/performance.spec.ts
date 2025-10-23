/**
 * Performance Smoke Tests
 * 
 * Verifies performance metrics are within acceptable thresholds.
 * Tests page load times, API response times, and resource usage.
 */

import { test, expect } from '@playwright/test';
import { SMOKE_TEST_CONFIG } from './config';

const config = SMOKE_TEST_CONFIG;
const baseURL = config.urls.production;

test.describe('Performance Smoke Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Dashboard loads within threshold', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
      waitUntil: 'load',
    });
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(config.performance.pageLoad);
    
    console.log(`✅ Dashboard loaded in ${loadTime}ms (threshold: ${config.performance.pageLoad}ms)`);
  });

  test('API responses are fast', async ({ request }) => {
    const endpoints = [
      '/api/health',
      '/api/health/database',
      '/api/shopify/health',
    ];
    
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      
      const response = await request.get(`${baseURL}${endpoint}`, {
        timeout: config.timeouts.medium,
      });
      
      const responseTime = Date.now() - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(config.performance.apiResponse);
      
      console.log(`✅ ${endpoint}: ${responseTime}ms`);
    }
  });

  test('Database queries are fast', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/performance`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.queryTime).toBeLessThan(config.performance.databaseQuery);
    
    console.log(`✅ DB query time: ${body.queryTime}ms (threshold: ${config.performance.databaseQuery}ms)`);
  });

  test('Tiles load within threshold', async ({ page }) => {
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
    });
    
    // Wait for tiles to load
    await page.waitForSelector('[data-testid="tile"]', {
      timeout: config.performance.tileLoad,
    });
    
    const tiles = await page.locator('[data-testid="tile"]').count();
    
    expect(tiles).toBeGreaterThan(0);
    
    console.log(`✅ ${tiles} tiles loaded within threshold`);
  });

  test('Memory usage is acceptable', async ({ page }) => {
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
      waitUntil: 'networkidle',
    });
    
    // Get memory metrics
    const metrics = await page.evaluate(() => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        return {
          usedJSHeapSize: mem.usedJSHeapSize,
          totalJSHeapSize: mem.totalJSHeapSize,
          jsHeapSizeLimit: mem.jsHeapSizeLimit,
        };
      }
      return null;
    });
    
    if (metrics) {
      const usagePercent = (metrics.usedJSHeapSize / metrics.jsHeapSizeLimit) * 100;
      
      // Memory usage should be reasonable
      expect(usagePercent).toBeLessThan(80);
      
      console.log(`✅ Memory usage: ${usagePercent.toFixed(1)}%`);
    }
  });

  test('No memory leaks detected', async ({ page }) => {
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
    });
    
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Navigate around
    await page.click('a[href="/app/settings"]').catch(() => {});
    await page.waitForTimeout(1000);
    await page.click('a[href="/app"]').catch(() => {});
    await page.waitForTimeout(1000);
    
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const growth = ((finalMemory - initialMemory) / initialMemory) * 100;
      
      // Memory shouldn't grow significantly
      expect(growth).toBeLessThan(50);
      
      console.log(`✅ Memory growth: ${growth.toFixed(1)}%`);
    }
  });

  test('Network requests are optimized', async ({ page }) => {
    const requests: any[] = [];
    
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      });
    });
    
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
      waitUntil: 'networkidle',
    });
    
    // Count requests by type
    const byType = requests.reduce((acc, req) => {
      acc[req.resourceType] = (acc[req.resourceType] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`✅ Network requests:`, byType);
    
    // Verify reasonable number of requests
    expect(requests.length).toBeLessThan(100);
  });

  test('Images are optimized', async ({ page }) => {
    const largeImages: string[] = [];
    
    page.on('response', async (response) => {
      if (response.request().resourceType() === 'image') {
        const headers = response.headers();
        const contentLength = parseInt(headers['content-length'] || '0');
        
        // Flag images > 500KB
        if (contentLength > 500 * 1024) {
          largeImages.push(response.url());
        }
      }
    });
    
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
      waitUntil: 'networkidle',
    });
    
    expect(largeImages).toHaveLength(0);
    
    console.log(`✅ All images optimized`);
  });

  test('CSS and JS are minified', async ({ page }) => {
    const unminified: string[] = [];
    
    page.on('response', async (response) => {
      const type = response.request().resourceType();
      if (type === 'stylesheet' || type === 'script') {
        const url = response.url();
        
        // Check if file appears to be minified
        if (!url.includes('.min.') && !url.includes('?')) {
          const text = await response.text().catch(() => '');
          
          // Simple heuristic: minified files have long lines
          const lines = text.split('\n');
          const avgLineLength = text.length / lines.length;
          
          if (avgLineLength < 100) {
            unminified.push(url);
          }
        }
      }
    });
    
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
      waitUntil: 'networkidle',
    });
    
    // Allow some unminified files in development
    expect(unminified.length).toBeLessThan(5);
    
    console.log(`✅ Assets minified (${unminified.length} exceptions)`);
  });

  test('Caching headers are set', async ({ request }) => {
    const response = await request.get(`${baseURL}/app`, {
      timeout: config.timeouts.medium,
    });
    
    const headers = response.headers();
    
    // Verify caching headers exist
    expect(headers).toHaveProperty('cache-control');
    
    console.log(`✅ Caching configured: ${headers['cache-control']}`);
  });
});

