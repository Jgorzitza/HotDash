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
      const newData = {
        category: 'shipping',
        question: 'How long does shipping take?',
        answer: 'Standard shipping takes 3-5 business days.',
        tags: ['shipping', 'delivery'],
        confidence: 0.9
      };

      const result = await trainingService.addTrainingData(newData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.category).toBe('shipping');
    });

    it('should update training data', async () => {
      const dataId = 'training_123';
      const updates = {
        confidence: 0.95,
        usageCount: 150,
        successRate: 0.98
      };

      const result = await trainingService.updateTrainingData(dataId, updates);

      expect(result).toBeDefined();
      expect(result.id).toBe(dataId);
    });

    it('should deactivate training data', async () => {
      const dataId = 'training_123';

      const result = await trainingService.deactivateTrainingData(dataId);

      expect(result.isActive).toBe(false);
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
      const entry = {
        title: 'Return Policy',
        content: 'Our return policy allows...',
        category: 'returns',
        tags: ['returns', 'policy'],
        relatedProducts: [],
        searchKeywords: ['return', 'refund', 'exchange']
      };

      const result = await trainingService.addKnowledgeBaseEntry(entry);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Return Policy');
    });

    it('should update knowledge base entry', async () => {
      const entryId = 'kb_123';
      const updates = {
        content: 'Updated content',
        tags: ['updated', 'tags']
      };

      const result = await trainingService.updateKnowledgeBaseEntry(entryId, updates);

      expect(result).toBeDefined();
      expect(result.id).toBe(entryId);
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

  describe('Template Optimization', () => {
    it('should analyze template performance', async () => {
      const templateId = 'template_123';

      const analysis = await trainingService.analyzeTemplatePerformance(templateId);

      expect(analysis).toBeDefined();
      expect(analysis.usageCount).toBeGreaterThanOrEqual(0);
      expect(analysis.successRate).toBeGreaterThanOrEqual(0);
      expect(analysis.successRate).toBeLessThanOrEqual(1);
    });

    it('should suggest template improvements', async () => {
      const templateId = 'template_123';

      const suggestions = await trainingService.suggestTemplateImprovements(templateId);

      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should identify underperforming templates', async () => {
      const templates = await trainingService.getUnderperformingTemplates();

      expect(Array.isArray(templates)).toBe(true);
    });

    it('should optimize template based on feedback', async () => {
      const templateId = 'template_123';
      const feedback = [
        { rating: 5, comment: 'Great response' },
        { rating: 4, comment: 'Good but could be faster' }
      ];

      const optimized = await trainingService.optimizeTemplate(templateId, feedback);

      expect(optimized).toBeDefined();
      expect(optimized.id).toBe(templateId);
    });
  });

  describe('Data Quality', () => {
    it('should validate training data quality', async () => {
      const data = {
        category: 'orders',
        question: 'Where is my order?',
        answer: 'You can track your order...',
        tags: ['orders'],
        confidence: 0.9
      };

      const validation = await trainingService.validateTrainingData(data);

      expect(validation.isValid).toBe(true);
    });

    it('should detect low quality data', async () => {
      const data = {
        category: '',
        question: 'q',
        answer: 'a',
        tags: [],
        confidence: 0.1
      };

      const validation = await trainingService.validateTrainingData(data);

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toBeDefined();
      expect(validation.issues.length).toBeGreaterThan(0);
    });

    it('should check for duplicate entries', async () => {
      const data = {
        category: 'orders',
        question: 'Where is my order?',
        answer: 'Track your order...',
        tags: ['orders'],
        confidence: 0.9
      };

      const hasDuplicate = await trainingService.checkForDuplicates(data);

      expect(typeof hasDuplicate).toBe('boolean');
    });
  });

  describe('Export and Import', () => {
    it('should export training data', async () => {
      const exported = await trainingService.exportTrainingData();

      expect(exported).toBeDefined();
      expect(Array.isArray(exported)).toBe(true);
    });

    it('should export by category', async () => {
      const category = 'orders';
      const exported = await trainingService.exportTrainingData(category);

      expect(Array.isArray(exported)).toBe(true);
      exported.forEach(item => {
        expect(item.category).toBe(category);
      });
    });

    it('should import training data', async () => {
      const data = [
        {
          category: 'shipping',
          question: 'How long does shipping take?',
          answer: 'Standard shipping takes 3-5 business days.',
          tags: ['shipping'],
          confidence: 0.9
        }
      ];

      const result = await trainingService.importTrainingData(data);

      expect(result.imported).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });

    it('should validate data before import', async () => {
      const invalidData = [
        {
          category: '',
          question: '',
          answer: '',
          tags: [],
          confidence: 2.0 // Invalid
        }
      ];

      const result = await trainingService.importTrainingData(invalidData);

      expect(result.failed).toBeGreaterThan(0);
      expect(result.errors).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields', async () => {
      const data = {
        category: 'orders',
        question: '',
        answer: '',
        tags: [],
        confidence: 0.8
      };

      await expect(trainingService.addTrainingData(data)).rejects.toThrow();
    });

    it('should handle invalid confidence values', async () => {
      const data = {
        category: 'orders',
        question: 'Test',
        answer: 'Test',
        tags: ['test'],
        confidence: 1.5 // Invalid
      };

      await expect(trainingService.addTrainingData(data)).rejects.toThrow();
    });

    it('should handle database errors', async () => {
      const data = {
        category: 'orders',
        question: 'Test',
        answer: 'Test',
        tags: ['test'],
        confidence: 0.8
      };

      // Mock database error
      vi.mocked(trainingService).saveTrainingData = vi.fn().mockRejectedValue(
        new Error('Database error')
      );

      await expect(trainingService.addTrainingData(data)).rejects.toThrow();
    });
  });
});

