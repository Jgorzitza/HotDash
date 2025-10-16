/**
 * E2E Tests: Drawer Validation Errors
 * 
 * Tests validation error handling in the approvals drawer
 * 
 * Backlog Task #4
 * @see docs/specs/test_plan_template.md
 */

import { test, expect } from '@playwright/test';

test.describe('Approvals Drawer - Validation Errors', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login and open approvals drawer
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

  test('should validate required evidence', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // If evidence is missing, should show error
    const evidenceSection = drawer.locator('[data-testid="approval-evidence"]');
    const evidenceError = drawer.locator('[data-testid="evidence-error"]');
    
    // Check if evidence is present
    const hasEvidence = await evidenceSection.textContent();
    
    if (!hasEvidence || hasEvidence.trim() === '') {
      // Should show validation error
      await expect(evidenceError).toBeVisible();
      await expect(evidenceError).toContainText(/evidence required/i);
    }
  });

  test('should validate rollback plan', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Rollback plan should be present
    const rollbackSection = drawer.locator('[data-testid="rollback-plan"]');
    const rollbackError = drawer.locator('[data-testid="rollback-error"]');
    
    const hasRollback = await rollbackSection.textContent();
    
    if (!hasRollback || hasRollback.trim() === '') {
      // Should show validation error
      await expect(rollbackError).toBeVisible();
      await expect(rollbackError).toContainText(/rollback plan required/i);
    }
  });

  test('should validate grade values (1-5)', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Try to set invalid grade (< 1)
    const toneSlider = drawer.locator('[data-testid="grade-tone"]');
    await toneSlider.fill('0');
    
    // Should show validation error
    const gradeError = drawer.locator('[data-testid="grade-error"]');
    await expect(gradeError).toBeVisible();
    await expect(gradeError).toContainText(/must be between 1 and 5/i);
    
    // Try to set invalid grade (> 5)
    await toneSlider.fill('6');
    await expect(gradeError).toBeVisible();
    
    // Set valid grade
    await toneSlider.fill('5');
    await expect(gradeError).not.toBeVisible();
  });

  test('should validate all grades are set before approval', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Set only tone grade
    await drawer.locator('[data-testid="grade-tone"]').fill('5');
    
    // Try to approve
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    
    // Should be disabled
    await expect(approveButton).toBeDisabled();
    
    // Should show validation message
    const validationMessage = drawer.locator('[data-testid="grades-incomplete"]');
    await expect(validationMessage).toBeVisible();
    await expect(validationMessage).toContainText(/all grades required/i);
  });

  test('should validate rejection reason is not empty', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Click reject
    const rejectButton = drawer.getByRole('button', { name: /Reject/i });
    await rejectButton.click();
    
    // Try to submit without reason
    const reasonInput = drawer.locator('[data-testid="rejection-reason"]');
    await reasonInput.fill('');
    
    const confirmRejectButton = drawer.getByRole('button', { name: /Confirm Reject/i });
    await confirmRejectButton.click();
    
    // Should show validation error
    const reasonError = drawer.locator('[data-testid="rejection-reason-error"]');
    await expect(reasonError).toBeVisible();
    await expect(reasonError).toContainText(/reason required/i);
  });

  test('should validate rejection reason minimum length', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Click reject
    const rejectButton = drawer.getByRole('button', { name: /Reject/i });
    await rejectButton.click();
    
    // Enter too short reason
    const reasonInput = drawer.locator('[data-testid="rejection-reason"]');
    await reasonInput.fill('No');
    
    const confirmRejectButton = drawer.getByRole('button', { name: /Confirm Reject/i });
    await confirmRejectButton.click();
    
    // Should show validation error
    const reasonError = drawer.locator('[data-testid="rejection-reason-error"]');
    await expect(reasonError).toBeVisible();
    await expect(reasonError).toContainText(/at least 10 characters/i);
  });

  test('should validate draft text is not empty', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Clear draft text
    const draftText = drawer.locator('[data-testid="draft-text"]');
    await draftText.fill('');
    
    // Should show validation error
    const draftError = drawer.locator('[data-testid="draft-text-error"]');
    await expect(draftError).toBeVisible();
    await expect(draftError).toContainText(/draft text required/i);
  });

  test('should validate draft text minimum length', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Enter too short draft
    const draftText = drawer.locator('[data-testid="draft-text"]');
    await draftText.fill('Hi');
    
    // Should show validation error
    const draftError = drawer.locator('[data-testid="draft-text-error"]');
    await expect(draftError).toBeVisible();
    await expect(draftError).toContainText(/at least 20 characters/i);
  });

  test('should validate projected impact is present', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Projected impact should be present
    const impactSection = drawer.locator('[data-testid="projected-impact"]');
    const impactError = drawer.locator('[data-testid="impact-error"]');
    
    const hasImpact = await impactSection.textContent();
    
    if (!hasImpact || hasImpact.trim() === '') {
      // Should show validation error
      await expect(impactError).toBeVisible();
      await expect(impactError).toContainText(/projected impact required/i);
    }
  });

  test('should validate risks are documented', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Risks should be documented
    const risksSection = drawer.locator('[data-testid="risks"]');
    const risksError = drawer.locator('[data-testid="risks-error"]');
    
    const hasRisks = await risksSection.textContent();
    
    if (!hasRisks || hasRisks.trim() === '') {
      // Should show validation error
      await expect(risksError).toBeVisible();
      await expect(risksError).toContainText(/risks must be documented/i);
    }
  });

  test('should show all validation errors at once', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Clear all required fields
    const draftText = drawer.locator('[data-testid="draft-text"]');
    await draftText.fill('');
    
    // Try to approve
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await approveButton.click();
    
    // Should show multiple validation errors
    const validationErrors = drawer.locator('[data-testid^="validation-error-"]');
    const errorCount = await validationErrors.count();
    
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should clear validation errors when fixed', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Clear draft text to trigger error
    const draftText = drawer.locator('[data-testid="draft-text"]');
    await draftText.fill('');
    
    // Should show error
    const draftError = drawer.locator('[data-testid="draft-text-error"]');
    await expect(draftError).toBeVisible();
    
    // Fix the error
    await draftText.fill('This is a valid draft text with enough characters');
    
    // Error should disappear
    await expect(draftError).not.toBeVisible();
  });

  test('should validate on blur', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Focus on draft text
    const draftText = drawer.locator('[data-testid="draft-text"]');
    await draftText.focus();
    
    // Clear it
    await draftText.fill('');
    
    // Blur (tab away)
    await page.keyboard.press('Tab');
    
    // Should show validation error
    const draftError = drawer.locator('[data-testid="draft-text-error"]');
    await expect(draftError).toBeVisible();
  });

  test('should prevent submission with validation errors', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Create validation error
    const draftText = drawer.locator('[data-testid="draft-text"]');
    await draftText.fill('');
    
    // Approve button should be disabled
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await expect(approveButton).toBeDisabled();
  });

  test('should show validation summary', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Create multiple validation errors
    const draftText = drawer.locator('[data-testid="draft-text"]');
    await draftText.fill('');
    
    // Should show validation summary
    const validationSummary = drawer.locator('[data-testid="validation-summary"]');
    await expect(validationSummary).toBeVisible();
    
    // Should list all errors
    const errorList = validationSummary.locator('li');
    const errorCount = await errorList.count();
    
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should highlight fields with errors', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Clear draft text
    const draftText = drawer.locator('[data-testid="draft-text"]');
    await draftText.fill('');
    await page.keyboard.press('Tab');
    
    // Field should have error styling
    const hasErrorClass = await draftText.evaluate((el) => {
      return el.classList.contains('error') || 
             el.classList.contains('invalid') ||
             el.getAttribute('aria-invalid') === 'true';
    });
    
    expect(hasErrorClass).toBe(true);
  });

  test('should show inline error messages', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Trigger validation error
    const draftText = drawer.locator('[data-testid="draft-text"]');
    await draftText.fill('');
    await page.keyboard.press('Tab');
    
    // Should show inline error message
    const inlineError = drawer.locator('[data-testid="draft-text-error"]');
    await expect(inlineError).toBeVisible();
    
    // Error should be near the field
    const errorBox = await inlineError.boundingBox();
    const fieldBox = await draftText.boundingBox();
    
    expect(errorBox).toBeTruthy();
    expect(fieldBox).toBeTruthy();
    
    // Error should be below the field (approximately)
    if (errorBox && fieldBox) {
      expect(errorBox.y).toBeGreaterThan(fieldBox.y);
    }
  });
});

