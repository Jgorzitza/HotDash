/**
 * Social Post Queue Tests
 * Tests: 10
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocialPostQueue, createSocialPostQueue, getSocialPostQueue } from '../../../app/services/social/queue';
import type { SocialPostApproval } from '../../../app/services/publer/adapter';

vi.mock('../../../app/services/publer/adapter', () => ({
  createPublerAdapter: vi.fn(() => ({
    publishApproval: vi.fn(),
  })),
}));

describe('SocialPostQueue', () => {
  let queue: SocialPostQueue;
  let mockAdapter: any;

  beforeEach(() => {
    queue = createSocialPostQueue({ maxAttempts: 3, initialDelay: 100 });
    mockAdapter = (queue as any).adapter;
  });

  const createMockApproval = (id = '1'): SocialPostApproval => ({
    id,
    type: 'social_post',
    status: 'approved',
    content: { text: 'Test post', accountIds: ['acc1'] },
    metadata: {},
    created_at: '2024-01-01',
  });

  describe('enqueue', () => {
    it('should enqueue post with default priority', () => {
      const approval = createMockApproval();
      const queued = queue.enqueue(approval);

      expect(queued.id).toBeDefined();
      expect(queued.status).toBe('queued');
      expect(queued.priority).toBe(5);
      expect(queued.attempts).toBe(0);
    });

    it('should enqueue post with custom priority', () => {
      const approval = createMockApproval();
      const queued = queue.enqueue(approval, 9);

      expect(queued.priority).toBe(9);
    });

    it('should track multiple posts', () => {
      queue.enqueue(createMockApproval('1'));
      queue.enqueue(createMockApproval('2'));
      queue.enqueue(createMockApproval('3'));

      const stats = queue.getStats();
      expect(stats.total).toBe(3);
      expect(stats.queued).toBe(3);
    });
  });

  describe('processQueue', () => {
    it('should process queued post successfully', async () => {
      mockAdapter.publishApproval.mockResolvedValue({
        success: true,
        jobId: 'job123',
        receipt: { id: 'r1', approval_id: '1', publer_job_id: 'job123', platform: 'twitter', content: 'Test', published_at: '2024-01-01', status: 'pending' },
      });

      const approval = createMockApproval();
      const queued = queue.enqueue(approval);

      await queue.processQueue();

      const processed = queue.getPost(queued.id);
      expect(processed?.status).toBe('completed');
      expect(processed?.receipt).toBeDefined();
    });

    it('should retry failed posts', async () => {
      mockAdapter.publishApproval
        .mockResolvedValueOnce({ success: false, error: 'API Error' })
        .mockResolvedValueOnce({
          success: true,
          jobId: 'job123',
          receipt: { id: 'r1', approval_id: '1', publer_job_id: 'job123', platform: 'twitter', content: 'Test', published_at: '2024-01-01', status: 'pending' },
        });

      const approval = createMockApproval();
      const queued = queue.enqueue(approval);

      await queue.processQueue();
      
      // Wait for retry delay
      await new Promise(resolve => setTimeout(resolve, 150));
      await queue.processQueue();

      const processed = queue.getPost(queued.id);
      expect(processed?.status).toBe('completed');
      expect(processed?.attempts).toBe(2);
    });

    it('should mark as failed after max retries', async () => {
      mockAdapter.publishApproval.mockResolvedValue({ success: false, error: 'Permanent error' });

      const approval = createMockApproval();
      const queued = queue.enqueue(approval);

      // Process until max attempts reached
      for (let i = 0; i < 4; i++) { // Process 4 times to ensure all 3 attempts complete
        await queue.processQueue();
        if (i < 3) {
          await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay for retry timing
        }
      }

      const processed = queue.getPost(queued.id);
      expect(processed?.status).toBe('failed');
      expect(processed?.attempts).toBeGreaterThanOrEqual(3);
    });

    it('should process posts by priority (highest first)', async () => {
      mockAdapter.publishApproval.mockResolvedValue({
        success: true,
        jobId: 'job123',
        receipt: { id: 'r1', approval_id: '1', publer_job_id: 'job123', platform: 'twitter', content: 'Test', published_at: '2024-01-01', status: 'pending' },
      });

      queue.enqueue(createMockApproval('1'), 5);
      queue.enqueue(createMockApproval('2'), 9);
      queue.enqueue(createMockApproval('3'), 3);

      const callOrder: string[] = [];
      mockAdapter.publishApproval.mockImplementation((approval: SocialPostApproval) => {
        callOrder.push(approval.id);
        return Promise.resolve({ success: true, jobId: 'job', receipt: {} });
      });

      await queue.processQueue();

      expect(callOrder).toEqual(['2', '1', '3']); // Priority 9, 5, 3
    });
  });

  describe('getStats', () => {
    it('should return queue statistics', () => {
      queue.enqueue(createMockApproval('1'));
      queue.enqueue(createMockApproval('2'));

      const stats = queue.getStats();
      expect(stats.total).toBe(2);
      expect(stats.queued).toBe(2);
      expect(stats.processing).toBe(0);
    });
  });

  describe('cancel', () => {
    it('should cancel queued post', () => {
      const queued = queue.enqueue(createMockApproval());
      const cancelled = queue.cancel(queued.id);

      expect(cancelled).toBe(true);
      expect(queue.getPost(queued.id)?.status).toBe('failed');
      expect(queue.getPost(queued.id)?.error).toContain('Cancelled');
    });

    it('should not cancel completed post', async () => {
      mockAdapter.publishApproval.mockResolvedValue({
        success: true,
        jobId: 'job123',
        receipt: { id: 'r1', approval_id: '1', publer_job_id: 'job123', platform: 'twitter', content: 'Test', published_at: '2024-01-01', status: 'pending' },
      });

      const queued = queue.enqueue(createMockApproval());
      await queue.processQueue();

      const cancelled = queue.cancel(queued.id);
      expect(cancelled).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should remove old completed posts', async () => {
      mockAdapter.publishApproval.mockResolvedValue({
        success: true,
        jobId: 'job123',
        receipt: { id: 'r1', approval_id: '1', publer_job_id: 'job123', platform: 'twitter', content: 'Test', published_at: '2024-01-01', status: 'pending' },
      });

      const queued = queue.enqueue(createMockApproval());
      await queue.processQueue();

      // Wait a bit to ensure timestamps are different
      await new Promise(resolve => setTimeout(resolve, 10));

      // Cleanup posts older than 0ms (should remove the completed post)
      const removed = queue.cleanup(0);
      expect(removed).toBe(1);
      expect(queue.getPost(queued.id)).toBeUndefined();
    });

    it('should not remove recent completed posts', async () => {
      mockAdapter.publishApproval.mockResolvedValue({
        success: true,
        jobId: 'job123',
        receipt: { id: 'r1', approval_id: '1', publer_job_id: 'job123', platform: 'twitter', content: 'Test', published_at: '2024-01-01', status: 'pending' },
      });

      const queued = queue.enqueue(createMockApproval());
      await queue.processQueue();

      // Cleanup posts older than 1 hour (should NOT remove recent post)
      const removed = queue.cleanup(3600000);
      expect(removed).toBe(0);
      expect(queue.getPost(queued.id)).toBeDefined();
    });
  });

  describe('getSocialPostQueue singleton', () => {
    it('should return same instance', () => {
      const q1 = getSocialPostQueue();
      const q2 = getSocialPostQueue();
      expect(q1).toBe(q2);
    });
  });
});
