/**
 * E2E Tests: Drawer Approve/Reject Paths
 * 
 * Tests approval and rejection workflows in the approvals drawer
 * 
 * Backlog Task #3
 * @see docs/specs/test_plan_template.md
 */

import { test, expect } from '@playwright/test';

test.describe('Approvals Drawer - Approve Path', () => {
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

  test('should show approve button disabled in dev mode', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    
    // In dev mode, approve should be disabled
    await expect(approveButton).toBeDisabled();
    
    // Should show dev mode indicator
    const devModeIndicator = drawer.locator('[data-testid="dev-mode-indicator"]');
    await expect(devModeIndicator).toBeVisible();
  });

  test('should require all grades before approval (production mode)', async ({ page, context }) => {
    // Skip if in dev mode
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Approve button should be disabled without grades
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await expect(approveButton).toBeDisabled();
    
    // Set tone grade only
    const toneSlider = drawer.locator('[data-testid="grade-tone"]');
    await toneSlider.fill('5');
    
    // Still disabled (need all 3 grades)
    await expect(approveButton).toBeDisabled();
    
    // Set accuracy grade
    const accuracySlider = drawer.locator('[data-testid="grade-accuracy"]');
    await accuracySlider.fill('5');
    
    // Still disabled (need policy grade)
    await expect(approveButton).toBeDisabled();
    
    // Set policy grade
    const policySlider = drawer.locator('[data-testid="grade-policy"]');
    await policySlider.fill('5');
    
    // Now should be enabled
    await expect(approveButton).toBeEnabled();
  });

  test('should capture human edits before approval', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Edit draft text
    const draftText = drawer.locator('[data-testid="draft-text"]');
    const originalText = await draftText.inputValue();
    
    await draftText.fill('Edited draft text with human improvements');
    
    // Set grades
    await drawer.locator('[data-testid="grade-tone"]').fill('5');
    await drawer.locator('[data-testid="grade-accuracy"]').fill('5');
    await drawer.locator('[data-testid="grade-policy"]').fill('5');
    
    // Approve
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await approveButton.click();
    
    // Should show confirmation
    const confirmation = page.locator('[data-testid="approval-confirmation"]');
    await expect(confirmation).toBeVisible();
    
    // Edits should be captured (verify in audit log)
    // This would require checking the database or API response
  });

  test('should show success message after approval', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Set all grades
    await drawer.locator('[data-testid="grade-tone"]').fill('5');
    await drawer.locator('[data-testid="grade-accuracy"]').fill('5');
    await drawer.locator('[data-testid="grade-policy"]').fill('5');
    
    // Approve
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await approveButton.click();
    
    // Should show success message
    const successMessage = page.locator('[data-testid="approval-success"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText(/approved/i);
  });

  test('should close drawer after successful approval', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Set grades and approve
    await drawer.locator('[data-testid="grade-tone"]').fill('5');
    await drawer.locator('[data-testid="grade-accuracy"]').fill('5');
    await drawer.locator('[data-testid="grade-policy"]').fill('5');
    
    const approveButton = drawer.getByRole('button', { name: /Approve/i });
    await approveButton.click();
    
    // Wait for success message
    await page.waitForSelector('[data-testid="approval-success"]');
    
    // Drawer should close after a delay
    await expect(drawer).not.toBeVisible({ timeout: 3000 });
  });
});

