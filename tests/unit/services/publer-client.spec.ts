/**
 * Publer Client Tests
 * Tests: 15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PublerClient, createPublerClient } from '../../../app/services/publer/client';
import type { PublerPost } from '../../../app/services/publer/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('PublerClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor and Factory', () => {
    it('should create client with config', () => {
      const client = new PublerClient({
        apiKey: 'test-key',
        workspaceId: 'test-workspace',
      });
      expect(client).toBeDefined();
    });

    it('should create client from environment variables', () => {
      process.env.PUBLER_API_KEY = 'env-key';
      process.env.PUBLER_WORKSPACE_ID = 'env-workspace';
      const client = createPublerClient();
      expect(client).toBeDefined();
    });

    it('should throw error if API key missing', () => {
      delete process.env.PUBLER_API_KEY;
      expect(() => createPublerClient()).toThrow('PUBLER_API_KEY is required');
    });

    it('should throw error if workspace ID missing', () => {
      process.env.PUBLER_API_KEY = 'test';
      delete process.env.PUBLER_WORKSPACE_ID;
      expect(() => createPublerClient()).toThrow('PUBLER_WORKSPACE_ID is required');
    });
  });

  describe('listWorkspaces', () => {
    it('should list workspaces successfully', async () => {
      const mockResponse = [{ id: 'ws1', name: 'Test Workspace', created_at: '2024-01-01', updated_at: '2024-01-01' }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const client = new PublerClient({ apiKey: 'test', workspaceId: 'test' });
      const result = await client.listWorkspaces();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
        headers: new Headers(),
      });

      const client = new PublerClient({ apiKey: 'test', workspaceId: 'test' });
      const result = await client.listWorkspaces();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should extract rate limit info from headers', async () => {
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', '100');
      headers.set('X-RateLimit-Remaining', '50');
      headers.set('X-RateLimit-Reset', '1234567890');

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
        headers,
      });

      const client = new PublerClient({ apiKey: 'test', workspaceId: 'test' });
      await client.listWorkspaces();

      const rateLimitInfo = client.getRateLimitInfo();
      expect(rateLimitInfo).toEqual({
        limit: 100,
        remaining: 50,
        reset: 1234567890,
      });
    });

    it('should retry on 429 rate limit', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: async () => 'Rate limited',
          headers: new Headers(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [{ id: 'ws1', name: 'Test' }],
          headers: new Headers(),
        });

      const client = new PublerClient({ apiKey: 'test', workspaceId: 'test' });
      const result = await client.listWorkspaces();

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should detect rate limit approaching when < 20% remaining', async () => {
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', '100');
      headers.set('X-RateLimit-Remaining', '15'); // 15% remaining
      headers.set('X-RateLimit-Reset', '1234567890');

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
        headers,
      });

      const client = new PublerClient({ apiKey: 'test', workspaceId: 'test' });
      await client.listWorkspaces();

      const rateLimitInfo = client.getRateLimitInfo();
      expect(rateLimitInfo).toBeDefined();
      expect(rateLimitInfo?.remaining).toBe(15);
      expect(rateLimitInfo?.limit).toBe(100);
      expect(client.isRateLimitApproaching()).toBe(true);
    });
  });

  describe('Error Handling and Retry', () => {
    it('should retry on server errors (500+)', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => 'Server error',
          headers: new Headers(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [],
          headers: new Headers(),
        });

      const client = new PublerClient({ apiKey: 'test', workspaceId: 'test' });
      const result = await client.listWorkspaces();

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on client errors (400-499)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not found',
        headers: new Headers(),
      });

      const client = new PublerClient({ apiKey: 'test', workspaceId: 'test' });
      const result = await client.listWorkspaces();

      expect(result.success).toBe(false);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on network errors', async () => {
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [],
          headers: new Headers(),
        });

      const client = new PublerClient({ apiKey: 'test', workspaceId: 'test' });
      const result = await client.listWorkspaces();

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('API Methods', () => {
    it('should schedule post successfully', async () => {
      const mockJob = { job_id: 'job123', status: 'pending' as const, created_at: '2024-01-01' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockJob,
        headers: new Headers(),
      });

      const client = new PublerClient({ apiKey: 'test', workspaceId: 'test' });
      const post: PublerPost = {
        text: 'Test post',
        accountIds: ['acc1'],
      };
      const result = await client.schedulePost(post);

      expect(result.success).toBe(true);
      expect(result.data?.job_id).toBe('job123');
    });

    it('should get job status successfully', async () => {
      const mockStatus = { job_id: 'job123', status: 'complete' as const, progress: 100 };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockStatus,
        headers: new Headers(),
      });

      const client = new PublerClient({ apiKey: 'test', workspaceId: 'test' });
      const result = await client.getJobStatus('job123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('complete');
    });

    it('should list accounts successfully', async () => {
      const mockAccounts = [
        { id: 'acc1', name: 'Account 1', platform: 'twitter' as const, is_active: true },
      ];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockAccounts,
        headers: new Headers(),
      });

      const client = new PublerClient({ apiKey: 'test', workspaceId: 'test' });
      const result = await client.listAccounts();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });
});
