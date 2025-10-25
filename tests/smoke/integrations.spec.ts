/**
 * Integration Smoke Tests
 * 
 * Verifies external service connectivity and integration health.
 * Tests Shopify, Supabase, Chatwoot, and other critical integrations.
 */

import { test, expect } from '@playwright/test';
import { SMOKE_TEST_CONFIG } from './config';

const config = SMOKE_TEST_CONFIG;
const baseURL = config.urls.production;

test.describe('Integration Smoke Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Shopify API is accessible', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/shopify/health`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('connected', true);
    expect(body).toHaveProperty('shop');
    
    console.log(`✅ Shopify connected: ${body.shop}`);
  });

  test('Supabase is accessible', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/supabase/health`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('connected', true);
    expect(body).toHaveProperty('latency');
    
    console.log(`✅ Supabase connected (${body.latency}ms)`);
  });

  test('Chatwoot API is accessible', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/chatwoot/health`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('connected', true);
    
    console.log(`✅ Chatwoot connected`);
  });

  test('All external services respond', async ({ request }) => {
    const healthChecks = await Promise.all([
      request.get(`${baseURL}/api/shopify/health`),
      request.get(`${baseURL}/api/supabase/health`),
      request.get(`${baseURL}/api/chatwoot/health`),
    ]);
    
    healthChecks.forEach((response, index) => {
      expect(response.status()).toBeLessThan(500);
    });
    
    console.log(`✅ All ${healthChecks.length} external services responding`);
  });

  test('API authentication works', async ({ request }) => {
    // Test that unauthenticated requests are rejected
    const response = await request.get(`${baseURL}/api/protected/endpoint`, {
      timeout: config.timeouts.short,
    });
    
    expect([401, 403]).toContain(response.status());
    
    console.log(`✅ API authentication enforced`);
  });

  test('Webhook endpoints are accessible', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/webhooks/health`, {
      timeout: config.timeouts.short,
      data: { test: true },
    });
    
    expect(response.status()).toBeLessThan(500);
    
    console.log(`✅ Webhook endpoints accessible`);
  });

  test('CDN assets load correctly', async ({ page }) => {
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
    });
    
    // Check for failed resource loads
    const failedResources: string[] = [];
    
    page.on('requestfailed', (request) => {
      failedResources.push(request.url());
    });
    
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable failures (analytics, etc.)
    const criticalFailures = failedResources.filter(url => 
      !url.includes('analytics') && 
      !url.includes('tracking')
    );
    
    expect(criticalFailures).toHaveLength(0);
    
    console.log(`✅ All critical assets loaded`);
  });

  test('Email service is configured', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/email/health`, {
      timeout: config.timeouts.short,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('configured', true);
    
    console.log(`✅ Email service configured`);
  });

  test('Background jobs are running', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/jobs/health`, {
      timeout: config.timeouts.short,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('running', true);
    expect(body).toHaveProperty('queueSize');
    
    console.log(`✅ Background jobs running (queue: ${body.queueSize})`);
  });

  test('Cache is operational', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/cache/health`, {
      timeout: config.timeouts.short,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('operational', true);
    expect(body).toHaveProperty('hitRate');
    
    console.log(`✅ Cache operational (hit rate: ${(body.hitRate * 100).toFixed(1)}%)`);
  });
});

test.describe('Integration - Service Limits', () => {
  test('API rate limits are not exceeded', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/rate-limit/status`, {
      timeout: config.timeouts.short,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('withinLimits', true);
    
    console.log(`✅ Within API rate limits`);
  });

  test('Database connection pool is healthy', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/database`, {
      timeout: config.timeouts.short,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Verify we're not exhausting connections
    const utilizationPct = (body.activeConnections / body.poolSize) * 100;
    expect(utilizationPct).toBeLessThan(80);
    
    console.log(`✅ DB pool healthy (${utilizationPct.toFixed(1)}% utilized)`);
  });
});

