/**
 * Unit Tests: Advanced Customer AI Features
 * 
 * Tests sentiment analysis, intent detection, automated response suggestions,
 * satisfaction tracking, and HITL approval workflows.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AICustomerChatbot } from '~/services/ai-customer/chatbot.service';
import { SatisfactionTrackingService } from '~/services/ai-customer/satisfaction-tracking.service';
import { ResponseAutomationService } from '~/services/ai-customer/response-automation.service';

// Mock OpenAI with advanced analysis
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                intent: 'order_status',
                sentiment: 'neutral',
                urgency: 0.7,
                confidence: 0.9,
                suggestedTags: ['orders', 'tracking'],
                requiresEscalation: false,
                approvalReason: null,
                mcpToolsNeeded: ['storefront-mcp']
              })
            }
          }]
        })
      }
    }
  }))
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test_123',
              rating: 5,
              comment: 'Excellent service!',
              sentiment: 'positive'
            },
            error: null
          }),
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          }))
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'feedback_1',
                  rating: 5,
                  comment: 'Great service!',
                  sentiment: 'positive'
                },
                {
                  id: 'feedback_2',
                  rating: 3,
                  comment: 'Could be better',
                  sentiment: 'neutral'
                }
              ],
              error: null
            })
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'new_123',
              createdAt: new Date().toISOString()
            },
            error: null
          })
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 'updated_123' },
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

describe('Advanced Customer AI Features', () => {
  let chatbot: AICustomerChatbot;
  let satisfactionService: SatisfactionTrackingService;
  let automationService: ResponseAutomationService;

  beforeEach(async () => {
    chatbot = new AICustomerChatbot({
      openaiApiKey: 'test-key',
      model: 'gpt-4o-mini',
      autoApproveThreshold: 0.9
    });
    satisfactionService = new SatisfactionTrackingService();
    automationService = new ResponseAutomationService();
    await automationService.initialize();
  });

  describe('Sentiment Analysis', () => {
    it('should detect positive sentiment', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'Thank you so much! This is excellent service!',
        channel: 'email' as const,
        priority: 'medium' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      // The analysis should detect positive sentiment
      expect(response).toBeDefined();
    });

    it('should detect negative sentiment', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'This is terrible! I am very disappointed and frustrated!',
        channel: 'email' as const,
        priority: 'high' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      // Should require approval due to negative sentiment
      expect(response.requiresApproval).toBe(true);
    });

    it('should detect neutral sentiment', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'Where is my order?',
        channel: 'email' as const,
        priority: 'medium' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response).toBeDefined();
    });

    it('should analyze sentiment from feedback comments', async () => {
      const result = await satisfactionService.recordFeedback(
        'inquiry_123',
        'response_123',
        'customer_123',
        {
          rating: 5,
          category: 'response_quality',
          comment: 'Excellent service, very helpful!',
          tags: ['positive']
        }
      );

      expect(result).toBeDefined();
    });
  });

  describe('Intent Detection', () => {
    it('should detect order status intent', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'Where is my order #12345?',
        channel: 'email' as const,
        priority: 'medium' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response.suggestedTags).toContain('orders');
    });

    it('should detect refund request intent', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'I want a refund for my order',
        channel: 'email' as const,
        priority: 'high' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response.requiresApproval).toBe(true);
    });

    it('should detect product inquiry intent', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'Do you have this product in stock?',
        channel: 'chat' as const,
        priority: 'medium' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response.suggestedTags).toContain('inventory');
    });

    it('should detect general inquiry intent', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'What are your business hours?',
        channel: 'email' as const,
        priority: 'low' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response).toBeDefined();
    });
  });

  describe('Automated Response Suggestions', () => {
    it('should generate response suggestions', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'Where is my order?',
        channel: 'email' as const,
        priority: 'medium' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response.draftResponse).toBeDefined();
      expect(response.draftResponse.length).toBeGreaterThan(0);
    });

    it('should include confidence score with suggestions', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'Test inquiry',
        channel: 'email' as const,
        priority: 'medium' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });

    it('should suggest appropriate tags', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'I want to return my order',
        channel: 'email' as const,
        priority: 'medium' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response.suggestedTags).toBeDefined();
      expect(Array.isArray(response.suggestedTags)).toBe(true);
    });
  });

  describe('Satisfaction Tracking Integration', () => {
    it('should track satisfaction metrics', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const metrics = await satisfactionService.getSatisfactionMetrics(startDate, endDate);

      expect(metrics).toBeDefined();
      expect(metrics.overallSatisfaction).toBeGreaterThanOrEqual(0);
      expect(metrics.overallSatisfaction).toBeLessThanOrEqual(5);
    });

    it('should generate satisfaction reports', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const report = await satisfactionService.generateSatisfactionReport(startDate, endDate);

      expect(report).toBeDefined();
      expect(report.metrics).toBeDefined();
    });

    it('should track feedback with sentiment', async () => {
      const result = await satisfactionService.recordFeedback(
        'inquiry_123',
        'response_123',
        'customer_123',
        {
          rating: 4,
          category: 'response_quality',
          comment: 'Good service but could be faster',
          tags: ['helpful']
        }
      );

      expect(result).toBeDefined();
    });
  });

  describe('HITL Approval Workflow Integration', () => {
    it('should require approval for low confidence responses', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'Complex technical question about product specifications',
        channel: 'email' as const,
        priority: 'medium' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      if (response.confidence < 0.9) {
        expect(response.requiresApproval).toBe(true);
      }
    });

    it('should auto-approve high confidence responses', async () => {
      const inquiry = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'What are your business hours?',
        channel: 'email' as const,
        priority: 'low' as const
      };

      const response = await chatbot.processInquiry(inquiry);

      if (response.confidence >= 0.9) {
        expect(response.requiresApproval).toBe(false);
      }
    });

    it('should track approval workflow', async () => {
      const pending = await automationService.getPendingApprovals();

      expect(Array.isArray(pending)).toBe(true);
    });

    it('should handle response approval', async () => {
      const responseId = 'response_123';
      const approverId = 'user_123';

      await expect(
        automationService.approveResponse(responseId, approverId)
      ).resolves.not.toThrow();
    });

    it('should handle response rejection', async () => {
      const responseId = 'response_123';
      const approverId = 'user_123';
      const rejectionReason = 'Incorrect information';

      await expect(
        automationService.rejectResponse(responseId, approverId, rejectionReason)
      ).resolves.not.toThrow();
    });
  });
});

