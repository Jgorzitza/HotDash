/**
 * Dashboard E2E - Tiles and Loading States
 * 
 * Tests dashboard tiles restoration and loading states
 * Task 3 from 2025-10-16 direction
 * 
 * @see docs/directions/qa.md
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Tiles - Restoration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display all 7 tiles when restored', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // All 7 tiles should be present
    const tiles = page.locator('[data-testid^="tile-"]');
    const count = await tiles.count();
    
    expect(count).toBe(7);
    
    // Verify each tile by name
    const tileNames = ['Revenue', 'AOV', 'Returns', 'Stock Risk', 'SEO Anomalies', 'CX Queue', 'Approvals Queue'];
    
    for (const name of tileNames) {
      const tile = page.getByRole('heading', { name });
      await expect(tile).toBeVisible();
    }
  });

  test('should show loading state initially', async ({ page }) => {
    // Reload to catch loading state
    await page.reload();
    
    // Should show loading indicators
    const loadingIndicators = page.locator('[data-testid="tile-loading"]');
    
    // At least one loading indicator should appear
    const count = await loadingIndicators.count();
    
    // Loading state may be very fast, so we check if it appeared or data loaded
    if (count > 0) {
      await expect(loadingIndicators.first()).toBeVisible();
    }
    
    // Wait for loading to complete
    await page.waitForLoadState('networkidle');
    
    // Loading indicators should disappear
    await expect(loadingIndicators.first()).not.toBeVisible({ timeout: 5000 });
  });

  test('should show skeleton loaders during data fetch', async ({ page }) => {
    // Intercept API calls to delay response
    await page.route('**/api/shopify/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.continue();
    });
    
    await page.reload();
    
    // Should show skeleton loaders
    const skeletons = page.locator('[data-testid="tile-skeleton"]');
    await expect(skeletons.first()).toBeVisible({ timeout: 2000 });
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Skeletons should disappear
    await expect(skeletons.first()).not.toBeVisible({ timeout: 5000 });
  });

  test('should load tiles progressively', async ({ page }) => {
    await page.reload();
    
    // Tiles should appear one by one or in groups
    const tiles = page.locator('[data-testid^="tile-"]');
    
    // Wait for at least one tile to appear
    await expect(tiles.first()).toBeVisible({ timeout: 3000 });
    
    // Eventually all tiles should be visible
    await page.waitForLoadState('networkidle');
    const count = await tiles.count();
    expect(count).toBe(7);
  });
});

test.describe('Dashboard Tiles - Loading State Variations', () => {
  test('should handle slow API responses', async ({ page }) => {
    // Delay all API responses
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });
    
    await page.goto('/dashboard');
    
    // Should show loading state
    const loadingIndicators = page.locator('[data-testid="tile-loading"]');
    await expect(loadingIndicators.first()).toBeVisible({ timeout: 1000 });
    
    // Wait for all data to load
    await page.waitForLoadState('networkidle');
    
    // All tiles should eventually load
    const tiles = page.locator('[data-testid^="tile-"]');
    const count = await tiles.count();
    expect(count).toBe(7);
  });

  test('should show error state when API fails', async ({ page }) => {
    // Make one API fail
    await page.route('**/api/shopify/revenue', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should show error state in revenue tile
    const errorState = page.locator('[data-testid="tile-error"]').first();
    await expect(errorState).toBeVisible();
    
    // Other tiles should still load
    const tiles = page.locator('[data-testid^="tile-"]');
    const count = await tiles.count();
    expect(count).toBeGreaterThanOrEqual(6); // At least 6 tiles should work
  });

  test('should show empty state when no data', async ({ page }) => {
    // Return empty data
    await page.route('**/api/shopify/revenue', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ revenue: 0, period: 'Last 30 days' })
      });
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Revenue tile should show 0 or empty state
    const revenueTile = page.locator('[data-testid="tile-revenue"]');
    await expect(revenueTile).toBeVisible();
    
    const value = revenueTile.locator('[data-testid="tile-value"]');
    const valueText = await value.textContent();
    
    expect(valueText).toMatch(/0|empty|no data/i);
  });

  test('should retry failed requests', async ({ page }) => {
    let attemptCount = 0;
    
    await page.route('**/api/shopify/revenue', route => {
      attemptCount++;
      
      if (attemptCount === 1) {
        // Fail first attempt
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server Error' })
        });
      } else {
        // Succeed on retry
        route.fulfill({
          status: 200,
          body: JSON.stringify({ revenue: 100000, period: 'Last 30 days' })
        });
      }
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should eventually succeed after retry
    expect(attemptCount).toBeGreaterThan(1);
    
    const revenueTile = page.locator('[data-testid="tile-revenue"]');
    await expect(revenueTile).toBeVisible();
  });
});

