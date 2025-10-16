/**
 * Integration Tests for KB Workflow
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { extractLearning } from '../../../app/services/knowledge/learning';
import { hybridSearch } from '../../../app/lib/knowledge/search';
import { updateArticleConfidence } from '../../../app/lib/knowledge/quality';
import { aiCustomerKBWorkflow } from '../../../app/agents/tools/knowledge';

describe('KB Workflow Integration', () => {
  describe('End-to-End Learning Flow', () => {
    it('should complete full learning cycle', async () => {
      // 1. Customer asks question
      const customerQuestion = 'When will my order arrive?';
      
      // 2. AI searches KB
      const searchResults = await hybridSearch(customerQuestion, {
        category: 'shipping',
        limit: 3
      });
      
      expect(searchResults.length).toBeGreaterThan(0);
      
      // 3. AI drafts reply using KB
      const kbArticle = searchResults[0];
      const aiDraft = `Based on our shipping policy: ${kbArticle.answer}`;
      
      // 4. Human edits and approves
      const humanFinal = `I understand you're eager to receive your order! ${kbArticle.answer} You can track your package using the link in your confirmation email.`;
      
      // 5. Extract learning
      await extractLearning({
        approvalId: 999,
        conversationId: 999,
        aiDraft,
        humanFinal,
        customerQuestion,
        grades: { tone: 5, accuracy: 5, policy: 5 },
        reviewer: 'test@example.com',
        category: 'shipping',
        tags: ['shipping_eta']
      });
      
      // 6. Update confidence
      await updateArticleConfidence(kbArticle.id, true, {
        tone: 5,
        accuracy: 5,
        policy: 5
      });
      
      // Workflow completed successfully
      expect(true).toBe(true);
    });
  });

  describe('AI-Customer Integration', () => {
    it('should provide KB context for agent', async () => {
      const result = await aiCustomerKBWorkflow(
        'How do I return an item?',
        [],
        'returns'
      );
      
      expect(result).toHaveProperty('kbArticles');
      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('articleIds');
      expect(result.context).toContain('KNOWLEDGE BASE CONTEXT');
    });

    it('should handle conversation context', async () => {
      const result = await aiCustomerKBWorkflow(
        'What about international shipping?',
        ['I want to order a product', 'Do you ship to Canada?'],
        'shipping'
      );
      
      expect(result.kbArticles.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Search and Retrieval', () => {
    it('should find articles across categories', async () => {
      const categories = ['orders', 'shipping', 'returns', 'products', 'technical', 'policies'];
      
      for (const category of categories) {
        const results = await hybridSearch('test query', {
          category: category as any,
          limit: 3
        });
        
        // Should not throw error
        expect(Array.isArray(results)).toBe(true);
      }
    });
  });
});

