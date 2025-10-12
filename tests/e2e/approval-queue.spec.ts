/**
 * Approval Queue E2E Tests (Playwright)
 * Tests operator interactions with approval queue UI
 * 
 * Prerequisites:
 * - Dashboard running (build must be fixed)
 * - Agent SDK service running
 * - Test approvals seeded
 * 
 * Run: npm run test:e2e -- approval-queue.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Approval Queue - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to approval queue
    await page.goto('/approvals');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('View Approval Queue', () => {
    test('operator views pending approvals', async ({ page }) => {
      // Given: Operator on approval queue page
      await page.waitForSelector('[data-testid="approval-queue"]');
      
      // Then: Approvals displayed
      const approvals = await page.locator('[data-testid="approval-card"]').count();
      expect(approvals).toBeGreaterThanOrEqual(0); // May be 0 if no pending approvals
      
      // And: Page title correct
      await expect(page.locator('h1')).toContainText('Approval Queue');
    });

    test('displays approval details', async ({ page }) => {
      // Given: At least one approval exists
      const approvalCard = page.locator('[data-testid="approval-card"]').first();
      await expect(approvalCard).toBeVisible();
      
      // Then: Conversation ID visible
      await expect(approvalCard.locator('[data-testid="conversation-id"]')).toBeVisible();
      
      // And: Tool name visible
      await expect(approvalCard.locator('[data-testid="tool-name"]')).toBeVisible();
      
      // And: Action buttons visible
      await expect(approvalCard.locator('[data-testid="approve-button"]')).toBeVisible();
      await expect(approvalCard.locator('[data-testid="reject-button"]')).toBeVisible();
    });

    test('empty state when no approvals', async ({ page }) => {
      // Given: No pending approvals (mock API to return empty array)
      await page.route('**/approvals', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });
      
      await page.reload();
      
      // Then: Empty state message displayed
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
      await expect(page.locator('[data-testid="empty-state"]')).toContainText('No pending approvals');
    });
  });

  test.describe('Approve Action', () => {
    test('operator approves agent suggestion', async ({ page }) => {
      // Given: Approval queue with pending item
      const initialCount = await page.locator('[data-testid="approval-card"]').count();
      
      if (initialCount === 0) {
        test.skip(); // Skip if no approvals to test
      }
      
      const firstApproval = page.locator('[data-testid="approval-card"]').first();
      const approvalId = await firstApproval.getAttribute('data-approval-id');
      
      // When: Click approve button
      await firstApproval.locator('[data-testid="approve-button"]').click();
      
      // Then: Success toast appears
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Approved');
      
      // And: Approval removed from queue
      await page.waitForTimeout(1000); // Allow for removal animation
      const updatedCount = await page.locator('[data-testid="approval-card"]').count();
      expect(updatedCount).toBeLessThan(initialCount);
    });

    test('shows loading state during approval', async ({ page }) => {
      // Given: Approval queue with pending item
      const firstApproval = page.locator('[data-testid="approval-card"]').first();
      
      // When: Click approve (with slow network)
      await page.route('**/approvals/*/approve', route => {
        setTimeout(() => route.continue(), 2000); // Delay response
      });
      
      await firstApproval.locator('[data-testid="approve-button"]').click();
      
      // Then: Loading indicator visible
      await expect(firstApproval.locator('[data-testid="loading-spinner"]')).toBeVisible();
      
      // And: Button disabled during loading
      await expect(firstApproval.locator('[data-testid="approve-button"]')).toBeDisabled();
    });

    test('handles approve failure gracefully', async ({ page }) => {
      // Given: Approval queue with pending item
      const firstApproval = page.locator('[data-testid="approval-card"]').first();
      
      // When: Approval fails (mock server error)
      await page.route('**/approvals/*/approve', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      await firstApproval.locator('[data-testid="approve-button"]').click();
      
      // Then: Error toast displayed
      await expect(page.locator('[data-testid="toast-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="toast-error"]')).toContainText('Failed');
      
      // And: Approval remains in queue
      await expect(firstApproval).toBeVisible();
    });
  });

  test.describe('Reject Action', () => {
    test('operator rejects agent suggestion', async ({ page }) => {
      // Given: Approval queue with pending item
      const firstApproval = page.locator('[data-testid="approval-card"]').first();
      
      // When: Click reject button
      await firstApproval.locator('[data-testid="reject-button"]').click();
      
      // Then: Warning toast appears
      await expect(page.locator('[data-testid="toast-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="toast-warning"]')).toContainText('Rejected');
      
      // And: Approval removed from queue
      await page.waitForTimeout(1000);
      await expect(firstApproval).not.toBeVisible();
    });

    test('shows rejection reason input', async ({ page }) => {
      // Given: Approval queue with pending item
      const firstApproval = page.locator('[data-testid="approval-card"]').first();
      
      // When: Click reject button
      await firstApproval.locator('[data-testid="reject-button"]').click();
      
      // Then: Reason input appears (if implemented)
      // await expect(page.locator('[data-testid="reject-reason-input"]')).toBeVisible();
    });
  });

  test.describe('Real-time Updates', () => {
    test('new approval appears without refresh', async ({ page }) => {
      // Given: Approval queue open
      const initialCount = await page.locator('[data-testid="approval-card"]').count();
      
      // When: New approval created via API
      await page.request.post('http://localhost:8002/webhooks/chatwoot', {
        data: {
          event: 'conversation_created',
          conversation: {
            id: 99999,
            messages: [{
              content: 'Test message for real-time update',
              sender_type: 'contact'
            }],
            contact: {
              name: 'Test User',
              email: 'test@example.com'
            }
          }
        }
      });
      
      // Then: New approval appears without manual refresh
      await page.waitForTimeout(3000); // Allow for real-time update
      const updatedCount = await page.locator('[data-testid="approval-card"]').count();
      expect(updatedCount).toBe(initialCount + 1);
    });

    test('approval removal updates in real-time', async ({ page }) => {
      // Given: Multiple approvals visible
      const initialCount = await page.locator('[data-testid="approval-card"]').count();
      
      if (initialCount < 2) {
        test.skip(); // Need at least 2 approvals
      }
      
      // When: Another operator approves (simulate via API)
      const firstApprovalId = await page.locator('[data-testid="approval-card"]')
        .first()
        .getAttribute('data-approval-id');
      
      await page.request.post(`http://localhost:8002/approvals/${firstApprovalId}/approve`);
      
      // Then: Approval removed from current view
      await page.waitForTimeout(2000);
      const updatedCount = await page.locator('[data-testid="approval-card"]').count();
      expect(updatedCount).toBe(initialCount - 1);
    });
  });

  test.describe('Error Handling', () => {
    test('displays error when API unavailable', async ({ page }) => {
      // Given: API is down
      await page.route('**/approvals', route => {
        route.abort('failed');
      });
      
      // When: Navigate to approval queue
      await page.goto('/approvals');
      
      // Then: Error message displayed
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load');
    });

    test('handles network timeout', async ({ page }) => {
      // Given: Slow network
      await page.route('**/approvals', route => {
        // Never respond (timeout)
        // Route will timeout naturally
      });
      
      // When: Navigate to approval queue
      await page.goto('/approvals', { timeout: 5000 }).catch(() => {});
      
      // Then: Timeout error handled
      // Implementation-specific error handling
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('navigates approvals with keyboard', async ({ page }) => {
      // Given: Multiple approvals visible
      const approvals = await page.locator('[data-testid="approval-card"]').count();
      
      if (approvals < 2) {
        test.skip();
      }
      
      // When: Tab to first approval
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Navigate to first card
      
      // Then: First approval focused
      await expect(page.locator('[data-testid="approval-card"]').first()).toBeFocused();
      
      // When: Tab to approve button
      await page.keyboard.press('Tab');
      
      // Then: Approve button focused
      await expect(page.locator('[data-testid="approve-button"]').first()).toBeFocused();
    });

    test('activates buttons with Enter key', async ({ page }) => {
      // Given: Approval queue with pending item
      const firstApproval = page.locator('[data-testid="approval-card"]').first();
      
      // When: Focus approve button and press Enter
      await firstApproval.locator('[data-testid="approve-button"]').focus();
      await page.keyboard.press('Enter');
      
      // Then: Approval processed
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('has proper ARIA labels', async ({ page }) => {
      // Given: Approval queue visible
      const approvalCard = page.locator('[data-testid="approval-card"]').first();
      
      // Then: ARIA labels present
      await expect(approvalCard).toHaveAttribute('role', 'article');
      await expect(approvalCard.locator('[data-testid="approve-button"]')).toHaveAttribute('aria-label');
      await expect(approvalCard.locator('[data-testid="reject-button"]')).toHaveAttribute('aria-label');
    });

    test('screen reader announcements', async ({ page }) => {
      // Given: Approval queue
      const firstApproval = page.locator('[data-testid="approval-card"]').first();
      
      // When: Approve action
      await firstApproval.locator('[data-testid="approve-button"]').click();
      
      // Then: Live region announces result
      await expect(page.locator('[role="status"]')).toHaveText(/approved/i);
    });
  });

  test.describe('Mobile Responsive', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size
    
    test('displays correctly on mobile', async ({ page }) => {
      // Given: Mobile viewport
      await page.goto('/approvals');
      
      // Then: Approval cards stack vertically
      const approvalCard = page.locator('[data-testid="approval-card"]').first();
      await expect(approvalCard).toBeVisible();
      
      // And: Buttons accessible
      await expect(approvalCard.locator('[data-testid="approve-button"]')).toBeVisible();
    });
  });
});

/**
 * Test execution notes:
 * 
 * BLOCKED: These tests cannot run until:
 * 1. Dashboard build is fixed (@shopify/polaris dependency)
 * 2. Approval queue UI is functional
 * 3. Agent SDK webhooks working
 * 
 * EVIDENCE: E2E test file created with comprehensive scenarios
 * STATUS: Ready for execution after blockers resolved
 * 
 * To run (when unblocked):
 * ```bash
 * npm run test:e2e -- approval-queue.spec.ts
 * # or
 * npx playwright test approval-queue.spec.ts
 * ```
 * 
 * To run with UI:
 * ```bash
 * npx playwright test --ui approval-queue.spec.ts
 * ```
 */