test.describe('Dashboard Tiles - Data Display', () => {
  test('should display tile values correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Revenue tile
    const revenueTile = page.locator('[data-testid="tile-revenue"]');
    const revenueValue = revenueTile.locator('[data-testid="tile-value"]');
    await expect(revenueValue).toBeVisible();
    
    const valueText = await revenueValue.textContent();
    expect(valueText).toBeTruthy();
    expect(valueText!.length).toBeGreaterThan(0);
  });

  test('should display trend indicators', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Each tile should have a trend indicator
    const tiles = page.locator('[data-testid^="tile-"]');
    const count = await tiles.count();
    
    for (let i = 0; i < count; i++) {
      const tile = tiles.nth(i);
      const trend = tile.locator('[data-testid="tile-trend"]');
      
      // Trend should be visible
      await expect(trend).toBeVisible();
      
      // Trend should have direction (up/down/flat)
      const trendClass = await trend.getAttribute('class');
      expect(trendClass).toMatch(/up|down|flat/);
    }
  });

  test('should display period labels', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Each tile should show its period
    const tiles = page.locator('[data-testid^="tile-"]');
    const count = await tiles.count();
    
    for (let i = 0; i < count; i++) {
      const tile = tiles.nth(i);
      const period = tile.locator('[data-testid="tile-period"]');
      
      await expect(period).toBeVisible();
      
      const periodText = await period.textContent();
      expect(periodText).toMatch(/last|current|today/i);
    }
  });

  test('should format numbers correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Revenue should be formatted with currency
    const revenueTile = page.locator('[data-testid="tile-revenue"]');
    const revenueValue = revenueTile.locator('[data-testid="tile-value"]');
    const valueText = await revenueValue.textContent();
    
    expect(valueText).toMatch(/\$|USD/); // Should have currency symbol
  });

  test('should show percentage for returns', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Returns should be formatted as percentage
    const returnsTile = page.locator('[data-testid="tile-returns"]');
    const returnsValue = returnsTile.locator('[data-testid="tile-value"]');
    const valueText = await returnsValue.textContent();
    
    expect(valueText).toMatch(/%/); // Should have percentage symbol
  });
});

test.describe('Dashboard Tiles - Interactions', () => {
  test('should be clickable', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Click revenue tile
    const revenueTile = page.locator('[data-testid="tile-revenue"]');
    await revenueTile.click();
    
    // Should open details (drawer or modal)
    const details = page.locator('[data-testid="revenue-details"]');
    await expect(details).toBeVisible({ timeout: 2000 });
  });

  test('should show hover state', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const revenueTile = page.locator('[data-testid="tile-revenue"]');
    
    // Hover over tile
    await revenueTile.hover();
    
    // Should have hover styling
    const hasHoverClass = await revenueTile.evaluate(el => {
      return el.classList.contains('hover') || 
             getComputedStyle(el).cursor === 'pointer';
    });
    
    expect(hasHoverClass).toBe(true);
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Tab to first tile
    await page.keyboard.press('Tab');
    
    // Should have focus
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(focusedElement).toContain('tile-');
    
    // Press Enter to activate
    await page.keyboard.press('Enter');
    
    // Should open details
    const details = page.locator('[data-testid*="-details"]').first();
    await expect(details).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Dashboard Tiles - Performance', () => {
  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load in < 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle concurrent tile loads', async ({ page }) => {
    await page.goto('/dashboard');
    
    // All tiles should load concurrently
    await page.waitForLoadState('networkidle');
    
    const tiles = page.locator('[data-testid^="tile-"]');
    const count = await tiles.count();
    
    expect(count).toBe(7);
    
    // All should be visible
    for (let i = 0; i < count; i++) {
      await expect(tiles.nth(i)).toBeVisible();
    }
  });
});

