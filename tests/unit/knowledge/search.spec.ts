/**
 * Unit Tests for KB Search
 */

import { describe, it, expect } from 'vitest';

import { vi, beforeAll } from 'vitest';

beforeAll(() => {
  // Deterministic embedding mock
  (globalThis as any).fetch = async () => ({
    json: async () => ({ data: [{ embedding: Array(10).fill(0.1) }] })
  });
});

vi.mock('@supabase/supabase-js', () => {
  const row = {
    id: 1,
    question: 'Where is my order?',
    answer: 'You can track your order in your account.',
    category: 'shipping',
    tags: ['order_tracking'],
    confidence_score: 0.9,
    embedding: Array(10).fill(0.1)
  };
  const query = {
    select: () => query,
    eq: () => query,
    neq: () => query,
    ilike: () => query,
    is: () => query,
    in: () => query,
    limit: () => query,
    update: () => query,
    insert: () => query,
    single: async () => ({ data: row }),
    then: async (resolve: any) => resolve({ data: [row, { ...row, id: 2, category: 'returns' }] })
  } as any;
  return {
    createClient: () => ({ from: () => query })
  };
});

import { semanticSearch, hybridSearch, contextualSearch } from '../../../app/lib/knowledge/search';

describe('KB Search', () => {
  describe('semanticSearch', () => {
    it('should return relevant articles for query', async () => {
      const results = await semanticSearch('where is my order', {
        minConfidence: 0.60,
        limit: 5
      });

      expect(Array.isArray(results)).toBe(true);
      results.forEach(result => {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('question');
        expect(result).toHaveProperty('answer');
        expect(result).toHaveProperty('relevanceScore');
        expect(result).toHaveProperty('combinedScore');
      });
    });

    it('should filter by category', async () => {
      const results = await semanticSearch('shipping question', {
        category: 'shipping',
        limit: 5
      });

      results.forEach(result => {
        expect(result.category).toBe('shipping');
      });
    });

    it('should respect confidence threshold', async () => {
      const results = await semanticSearch('test query', {
        minConfidence: 0.80,
        limit: 10
      });

      results.forEach(result => {
        expect(result.confidenceScore).toBeGreaterThanOrEqual(0.80);
      });
    });
  });

  describe('hybridSearch', () => {
    it('should combine semantic and keyword search', async () => {
      const results = await hybridSearch('order tracking', {
        limit: 5
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it('should rank results by combined score', async () => {
      const results = await hybridSearch('return policy', {
        limit: 5
      });

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].combinedScore).toBeGreaterThanOrEqual(results[i + 1].combinedScore);
      }
    });
  });

  describe('contextualSearch', () => {
    it('should use conversation history for context', async () => {
      const history = [
        'I ordered a product last week',
        'It was supposed to arrive yesterday'
      ];

      const results = await contextualSearch(
        'where is it',
        history,
        { limit: 5 }
      );

      expect(Array.isArray(results)).toBe(true);
    });
  });
});

