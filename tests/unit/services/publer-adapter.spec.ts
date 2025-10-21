/**
 * Publer Adapter Tests
 * Tests: 12
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PublerAdapter, createPublerAdapter } from '../../../app/services/publer/adapter';
import type { SocialPostApproval } from '../../../app/services/publer/adapter';

vi.mock('../../../app/services/publer/client', () => ({
  createPublerClient: vi.fn(() => ({
    schedulePost: vi.fn(),
    publishPost: vi.fn(),
    getJobStatus: vi.fn(),
    listAccounts: vi.fn(),
    getRateLimitInfo: vi.fn(),
    isRateLimitApproaching: vi.fn(() => false),
  })),
}));

describe('PublerAdapter', () => {
  let adapter: PublerAdapter;
  let mockClient: any;

  beforeEach(() => {
    adapter = createPublerAdapter();
    mockClient = (adapter as any).client;
  });

  describe('publishApproval', () => {
    it('should reject non-approved posts', async () => {
      const approval: SocialPostApproval = {
        id: '1',
        type: 'social_post',
        status: 'draft',
        content: { text: 'Test', accountIds: ['acc1'] },
        metadata: {},
        created_at: '2024-01-01',
      };

      const result = await adapter.publishApproval(approval);
      expect(result.success).toBe(false);
      expect(result.error).toContain('draft');
    });

    it('should publish approved post successfully', async () => {
      const approval: SocialPostApproval = {
        id: '1',
        type: 'social_post',
        status: 'approved',
        content: { text: 'Test', accountIds: ['acc1'] },
        metadata: { platform: 'twitter' },
        created_at: '2024-01-01',
      };

      mockClient.publishPost.mockResolvedValue({
        success: true,
        data: { job_id: 'job123', status: 'pending', created_at: '2024-01-01' },
      });

      const result = await adapter.publishApproval(approval);
      expect(result.success).toBe(true);
      expect(result.jobId).toBe('job123');
      expect(result.receipt).toBeDefined();
      expect(result.receipt?.platform).toBe('twitter');
    });

    it('should schedule post if scheduledAt is provided', async () => {
      const approval: SocialPostApproval = {
        id: '1',
        type: 'social_post',
        status: 'approved',
        content: { text: 'Test', accountIds: ['acc1'], scheduledAt: '2025-01-01T00:00:00Z' },
        metadata: {},
        created_at: '2024-01-01',
      };

      mockClient.schedulePost.mockResolvedValue({
        success: true,
        data: { job_id: 'job123', status: 'pending', created_at: '2024-01-01' },
      });

      const result = await adapter.publishApproval(approval);
      expect(result.success).toBe(true);
      expect(mockClient.schedulePost).toHaveBeenCalled();
      expect(mockClient.publishPost).not.toHaveBeenCalled();
    });

    it('should handle Publer API failure', async () => {
      const approval: SocialPostApproval = {
        id: '1',
        type: 'social_post',
        status: 'approved',
        content: { text: 'Test', accountIds: ['acc1'] },
        metadata: {},
        created_at: '2024-01-01',
      };

      mockClient.publishPost.mockResolvedValue({
        success: false,
        error: { code: 'API_ERROR', message: 'Failed', status: 500 },
      });

      const result = await adapter.publishApproval(approval);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed');
    });

    it('should handle exceptions during publishing', async () => {
      const approval: SocialPostApproval = {
        id: '1',
        type: 'social_post',
        status: 'approved',
        content: { text: 'Test', accountIds: ['acc1'] },
        metadata: {},
        created_at: '2024-01-01',
      };

      mockClient.publishPost.mockRejectedValue(new Error('Network error'));

      const result = await adapter.publishApproval(approval);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should include media in post', async () => {
      const approval: SocialPostApproval = {
        id: '1',
        type: 'social_post',
        status: 'approved',
        content: {
          text: 'Test',
          accountIds: ['acc1'],
          media: [{ url: 'https://example.com/image.jpg', type: 'image' }],
        },
        metadata: {},
        created_at: '2024-01-01',
      };

      mockClient.publishPost.mockResolvedValue({
        success: true,
        data: { job_id: 'job123', status: 'pending', created_at: '2024-01-01' },
      });

      await adapter.publishApproval(approval);
      expect(mockClient.publishPost).toHaveBeenCalledWith(
        expect.objectContaining({
          media: [{ url: 'https://example.com/image.jpg', type: 'image' }],
        })
      );
    });
  });

  describe('checkPublishStatus', () => {
    it('should check job status successfully', async () => {
      const mockStatus = { job_id: 'job123', status: 'complete' as const, progress: 100 };
      mockClient.getJobStatus.mockResolvedValue({
        success: true,
        data: mockStatus,
      });

      const status = await adapter.checkPublishStatus('job123');
      expect(status).toEqual(mockStatus);
    });

    it('should return null on API failure', async () => {
      mockClient.getJobStatus.mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Failed', status: 500 },
      });

      const status = await adapter.checkPublishStatus('job123');
      expect(status).toBeNull();
    });

    it('should handle exceptions during status check', async () => {
      mockClient.getJobStatus.mockRejectedValue(new Error('Network error'));

      const status = await adapter.checkPublishStatus('job123');
      expect(status).toBeNull();
    });
  });

  describe('updateReceiptFromJobStatus', () => {
    it('should update receipt with job status', () => {
      const receipt = {
        id: 'r1',
        approval_id: 'a1',
        publer_job_id: 'j1',
        platform: 'twitter',
        content: 'Test',
        published_at: '2024-01-01',
        status: 'pending' as const,
      };

      const jobStatus = {
        job_id: 'j1',
        status: 'complete' as const,
        progress: 100,
        posts: [
          {
            post_id: 'p1',
            account_id: 'acc1',
            platform: 'twitter',
            url: 'https://twitter.com/post/123',
            published_at: '2024-01-02',
          },
        ],
      };

      const updated = adapter.updateReceiptFromJobStatus(receipt, jobStatus);
      expect(updated.status).toBe('complete');
      expect(updated.post_url).toBe('https://twitter.com/post/123');
      expect(updated.published_at).toBe('2024-01-02');
    });

    it('should handle job status without posts', () => {
      const receipt = {
        id: 'r1',
        approval_id: 'a1',
        publer_job_id: 'j1',
        platform: 'twitter',
        content: 'Test',
        published_at: '2024-01-01',
        status: 'pending' as const,
      };

      const jobStatus = {
        job_id: 'j1',
        status: 'processing' as const,
        progress: 50,
      };

      const updated = adapter.updateReceiptFromJobStatus(receipt, jobStatus);
      expect(updated.status).toBe('processing');
      expect(updated.post_url).toBeUndefined();
    });
  });

  describe('listAccounts', () => {
    it('should list accounts successfully', async () => {
      const mockAccounts = [{ id: 'acc1', name: 'Account 1', platform: 'twitter' as const, is_active: true }];
      mockClient.listAccounts.mockResolvedValue({
        success: true,
        data: mockAccounts,
      });

      const accounts = await adapter.listAccounts();
      expect(accounts).toEqual(mockAccounts);
    });

    it('should return empty array on API failure', async () => {
      mockClient.listAccounts.mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Failed', status: 500 },
      });

      const accounts = await adapter.listAccounts();
      expect(accounts).toEqual([]);
    });
  });
});
