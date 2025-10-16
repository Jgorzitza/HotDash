/**
 * Failing Tests for Missing Approvals UI
 * 
 * These tests will fail until Engineer restores the Approvals UI
 * Task 1 from 2025-10-16 direction
 * 
 * @see docs/directions/qa.md
 */

import { test, expect } from '@playwright/test';

test.describe('Approvals UI - Missing Components (FAILING UNTIL RESTORED)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should have Approvals Queue tile on dashboard', async ({ page }) => {
    // This will fail until tile is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await expect(approvalsTile).toBeVisible({ timeout: 5000 });
    
    // Verify tile has correct structure
    const tileTitle = approvalsTile.getByRole('heading', { name: /Approvals/i });
    await expect(tileTitle).toBeVisible();
    
    // Verify tile shows count
    const tileValue = approvalsTile.locator('[data-testid="tile-value"]');
    await expect(tileValue).toBeVisible();
  });

  test('should open Approvals Drawer when clicking tile', async ({ page }) => {
    // This will fail until drawer is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 2000 });
  });

  test('should display approval evidence in drawer', async ({ page }) => {
    // This will fail until drawer content is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    // Evidence section
    const evidenceSection = drawer.locator('[data-testid="approval-evidence"]');
    await expect(evidenceSection).toBeVisible();
    
    // Should show evidence details
    const evidenceText = await evidenceSection.textContent();
    expect(evidenceText).toBeTruthy();
    expect(evidenceText!.length).toBeGreaterThan(0);
  });

  test('should display grading interface in drawer', async ({ page }) => {
    // This will fail until grading UI is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    // Grading section
    const gradingSection = drawer.locator('[data-testid="approval-grading"]');
    await expect(gradingSection).toBeVisible();
    
    // Should have tone, accuracy, policy sliders
    const toneSlider = gradingSection.locator('[data-testid="grade-tone"]');
    const accuracySlider = gradingSection.locator('[data-testid="grade-accuracy"]');
    const policySlider = gradingSection.locator('[data-testid="grade-policy"]');
    
    await expect(toneSlider).toBeVisible();
    await expect(accuracySlider).toBeVisible();
    await expect(policySlider).toBeVisible();
  });

  test('should display draft text editor in drawer', async ({ page }) => {
    // This will fail until draft editor is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    // Draft text editor
    const draftText = drawer.locator('[data-testid="draft-text"]');
    await expect(draftText).toBeVisible();
    await expect(draftText).toBeEditable();
  });

  test('should have approve button in drawer', async ({ page }) => {
    // This will fail until approve button is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await expect(approveButton).toBeVisible();
  });

  test('should have reject button in drawer', async ({ page }) => {
    // This will fail until reject button is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    const rejectButton = drawer.getByRole('button', { name: /Reject/i });
    await expect(rejectButton).toBeVisible();
  });

  test('should have cancel button in drawer', async ({ page }) => {
    // This will fail until cancel button is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    const cancelButton = drawer.getByRole('button', { name: /Cancel/i });
    await expect(cancelButton).toBeVisible();
  });

  test('should display projected impact section', async ({ page }) => {
    // This will fail until projected impact is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    const impactSection = drawer.locator('[data-testid="projected-impact"]');
    await expect(impactSection).toBeVisible();
  });

  test('should display risks section', async ({ page }) => {
    // This will fail until risks section is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    const risksSection = drawer.locator('[data-testid="risks"]');
    await expect(risksSection).toBeVisible();
  });

  test('should display rollback plan section', async ({ page }) => {
    // This will fail until rollback plan is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    const rollbackSection = drawer.locator('[data-testid="rollback-plan"]');
    await expect(rollbackSection).toBeVisible();
  });

  test('should show dev mode indicator when in dev mode', async ({ page }) => {
    // This will fail until dev mode indicator is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    const devModeIndicator = drawer.locator('[data-testid="dev-mode-indicator"]');
    await expect(devModeIndicator).toBeVisible();
    await expect(devModeIndicator).toContainText(/dev mode|development/i);
  });

  test('should disable approve button in dev mode', async ({ page }) => {
    // This will fail until approve button state is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await expect(approveButton).toBeDisabled();
  });

  test('should close drawer on cancel click', async ({ page }) => {
    // This will fail until drawer close functionality is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    const cancelButton = drawer.getByRole('button', { name: /Cancel/i });
    await cancelButton.click();
    
    await expect(drawer).not.toBeVisible({ timeout: 1000 });
  });

  test('should close drawer on escape key', async ({ page }) => {
    // This will fail until keyboard handling is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    await page.keyboard.press('Escape');
    
    await expect(drawer).not.toBeVisible({ timeout: 1000 });
  });

  test('should show approval count on tile', async ({ page }) => {
    // This will fail until tile count is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await expect(approvalsTile).toBeVisible();
    
    const tileValue = approvalsTile.locator('[data-testid="tile-value"]');
    const valueText = await tileValue.textContent();
    
    expect(valueText).toBeTruthy();
    expect(valueText).toMatch(/\d+/); // Should contain a number
  });

  test('should show trend indicator on tile', async ({ page }) => {
    // This will fail until trend indicator is restored
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await expect(approvalsTile).toBeVisible();
    
    const trendIndicator = approvalsTile.locator('[data-testid="tile-trend"]');
    await expect(trendIndicator).toBeVisible();
  });
});

test.describe('Approvals UI - API Integration (FAILING UNTIL RESTORED)', () => {
  test('should fetch approvals data from API', async ({ page }) => {
    // This will fail until API integration is restored
    let apiCalled = false;
    
    page.on('request', request => {
      if (request.url().includes('/api/supabase/approvals')) {
        apiCalled = true;
      }
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    // Wait a bit for API call
    await page.waitForTimeout(1000);
    
    expect(apiCalled).toBe(true);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // This will fail until error handling is restored
    await page.route('**/api/supabase/approvals', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const approvalsTile = page.locator('[data-testid="tile-approvals"]');
    await approvalsTile.click();
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    await expect(drawer).toBeVisible();
    
    // Should show error state
    const errorMessage = drawer.locator('[data-testid="api-error"]');
    await expect(errorMessage).toBeVisible();
  });
});

