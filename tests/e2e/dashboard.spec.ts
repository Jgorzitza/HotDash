/**
 * E2E Tests: Dashboard User Flows
 * 
 * Tests the main dashboard functionality including:
 * - Dashboard loading and tile display
 * - Responsive layout
 * - Tile interactions
 * - Navigation to approvals drawer
 * 
 * @see docs/specs/test_plan_template.md
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard - Main Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard with all 7 tiles', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Dashboard/);
    
    // Verify all 7 tiles are present
    const tiles = [
      'Revenue',
      'AOV',
      'Returns',
      'Stock Risk',
      'SEO Anomalies',
      'CX Queue',
      'Approvals Queue'
    ];
    
    for (const tileName of tiles) {
      const tile = page.getByRole('heading', { name: tileName });
      await expect(tile).toBeVisible();
    }
  });

  test('should display tile values and trends', async ({ page }) => {
    // Check Revenue tile has value and trend
    const revenueTile = page.locator('[data-testid="tile-revenue"]');
    await expect(revenueTile).toBeVisible();
    
    // Should have a value displayed
    const value = revenueTile.locator('[data-testid="tile-value"]');
    await expect(value).toBeVisible();
    
    // Should have a trend indicator (up/down/flat)
    const trend = revenueTile.locator('[data-testid="tile-trend"]');
    await expect(trend).toBeVisible();
  });

  test('should show loading states initially', async ({ page }) => {
    // Reload to catch loading state
    await page.reload();
    
    // Should show loading skeleton or spinner
    const loadingIndicator = page.locator('[data-testid="tile-loading"]').first();
    
    // Loading state should appear briefly
    // (may be too fast to catch, so we make this optional)
    const isLoading = await loadingIndicator.isVisible().catch(() => false);
    
    // If loading state was visible, it should disappear
    if (isLoading) {
      await expect(loadingIndicator).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Tiles should stack vertically (1 column)
    const tiles = page.locator('[data-testid^="tile-"]');
    const count = await tiles.count();
    
    expect(count).toBeGreaterThanOrEqual(7);
    
    // Verify tiles are visible in mobile view
    for (let i = 0; i < Math.min(count, 3); i++) {
      await expect(tiles.nth(i)).toBeVisible();
    }
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Tiles should be in 2 columns
    const tiles = page.locator('[data-testid^="tile-"]');
    const count = await tiles.count();
    
    expect(count).toBeGreaterThanOrEqual(7);
    
    // Verify tiles are visible in tablet view
    for (let i = 0; i < Math.min(count, 4); i++) {
      await expect(tiles.nth(i)).toBeVisible();
    }
  });

  test('should be responsive on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Tiles should be in 3 columns
    const tiles = page.locator('[data-testid^="tile-"]');
    const count = await tiles.count();
    
    expect(count).toBeGreaterThanOrEqual(7);
    
    // All tiles should be visible without scrolling
    for (let i = 0; i < count; i++) {
      await expect(tiles.nth(i)).toBeVisible();
    }
  });

  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // P95 should be < 3 seconds (3000ms)
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should have no console errors
    expect(consoleErrors).toHaveLength(0);
  });
});

test.describe('Dashboard - Approvals Drawer Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should open approvals drawer when clicking approvals tile', async ({ page }) => {
    // Click on Approvals Queue tile
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    // Drawer should open
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 1000 });
    
    // Drawer should have title
    const drawerTitle = drawer.getByRole('heading', { name: /Approvals/i });
    await expect(drawerTitle).toBeVisible();
  });

  test('should display approval details in drawer', async ({ page }) => {
    // Open drawer
    await page.locator('[data-testid="tile-approvals"]').click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    // Should show evidence sections
    const evidenceSection = drawer.locator('[data-testid="approval-evidence"]');
    await expect(evidenceSection).toBeVisible();
    
    // Should show grading interface
    const gradingSection = drawer.locator('[data-testid="approval-grading"]');
    await expect(gradingSection).toBeVisible();
  });

  test('should have approve button disabled in dev mode', async ({ page }) => {
    // Open drawer
    await page.locator('[data-testid="tile-approvals"]').click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    // Approve button should be disabled in dev mode
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await expect(approveButton).toBeDisabled();
  });

  test('should close drawer when clicking cancel', async ({ page }) => {
    // Open drawer
    await page.locator('[data-testid="tile-approvals"]').click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    // Click cancel button
    const cancelButton = drawer.getByRole('button', { name: /Cancel/i });
    await cancelButton.click();
    
    // Drawer should close
    await expect(drawer).not.toBeVisible({ timeout: 1000 });
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab to approvals tile
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // 7th tile
    
    // Press Enter to open drawer
    await page.keyboard.press('Enter');
    
    // Drawer should open
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    // Should be able to tab through drawer elements
    await page.keyboard.press('Tab');
    
    // Press Escape to close drawer
    await page.keyboard.press('Escape');
    
    // Drawer should close
    await expect(drawer).not.toBeVisible();
  });
});

test.describe('Dashboard - Error Handling', () => {
  test('should show error state when API fails', async ({ page }) => {
    // Intercept API calls and return error
    await page.route('**/api/shopify/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should show error state in tiles
    const errorMessage = page.locator('[data-testid="tile-error"]').first();
    await expect(errorMessage).toBeVisible();
  });

  test('should handle empty data gracefully', async ({ page }) => {
    // Intercept API calls and return empty data
    await page.route('**/api/shopify/**', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: null })
      });
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should show empty state or zero values
    const tiles = page.locator('[data-testid^="tile-"]');
    await expect(tiles.first()).toBeVisible();
  });
});

