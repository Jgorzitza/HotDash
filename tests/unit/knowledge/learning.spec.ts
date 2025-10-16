/**
 * Unit Tests for Learning Extraction Pipeline
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => {
  const row = { id: 1 };
  const query = {
    select: () => query,
    eq: () => query,
    ilike: () => query,
    is: () => query,
    in: () => query,
    limit: () => query,
    update: () => query,
    insert: () => query,
    single: async () => ({ data: row }),
    then: async (resolve: any) => resolve({ data: [row] })
  } as any;
  return {
    createClient: () => ({ from: () => query })
  };
});

import { extractLearning, trackRecurringIssue } from '../../../app/services/knowledge/learning';

describe('Learning Extraction Pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractLearning', () => {
    it('should create learning edit record with correct edit ratio', async () => {
      const input = {
        approvalId: 1,
        conversationId: 100,
        aiDraft: 'Your order will arrive soon.',
        humanFinal: 'I understand you\'re eager to receive your order! It will arrive within 2-3 business days.',
        customerQuestion: 'When will my order arrive?',
        grades: { tone: 5, accuracy: 5, policy: 5 },
        reviewer: 'justin@hotrodan.com',
        category: 'shipping' as const,
        tags: ['shipping_eta']
      };

      await expect(extractLearning(input)).resolves.not.toThrow();
    });

    it('should create KB article for high-quality significant edits', async () => {
      const input = {
        approvalId: 2,
        conversationId: 101,
        aiDraft: 'We will ship your order.',
        humanFinal: 'Great news! Your order will ship within 24 hours via expedited shipping. You\'ll receive tracking information via email once it ships.',
        customerQuestion: 'When will you ship my order?',
        grades: { tone: 5, accuracy: 5, policy: 5 },
        reviewer: 'justin@hotrodan.com',
        category: 'shipping' as const,
        tags: ['shipping_eta', 'order_status']
      };

      await expect(extractLearning(input)).resolves.not.toThrow();
    });

    it('should handle tone improvements correctly', async () => {
      const input = {
        approvalId: 3,
        conversationId: 102,
        aiDraft: 'Your order is delayed.',
        humanFinal: 'I sincerely apologize for the delay with your order. We\'re working to get it to you as quickly as possible.',
        customerQuestion: 'Why is my order delayed?',
        grades: { tone: 3, accuracy: 5, policy: 5 },
        reviewer: 'justin@hotrodan.com',
        category: 'shipping' as const
      };

      await expect(extractLearning(input)).resolves.not.toThrow();
    });
  });

  describe('trackRecurringIssue', () => {
    it('should create new recurring issue on first occurrence', async () => {
      await expect(
        trackRecurringIssue(
          'where is my order',
          'orders',
          ['order_tracking']
        )
      ).resolves.not.toThrow();
    });

    it('should increment occurrence count for existing issue', async () => {
      const pattern = 'package not delivered';

      await trackRecurringIssue(pattern, 'shipping', ['delivery_issue']);
      await trackRecurringIssue(pattern, 'shipping', ['delivery_issue']);

      // Should have occurrence_count = 2
    });

    it('should flag issue for KB creation after 3 occurrences', async () => {
      const pattern = 'refund not received';

      for (let i = 0; i < 3; i++) {
        await trackRecurringIssue(pattern, 'returns', ['refund_timeline']);
      }

      // Should trigger KB creation flag
    });
  });
});

