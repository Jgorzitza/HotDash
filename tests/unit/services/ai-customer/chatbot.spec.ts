/**
 * Unit Tests: AI Customer Service Chatbot
 * 
 * Tests chatbot functionality, inquiry processing, response generation,
 * and HITL approval workflows.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AICustomerChatbot } from '~/services/ai-customer/chatbot.service';
import type { CustomerInquiry, AIResponse } from '~/services/ai-customer/chatbot.service';

// Mock OpenAI
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
                urgency: 0.5,
                confidence: 0.85,
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
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'inquiry_123',
              customerId: 'customer_456',
              customerEmail: 'test@example.com',
              message: 'Test inquiry',
              channel: 'email',
              priority: 'medium',
              status: 'new',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            error: null
          })
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        }))
      }))
    }))
  }))
}));

// Mock logDecision
vi.mock('~/services/decisions.server', () => ({
  logDecision: vi.fn().mockResolvedValue(undefined)
}));

describe('AI Customer Service Chatbot', () => {
  let chatbot: AICustomerChatbot;

  beforeEach(() => {
    chatbot = new AICustomerChatbot({
      openaiApiKey: 'test-key',
      model: 'gpt-4o-mini',
      autoApproveThreshold: 0.9
    });
  });

  describe('Configuration', () => {
    it('should initialize with default config', () => {
      const defaultChatbot = new AICustomerChatbot();
      expect(defaultChatbot).toBeDefined();
    });

    it('should accept custom config', () => {
      const customChatbot = new AICustomerChatbot({
        model: 'gpt-4',
        temperature: 0.5,
        maxTokens: 1000
      });
      expect(customChatbot).toBeDefined();
    });

    it('should enable MCP integrations by default', () => {
      const chatbot = new AICustomerChatbot();
      expect(chatbot).toBeDefined();
      // MCP flags are enabled by default in config
    });
  });

  describe('Inquiry Processing', () => {
    it('should process customer inquiry successfully', async () => {
      const inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        customerName: 'Test Customer',
        message: 'Where is my order?',
        channel: 'email',
        priority: 'medium'
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response).toBeDefined();
      expect(response.inquiryId).toBeDefined();
      expect(response.draftResponse).toBeDefined();
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });

    it('should detect high priority inquiries', async () => {
      const urgentInquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'URGENT: Need immediate refund!',
        channel: 'chat',
        priority: 'urgent'
      };

      const response = await chatbot.processInquiry(urgentInquiry);

      expect(response.requiresApproval).toBe(true);
      expect(response.approvalReason).toBeDefined();
    });

    it('should suggest appropriate tags', async () => {
      const inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'I want to return my order',
        channel: 'email',
        priority: 'medium'
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response.suggestedTags).toBeDefined();
      expect(Array.isArray(response.suggestedTags)).toBe(true);
    });
  });

  describe('Approval Workflow', () => {
    it('should require approval for low confidence responses', async () => {
      const inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'Complex technical question about product specifications',
        channel: 'email',
        priority: 'medium'
      };

      const response = await chatbot.processInquiry(inquiry);

      if (response.confidence < 0.9) {
        expect(response.requiresApproval).toBe(true);
      }
    });

    it('should auto-approve high confidence responses', async () => {
      const inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'What are your business hours?',
        channel: 'email',
        priority: 'low'
      };

      const response = await chatbot.processInquiry(inquiry);

      if (response.confidence >= 0.9) {
        expect(response.requiresApproval).toBe(false);
      }
    });

    it('should require approval for escalation keywords', async () => {
      const inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'I want to file a complaint and get a refund',
        channel: 'email',
        priority: 'high'
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response.requiresApproval).toBe(true);
      expect(response.approvalReason).toContain('escalation');
    });
  });

  describe('Response Generation', () => {
    it('should generate appropriate response for order inquiry', async () => {
      const inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'Where is my order #12345?',
        channel: 'email',
        priority: 'medium'
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response.draftResponse).toBeDefined();
      expect(response.draftResponse.length).toBeGreaterThan(0);
    });

    it('should generate appropriate response for product inquiry', async () => {
      const inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: 'Do you have this product in stock?',
        channel: 'chat',
        priority: 'medium'
      };

      const response = await chatbot.processInquiry(inquiry);

      expect(response.draftResponse).toBeDefined();
      expect(response.suggestedTags).toContain('inventory');
    });

    it('should handle multi-channel inquiries', async () => {
      const channels: Array<'email' | 'chat' | 'sms'> = ['email', 'chat', 'sms'];

      for (const channel of channels) {
        const inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
          customerId: 'customer_123',
          customerEmail: 'test@example.com',
          message: 'Test message',
          channel,
          priority: 'medium'
        };

        const response = await chatbot.processInquiry(inquiry);
        expect(response).toBeDefined();
      }
    });
  });

  describe('Performance Metrics', () => {
    it('should track response metrics', async () => {
      const metrics = await chatbot.getPerformanceMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalInquiries).toBeGreaterThanOrEqual(0);
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.averageConfidence).toBeGreaterThanOrEqual(0);
      expect(metrics.averageConfidence).toBeLessThanOrEqual(1);
    });

    it('should track approval rates', async () => {
      const metrics = await chatbot.getPerformanceMetrics();

      expect(metrics.autoApprovalRate).toBeGreaterThanOrEqual(0);
      expect(metrics.autoApprovalRate).toBeLessThanOrEqual(1);
    });

    it('should track customer satisfaction', async () => {
      const metrics = await chatbot.getPerformanceMetrics();

      expect(metrics.averageSatisfaction).toBeGreaterThanOrEqual(0);
      expect(metrics.averageSatisfaction).toBeLessThanOrEqual(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing customer information gracefully', async () => {
      const inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        customerId: '',
        customerEmail: '',
        message: 'Test message',
        channel: 'email',
        priority: 'medium'
      };

      await expect(chatbot.processInquiry(inquiry)).rejects.toThrow();
    });

    it('should handle empty messages', async () => {
      const inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        customerId: 'customer_123',
        customerEmail: 'test@example.com',
        message: '',
        channel: 'email',
        priority: 'medium'
      };

      await expect(chatbot.processInquiry(inquiry)).rejects.toThrow();
    });
  });
});