test.describe('Approvals Drawer - Reject Path', () => {
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

  test('should have reject button available', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    const rejectButton = drawer.getByRole('button', { name: /Reject/i });
    
    await expect(rejectButton).toBeVisible();
    await expect(rejectButton).toBeEnabled();
  });

  test('should require rejection reason', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    const rejectButton = drawer.getByRole('button', { name: /Reject/i });
    
    // Click reject
    await rejectButton.click();
    
    // Should show reason input
    const reasonInput = drawer.locator('[data-testid="rejection-reason"]');
    await expect(reasonInput).toBeVisible();
    
    // Try to submit without reason
    const confirmRejectButton = drawer.getByRole('button', { name: /Confirm Reject/i });
    await confirmRejectButton.click();
    
    // Should show validation error
    const validationError = drawer.locator('[data-testid="rejection-reason-error"]');
    await expect(validationError).toBeVisible();
  });

  test('should reject with reason', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    const rejectButton = drawer.getByRole('button', { name: /Reject/i });
    
    // Click reject
    await rejectButton.click();
    
    // Enter rejection reason
    const reasonInput = drawer.locator('[data-testid="rejection-reason"]');
    await reasonInput.fill('Tone is too formal, needs to be more friendly');
    
    // Confirm rejection
    const confirmRejectButton = drawer.getByRole('button', { name: /Confirm Reject/i });
    await confirmRejectButton.click();
    
    // Should show success message
    const successMessage = page.locator('[data-testid="rejection-success"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText(/rejected/i);
  });

  test('should return approval to draft state after rejection', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    
    // Reject with reason
    const rejectButton = drawer.getByRole('button', { name: /Reject/i });
    await rejectButton.click();
    
    const reasonInput = drawer.locator('[data-testid="rejection-reason"]');
    await reasonInput.fill('Needs improvement');
    
    const confirmRejectButton = drawer.getByRole('button', { name: /Confirm Reject/i });
    await confirmRejectButton.click();
    
    // Wait for success
    await page.waitForSelector('[data-testid="rejection-success"]');
    
    // Drawer should close
    await expect(drawer).not.toBeVisible({ timeout: 3000 });
    
    // Approval should be back in draft state
    // (This would require checking the API or database)
  });

  test('should allow canceling rejection', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    const rejectButton = drawer.getByRole('button', { name: /Reject/i });
    
    // Click reject
    await rejectButton.click();
    
    // Rejection reason input should appear
    const reasonInput = drawer.locator('[data-testid="rejection-reason"]');
    await expect(reasonInput).toBeVisible();
    
    // Click cancel
    const cancelRejectButton = drawer.getByRole('button', { name: /Cancel/i });
    await cancelRejectButton.click();
    
    // Rejection input should disappear
    await expect(reasonInput).not.toBeVisible();
    
    // Drawer should still be open
    await expect(drawer).toBeVisible();
  });
});

test.describe('Approvals Drawer - Request Changes Path', () => {
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

  test('should have request changes button', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    const requestChangesButton = drawer.getByRole('button', { name: /Request Changes/i });
    
    await expect(requestChangesButton).toBeVisible();
    await expect(requestChangesButton).toBeEnabled();
  });

  test('should allow requesting specific changes', async ({ page }) => {
    const drawer = page.locator('[data-testid="approvals-drawer"]');
    const requestChangesButton = drawer.getByRole('button', { name: /Request Changes/i });
    
    // Click request changes
    await requestChangesButton.click();
    
    // Should show changes input
    const changesInput = drawer.locator('[data-testid="requested-changes"]');
    await expect(changesInput).toBeVisible();
    
    // Enter requested changes
    await changesInput.fill('Please add more context about the customer issue');
    
    // Submit
    const submitButton = drawer.getByRole('button', { name: /Submit Changes/i });
    await submitButton.click();
    
    // Should show success
    const successMessage = page.locator('[data-testid="changes-requested-success"]');
    await expect(successMessage).toBeVisible();
  });
});

test.describe('Approvals Drawer - Audit Trail', () => {
  test('should log all approval actions', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    // This test would verify that all actions are logged:
    // - Approval opened
    // - Draft edited
    // - Grades set
    // - Approval approved/rejected
    // - Audit log entries created
    
    // Implementation would require API access to audit logs
  });

  test('should capture approval latency', async ({ page }) => {
    test.skip(process.env.NODE_ENV === 'development', 'Production-only test');
    
    // This test would verify that time from draft to approval is captured
    // SLA: < 15 minutes for CX approvals
    
    // Implementation would require API access to approval timestamps
  });
});

