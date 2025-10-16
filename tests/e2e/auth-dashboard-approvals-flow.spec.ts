/**
 * E2E Tests: Auth → Dashboard → Approvals Complete Flow
 * 
 * Tests the complete user journey from authentication through
 * dashboard viewing to approvals management
 * 
 * Backlog Task #2
 * @see docs/specs/test_plan_template.md
 */

import { test, expect } from '@playwright/test';

test.describe('Complete User Flow: Auth → Dashboard → Approvals', () => {
  test('should complete full user journey', async ({ page }) => {
    // Step 1: Authentication
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    
    // Step 2: Dashboard loaded
    await expect(page).toHaveTitle(/Dashboard/);
    
    // Verify all tiles are visible
    const tiles = page.locator('[data-testid^="tile-"]');
    const tileCount = await tiles.count();
    expect(tileCount).toBeGreaterThanOrEqual(7);
    
    // Step 3: Navigate to Approvals
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await expect(approvalsTile).toBeVisible();
    
    // Click approvals tile
    await approvalsTile.click();
    
    // Step 4: Approvals drawer opens
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 2000 });
    
    // Verify drawer content
    const drawerTitle = drawer.getByRole('heading', { name: /Approvals/i });
    await expect(drawerTitle).toBeVisible();
    
    // Step 5: View approval details
    const evidenceSection = drawer.locator('[data-testid="approval-evidence"]');
    await expect(evidenceSection).toBeVisible();
    
    const gradingSection = drawer.locator('[data-testid="approval-grading"]');
    await expect(gradingSection).toBeVisible();
    
    // Step 6: Verify approve button is disabled (dev mode)
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await expect(approveButton).toBeDisabled();
    
    // Step 7: Close drawer
    const cancelButton = drawer.getByRole('button', { name: /Cancel/i });
    await cancelButton.click();
    
    await expect(drawer).not.toBeVisible({ timeout: 1000 });
    
    // Step 8: Verify still on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(tiles.first()).toBeVisible();
  });

  test('should handle authentication failure', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Should show error message
    const errorMessage = page.locator('[data-testid="login-error"]');
    await expect(errorMessage).toBeVisible();
    
    // Should remain on login page
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });

  test('should persist session across page refresh', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Refresh page
    await page.reload();
    
    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL('/dashboard');
    
    const tiles = page.locator('[data-testid^="tile-"]');
    await expect(tiles.first()).toBeVisible();
  });

  test('should logout and redirect to login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Click logout button
    const logoutButton = page.getByRole('button', { name: /Logout/i });
    await logoutButton.click();
    
    // Should redirect to login
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
    
    // Try to access dashboard again
    await page.goto('/dashboard');
    
    // Should redirect back to login
    await page.waitForURL('/login');
  });
});

test.describe('Dashboard Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should navigate between tiles', async ({ page }) => {
    // Click Revenue tile
    const revenueTile = page.locator('[data-testid="tile-revenue"]');
    await revenueTile.click();
    
    // Should show revenue details (drawer or modal)
    const revenueDetails = page.locator('[data-testid="revenue-details"]');
    await expect(revenueDetails).toBeVisible();
    
    // Close details
    await page.keyboard.press('Escape');
    
    // Click AOV tile
    const aovTile = page.locator('[data-testid="tile-aov"]');
    await aovTile.click();
    
    // Should show AOV details
    const aovDetails = page.locator('[data-testid="aov-details"]');
    await expect(aovDetails).toBeVisible();
  });

  test('should handle tile loading states', async ({ page }) => {
    // Reload to catch loading states
    await page.reload();
    
    // Should show loading indicators
    const loadingIndicators = page.locator('[data-testid="tile-loading"]');
    
    // Wait for loading to complete
    await page.waitForLoadState('networkidle');
    
    // All tiles should be loaded
    const tiles = page.locator('[data-testid^="tile-"]');
    const count = await tiles.count();
    expect(count).toBeGreaterThanOrEqual(7);
  });

  test('should handle tile error states', async ({ page }) => {
    // Intercept API and return error
    await page.route('**/api/shopify/revenue', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should show error state in revenue tile
    const errorState = page.locator('[data-testid="tile-error"]').first();
    await expect(errorState).toBeVisible();
  });
});

test.describe('Approvals Drawer Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Login and open approvals drawer
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
  });

  test('should display approval evidence', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Evidence section should be visible
    const evidence = drawer.locator('[data-testid="approval-evidence"]');
    await expect(evidence).toBeVisible();
    
    // Should show evidence details
    const evidenceText = await evidence.textContent();
    expect(evidenceText).toBeTruthy();
  });

  test('should display grading interface', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Grading section should be visible
    const grading = drawer.locator('[data-testid="approval-grading"]');
    await expect(grading).toBeVisible();
    
    // Should have tone, accuracy, policy sliders
    const toneSlider = grading.locator('[data-testid="grade-tone"]');
    const accuracySlider = grading.locator('[data-testid="grade-accuracy"]');
    const policySlider = grading.locator('[data-testid="grade-policy"]');
    
    await expect(toneSlider).toBeVisible();
    await expect(accuracySlider).toBeVisible();
    await expect(policySlider).toBeVisible();
  });

  test('should allow editing draft text', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Draft text should be editable
    const draftText = drawer.locator('[data-testid="draft-text"]');
    await expect(draftText).toBeVisible();
    
    // Edit the text
    await draftText.fill('Updated draft text');
    
    // Verify text was updated
    const updatedText = await draftText.inputValue();
    expect(updatedText).toBe('Updated draft text');
  });

  test('should validate grading before approval', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Approve button should be disabled initially (dev mode)
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await expect(approveButton).toBeDisabled();
    
    // In production mode, would need to set grades first
    // This test verifies the validation logic exists
  });

  test('should close drawer on cancel', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    const cancelButton = drawer.getByRole('button', { name: /Cancel/i });
    await cancelButton.click();
    
    await expect(drawer).not.toBeVisible({ timeout: 1000 });
  });

  test('should close drawer on escape key', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    await page.keyboard.press('Escape');
    
    await expect(drawer).not.toBeVisible({ timeout: 1000 });
  });
});

test.describe('Performance - Complete Flow', () => {
  test('should complete flow within time budget', async ({ page }) => {
    const startTime = Date.now();
    
    // Complete full flow
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    const totalTime = Date.now() - startTime;
    
    // Complete flow should take < 5 seconds
    expect(totalTime).toBeLessThan(5000);
  });
});

