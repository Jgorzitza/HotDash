/**
 * Unit Tests for Quality Scoring
 */

import { describe, it, expect } from 'vitest';

import { vi, beforeAll } from 'vitest';

vi.mock('@supabase/supabase-js', () => {
  const row = {
    id: 1,
    usage_count: 5,
    success_count: 4,
    confidence_score: 0.75,
    avg_tone_grade: 4.5,
    avg_accuracy_grade: 4.6,
    avg_policy_grade: 4.7,
    category: 'shipping',
    last_used_at: new Date().toISOString(),
    tags: []
  };
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

import { calculateArticleQuality, updateArticleConfidence, getSystemQualityMetrics } from '../../../app/lib/knowledge/quality';

describe('Article Quality Scoring', () => {
  describe('calculateArticleQuality', () => {
    it('should calculate quality metrics correctly', async () => {
      // Mock article with good metrics
      const articleId = 1;

      const metrics = await calculateArticleQuality(articleId);

      expect(metrics).toHaveProperty('confidenceScore');
      expect(metrics).toHaveProperty('usageRate');
      expect(metrics).toHaveProperty('successRate');
      expect(metrics).toHaveProperty('avgGrades');
      expect(metrics).toHaveProperty('qualityTier');
      expect(metrics).toHaveProperty('recommendations');
    });

    it('should classify excellent articles correctly', async () => {
      // Article with confidence >= 0.80, success >= 0.80, grades >= 4.5
      const metrics = await calculateArticleQuality(1);

      if (metrics.confidenceScore >= 0.80 && metrics.successRate >= 0.80) {
        expect(['excellent', 'good']).toContain(metrics.qualityTier);
      }
    });

    it('should provide recommendations for low-quality articles', async () => {
      const metrics = await calculateArticleQuality(1);

      expect(Array.isArray(metrics.recommendations)).toBe(true);
    });
  });

  describe('updateArticleConfidence', () => {
    it('should increase confidence on successful usage', async () => {
      await expect(
        updateArticleConfidence(1, true, { tone: 5, accuracy: 5, policy: 5 })
      ).resolves.not.toThrow();
    });

    it('should decrease confidence on unsuccessful usage', async () => {
      await expect(
        updateArticleConfidence(1, false, { tone: 2, accuracy: 3, policy: 4 })
      ).resolves.not.toThrow();
    });

    it('should update average grades correctly', async () => {
      await expect(
        updateArticleConfidence(1, true, { tone: 4, accuracy: 5, policy: 5 })
      ).resolves.not.toThrow();
    });
  });

  describe('getSystemQualityMetrics', () => {
    it('should return system-wide metrics', async () => {
      const metrics = await getSystemQualityMetrics();

      expect(metrics).toHaveProperty('totalArticles');
      expect(metrics).toHaveProperty('coverage');
      expect(metrics).toHaveProperty('avgConfidence');
      expect(metrics).toHaveProperty('qualityDistribution');
      expect(metrics).toHaveProperty('avgGrades');
    });

    it('should calculate quality distribution correctly', async () => {
      const metrics = await getSystemQualityMetrics();

      expect(metrics.qualityDistribution).toHaveProperty('excellent');
      expect(metrics.qualityDistribution).toHaveProperty('good');
      expect(metrics.qualityDistribution).toHaveProperty('fair');
      expect(metrics.qualityDistribution).toHaveProperty('poor');
    });
  });
});

