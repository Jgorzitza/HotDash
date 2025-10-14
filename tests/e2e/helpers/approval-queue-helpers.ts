/**
 * E2E Test Helpers for Approval Queue
 * Utilities to support Playwright E2E test development
 */

import { Page, expect } from '@playwright/test';

export interface ApprovalQueueHelpers {
  goto: () => Promise<void>;
  getQueueItemCount: () => Promise<number>;
  approveItem: (itemId: string) => Promise<void>;
  editAndApprove: (itemId: string, newContent: string) => Promise<void>;
  rejectItem: (itemId: string, reason: string, notes?: string) => Promise<void>;
  escalateItem: (itemId: string, assignee: string, reason: string) => Promise<void>;
  waitForRealtimeUpdate: (expectedCount: number) => Promise<void>;
  verifyItemRemoved: (itemId: string) => Promise<void>;
  measureActionTime: (action: () => Promise<void>) => Promise<number>;
}

/**
 * Create approval queue test helpers
 */
export function createApprovalQueueHelpers(page: Page): ApprovalQueueHelpers {
  return {
    async goto() {
      await page.goto('/app/approvals');
      await page.waitForLoadState('networkidle');
    },

    async getQueueItemCount() {
      return page.locator('[data-testid="queue-item"]').count();
    },

    async approveItem(itemId: string) {
      await page.click(`[data-testid="approve-button-${itemId}"]`);
      await page.waitForSelector('[data-testid="confirm-approve-modal"]');
      await page.click('[data-testid="confirm-approve"]');
      
      // Wait for success notification
      await page.waitForSelector('[data-testid="approval-success"]', { timeout: 3000 });
    },

    async editAndApprove(itemId: string, newContent: string) {
      await page.click(`[data-testid="edit-button-${itemId}"]`);
      await page.waitForSelector('[data-testid="draft-editor"]');
      
      // Clear and enter new content
      await page.fill('[data-testid="draft-editor"]', '');
      await page.fill('[data-testid="draft-editor"]', newContent);
      
      // Verify character count updates
      const charCount = await page.locator('[data-testid="char-count"]').textContent();
      expect(Number(charCount)).toBe(newContent.length);
      
      await page.click('[data-testid="send-edited-button"]');
      await page.waitForSelector('[data-testid="edit-success"]', { timeout: 3000 });
    },

    async rejectItem(itemId: string, reason: string, notes?: string) {
      await page.click(`[data-testid="reject-button-${itemId}"]`);
      await page.waitForSelector('[data-testid="rejection-dialog"]');
      
      await page.selectOption('[data-testid="rejection-reason-select"]', reason);
      
      if (notes) {
        await page.fill('[data-testid="rejection-notes"]', notes);
      }
      
      await page.click('[data-testid="confirm-reject"]');
      await page.waitForSelector('[data-testid="rejection-success"]', { timeout: 3000 });
    },

    async escalateItem(itemId: string, assignee: string, reason: string) {
      await page.click(`[data-testid="escalate-button-${itemId}"]`);
      await page.waitForSelector('[data-testid="escalation-dialog"]');
      
      await page.selectOption('[data-testid="assignee-select"]', assignee);
      await page.fill('[data-testid="escalation-reason-input"]', reason);
      await page.click('[data-testid="confirm-escalate"]');
      
      await page.waitForSelector('[data-testid="escalation-success"]', { timeout: 3000 });
    },

    async waitForRealtimeUpdate(expectedCount: number) {
      // Wait for queue count to match expected (real-time update)
      await page.waitForFunction(
        (count) => {
          const items = document.querySelectorAll('[data-testid="queue-item"]');
          return items.length === count;
        },
        expectedCount,
        { timeout: 10000 }
      );
    },

    async verifyItemRemoved(itemId: string) {
      await expect(page.locator(`[data-testid="queue-item-${itemId}"]`)).not.toBeVisible();
    },

    async measureActionTime(action: () => Promise<void>): Promise<number> {
      const start = Date.now();
      await action();
      return Date.now() - start;
    },
  };
}

/**
 * Performance measurement utilities
 */
export async function measureTileLoadTime(page: Page, tileTestId: string): Promise<number> {
  const start = Date.now();
  await page.waitForSelector(`[data-testid="${tileTestId}"]`, { state: 'visible' });
  return Date.now() - start;
}

export async function measureAPIResponseTime(page: Page, apiUrl: string): Promise<number> {
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes(apiUrl)),
    page.reload(),
  ]);
  
  return response.timing().responseEnd;
}

/**
 * Database query helpers for verification
 */
export interface DatabaseHelpers {
  getRecentDecisions: (limit?: number) => Promise<unknown[]>;
  getApprovalMetrics: () => Promise<{ total: number; approved: number; rejected: number }>;
  clearTestData: () => Promise<void>;
}

export function createDatabaseHelpers(): DatabaseHelpers {
  // Note: Import prisma or supabase client as needed
  return {
    async getRecentDecisions(limit = 10) {
      // Placeholder - QA will implement with actual DB client
      return [];
    },

    async getApprovalMetrics() {
      // Placeholder - query decision_log for metrics
      return { total: 0, approved: 0, rejected: 0 };
    },

    async clearTestData() {
      // Placeholder - clean up test data
    },
  };
}

/**
 * Test data seeding helpers
 */
export async function seedApprovalQueue(items: unknown[]): Promise<void> {
  // Placeholder - implement with Supabase client
  // Insert into agent_sdk_approval_queue table
}

export async function seedConversations(conversations: unknown[]): Promise<void> {
  // Placeholder - seed Chatwoot test conversations
}

/**
 * Assertion helpers
 */
export async function assertQueueState(
  page: Page,
  expectedState: { count: number; urgent?: number }
) {
  const count = await page.locator('[data-testid="queue-item"]').count();
  expect(count).toBe(expectedState.count);
  
  if (expectedState.urgent !== undefined) {
    const urgentCount = await page.locator('[data-testid="queue-item-urgent"]').count();
    expect(urgentCount).toBe(expectedState.urgent);
  }
}

export async function assertPerformanceMetric(
  metricName: string,
  actualMs: number,
  targetMs: number
) {
  expect(actualMs, `${metricName} should be under ${targetMs}ms, got ${actualMs}ms`).toBeLessThan(targetMs);
}