test.describe('Approvals Drawer - API Validation Errors', () => {
  test.beforeEach(async ({ page }) => {
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

  test('should handle API validation errors', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    // Intercept API and return validation error
    await page.route('**/api/supabase/approvals/*/approve', (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          error: {
            message: 'Validation failed',
            details: ['Grade values must be between 1 and 5']
          }
        })
      });
    });
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Try to approve
    await drawer.locator('[data-testid="grade-tone"]').fill('5');
    await drawer.locator('[data-testid="grade-accuracy"]').fill('5');
    await drawer.locator('[data-testid="grade-policy"]').fill('5');
    
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await approveButton.click();
    
    // Should show API error
    const apiError = page.locator('[data-testid="api-error"]');
    await expect(apiError).toBeVisible();
    await expect(apiError).toContainText(/validation failed/i);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    // Intercept API and simulate network error
    await page.route('**/api/supabase/approvals/*/approve', (route) => {
      route.abort('failed');
    });
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Try to approve
    await drawer.locator('[data-testid="grade-tone"]').fill('5');
    await drawer.locator('[data-testid="grade-accuracy"]').fill('5');
    await drawer.locator('[data-testid="grade-policy"]').fill('5');
    
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await approveButton.click();
    
    // Should show network error
    const networkError = page.locator('[data-testid="network-error"]');
    await expect(networkError).toBeVisible();
    await expect(networkError).toContainText(/network error|connection failed/i);
  });
});

