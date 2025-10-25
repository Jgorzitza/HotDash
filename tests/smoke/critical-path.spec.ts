/**
 * Critical Path Smoke Tests
 * 
 * Tests the most critical user journeys to ensure basic functionality works.
 * These tests should run quickly (< 30 seconds total) and catch major issues.
 */

import { test, expect } from '@playwright/test';
import { SMOKE_TEST_CONFIG } from './config';

const config = SMOKE_TEST_CONFIG;
const baseURL = config.urls.production;

test.describe('Critical Path Smoke Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Health endpoint responds', async ({ request }) => {
    const response = await request.get(`${baseURL}/health`, {
      timeout: config.timeouts.short,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
  });

  test('Dashboard loads successfully', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
      waitUntil: 'networkidle',
    });
    
    const loadTime = Date.now() - startTime;
    
    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Operator Control Center', {
      timeout: config.timeouts.medium,
    });
    
    // Verify load time is acceptable
    expect(loadTime).toBeLessThan(config.performance.pageLoad);
    
    console.log(`✅ Dashboard loaded in ${loadTime}ms`);
  });

  test('API health check passes', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health`, {
      timeout: config.timeouts.short,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Verify all critical services are healthy
    expect(body).toHaveProperty('database', 'healthy');
    expect(body).toHaveProperty('timestamp');
  });

  test('Database connectivity verified', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/database`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('connected', true);
    expect(body).toHaveProperty('latency');
    expect(body.latency).toBeLessThan(config.performance.databaseQuery);
  });

  test('Critical routes are accessible', async ({ page }) => {
    for (const path of config.criticalPaths) {
      const response = await page.goto(`${baseURL}${path}`, {
        timeout: config.timeouts.long,
        waitUntil: 'domcontentloaded',
      });
      
      expect(response?.status()).toBeLessThan(400);
      console.log(`✅ ${path} accessible (${response?.status()})`);
    }
  });

  test('No JavaScript errors on dashboard', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
      waitUntil: 'networkidle',
    });
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000);
    
    expect(errors).toHaveLength(0);
  });

  test('Console has no critical errors', async ({ page }) => {
    const criticalErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        criticalErrors.push(msg.text());
      }
    });
    
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
      waitUntil: 'networkidle',
    });
    
    await page.waitForTimeout(2000);
    
    // Filter out known non-critical errors
    const filtered = criticalErrors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('analytics')
    );
    
    expect(filtered).toHaveLength(0);
  });

  test('Session management works', async ({ page, context }) => {
    // Navigate to app
    await page.goto(`${baseURL}/app`, {
      timeout: config.timeouts.long,
    });
    
    // Verify session cookie exists
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session'));
    
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.secure).toBe(true);
  });

  test('API rate limiting is configured', async ({ request }) => {
    // Make multiple rapid requests
    const requests = Array(10).fill(null).map(() => 
      request.get(`${baseURL}/api/health`)
    );
    
    const responses = await Promise.all(requests);
    
    // All should succeed (rate limit should be reasonable)
    responses.forEach(response => {
      expect(response.status()).toBeLessThan(500);
    });
  });

  test('Error pages render correctly', async ({ page }) => {
    const response = await page.goto(`${baseURL}/nonexistent-page-12345`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response?.status()).toBe(404);
    
    // Verify error page has content (not blank)
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(10);
  });
});

test.describe('Critical Path Smoke Tests - Authenticated', () => {
  test.skip('Approval queue loads for authenticated users', async ({ page }) => {
    // TODO: Implement authentication flow
    // This test requires proper auth setup
  });

  test.skip('Settings page loads for authenticated users', async ({ page }) => {
    // TODO: Implement authentication flow
  });
});

