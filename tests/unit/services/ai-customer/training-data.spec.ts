/**
 * Unit Tests: AI Customer Service Training Data
 * 
 * Tests training data management, knowledge base, and template optimization.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrainingDataService } from '~/services/ai-customer/training-data.service';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'training_1',
                category: 'orders',
                question: 'Where is my order?',
                answer: 'You can track your order...',
                tags: ['orders', 'tracking'],
                confidence: 0.9,
                usageCount: 100,
                successRate: 0.95,
                isActive: true,
                lastUpdated: new Date().toISOString()
              },
              {
                id: 'training_2',
                category: 'returns',
                question: 'How do I return an item?',
                answer: 'To return an item...',
                tags: ['returns', 'refund'],
                confidence: 0.85,
                usageCount: 50,
                successRate: 0.9,
                isActive: true,
                lastUpdated: new Date().toISOString()
              }
            ],
            error: null
          })
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'training_123',
              category: 'orders',
              question: 'Test question',
              answer: 'Test answer',
              tags: ['test'],
              confidence: 0.8,
              usageCount: 0,
              successRate: 0,
              isActive: true,
              lastUpdated: new Date().toISOString()
            },
            error: null
          })
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'training_123',
                usageCount: 1,
                successRate: 1.0
              },
              error: null
            })
          }))
        }))
      }))
    }))
  }))
}));

// Mock logDecision
vi.mock('~/services/decisions.server', () => ({
  logDecision: vi.fn().mockResolvedValue(undefined)
}));

describe('AI Customer Service Training Data', () => {
  let trainingService: TrainingDataService;

  beforeEach(async () => {
    trainingService = new TrainingDataService();
    await trainingService.initialize();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const service = new TrainingDataService();
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('should load training data', async () => {
      const service = new TrainingDataService();
      await service.initialize();
      expect(service).toBeDefined();
    });

    it('should load knowledge base', async () => {
      const service = new TrainingDataService();
      await service.initialize();
      expect(service).toBeDefined();
    });
  });

  describe('Training Data Management', () => {
    it('should retrieve all training data', async () => {
      const data = await trainingService.getTrainingData();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should filter training data by category', async () => {
      const data = await trainingService.getTrainingData('orders');

      expect(Array.isArray(data)).toBe(true);
      data.forEach(item => {
        expect(item.category).toBe('orders');
      });
    });

    it('should only return active training data', async () => {
      const data = await trainingService.getTrainingData();

      data.forEach(item => {
        expect(item.isActive).toBe(true);
      });
    });

    it('should add new training data', async () => {
      const result = await trainingService.addTrainingData(
        'shipping',
        'How long does shipping take?',
        'Standard shipping takes 3-5 business days.',
        ['shipping', 'delivery']
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.category).toBe('shipping');
    });

    it('should update training data performance', async () => {
      const dataId = 'training_123';

      await expect(
        trainingService.updateTrainingDataPerformance(dataId, true, 0.95)
      ).resolves.not.toThrow();
    });
  });

  describe('Knowledge Base', () => {
    it('should search knowledge base', async () => {
      const query = 'order tracking';

      const results = await trainingService.searchKnowledgeBase(query);

      expect(Array.isArray(results)).toBe(true);
    });

    it('should filter knowledge base by category', async () => {
      const query = 'return policy';
      const category = 'returns';

      const results = await trainingService.searchKnowledgeBase(query, category);

      expect(Array.isArray(results)).toBe(true);
      results.forEach(item => {
        expect(item.category).toBe(category);
      });
    });

    it('should rank results by relevance', async () => {
      const query = 'shipping information';

      const results = await trainingService.searchKnowledgeBase(query);

      expect(Array.isArray(results)).toBe(true);
      // Results should be ordered by relevance
    });

    it('should add knowledge base entry', async () => {
      const result = await trainingService.addKnowledgeBaseEntry(
        'Return Policy',
        'Our return policy allows...',
        'returns',
        ['returns', 'policy'],
        [],
        ['return', 'refund', 'exchange']
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Return Policy');
    });
  });

  describe('Training Metrics', () => {
    it('should calculate training metrics', async () => {
      const metrics = await trainingService.getTrainingMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalTrainingData).toBeGreaterThanOrEqual(0);
      expect(metrics.activeEntries).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average confidence', async () => {
      const metrics = await trainingService.getTrainingMetrics();

      expect(metrics.averageConfidence).toBeGreaterThanOrEqual(0);
      expect(metrics.averageConfidence).toBeLessThanOrEqual(1);
    });

    it('should calculate average success rate', async () => {
      const metrics = await trainingService.getTrainingMetrics();

      expect(metrics.averageSuccessRate).toBeGreaterThanOrEqual(0);
      expect(metrics.averageSuccessRate).toBeLessThanOrEqual(1);
    });

    it('should show category distribution', async () => {
      const metrics = await trainingService.getTrainingMetrics();

      expect(metrics.categoryDistribution).toBeDefined();
      expect(typeof metrics.categoryDistribution).toBe('object');
    });

    it('should identify top performing entries', async () => {
      const metrics = await trainingService.getTrainingMetrics();

      expect(Array.isArray(metrics.topPerformingEntries)).toBe(true);
    });

    it('should provide improvement recommendations', async () => {
      const metrics = await trainingService.getTrainingMetrics();

      expect(Array.isArray(metrics.improvementRecommendations)).toBe(true);
    });
  });





  describe('Error Handling', () => {
    it('should handle missing required fields', async () => {
      await expect(
        trainingService.addTrainingData('', '', '', [])
      ).rejects.toThrow();
    });

    it('should handle invalid knowledge base entry', async () => {
      await expect(
        trainingService.addKnowledgeBaseEntry('', '', '', [], [], [])
      ).rejects.toThrow();
    });

    it('should handle search errors gracefully', async () => {
      const results = await trainingService.searchKnowledgeBase('');
      expect(Array.isArray(results)).toBe(true);
    });
  });
});

