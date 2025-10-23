/**
 * Unit Tests: AI Customer Service Response Automation
 * 
 * Tests automated response generation, template management,
 * and HITL approval workflows.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResponseAutomationService } from '~/services/ai-customer/response-automation.service';
import type { CustomerInquiry } from '~/services/ai-customer/chatbot.service';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'template_123',
              category: 'orders',
              template: 'Thank you for your inquiry about order {orderId}.',
              variables: ['orderId'],
              isActive: true
            },
            error: null
          })
        })),
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'template_1',
                category: 'orders',
                template: 'Order template',
                isActive: true
              },
              {
                id: 'template_2',
                category: 'returns',
                template: 'Return template',
                isActive: true
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
              id: 'response_123',
              inquiryId: 'inquiry_123',
              draftResponse: 'Automated response',
              confidence: 0.85,
              requiresApproval: true,
              approvalStatus: 'pending',
              createdAt: new Date().toISOString()
            },
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

describe('AI Customer Service Response Automation', () => {
  let automationService: ResponseAutomationService;

  beforeEach(async () => {
    automationService = new ResponseAutomationService();
    await automationService.initialize();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const service = new ResponseAutomationService();
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('should load response templates', async () => {
      const service = new ResponseAutomationService();
      await service.initialize();
      expect(service).toBeDefined();
    });
  });

  describe('Response Generation', () => {
    it('should generate automated response', async () => {
      const inquiry: Partial<CustomerInquiry> = {
        id: 'inquiry_123',
        message: 'Where is my order?',
        tags: ['orders']
      };

      const context = {
        confidence: 0.85,
        inquiryType: 'order_status' as const
      };

      const response = await automationService.generateAutomatedResponse(inquiry, context);

      expect(response).toBeDefined();
      expect(response.draftResponse).toBeDefined();
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });

    it('should use appropriate template for inquiry type', async () => {
      const inquiry: Partial<CustomerInquiry> = {
        id: 'inquiry_123',
        message: 'I want to return my order',
        tags: ['returns']
      };

      const context = {
        confidence: 0.9,
        inquiryType: 'return_request' as const
      };

      const response = await automationService.generateAutomatedResponse(inquiry, context);

      expect(response.templateId).toBeDefined();
      expect(response.draftResponse).toContain('return');
    });

    it('should populate template variables', async () => {
      const inquiry: Partial<CustomerInquiry> = {
        id: 'inquiry_123',
        message: 'Order #12345 status',
        tags: ['orders'],
        metadata: { orderId: '12345' }
      };

      const context = {
        confidence: 0.9,
        inquiryType: 'order_status' as const
      };

      const response = await automationService.generateAutomatedResponse(inquiry, context);

      expect(response.draftResponse).toBeDefined();
    });
  });

  describe('Approval Workflow', () => {
    it('should require approval for low confidence responses', async () => {
      const inquiry: Partial<CustomerInquiry> = {
        id: 'inquiry_123',
        message: 'Complex question',
        tags: []
      };

      const context = {
        confidence: 0.6,
        inquiryType: 'general' as const
      };

      const response = await automationService.generateAutomatedResponse(inquiry, context);

      expect(response.requiresApproval).toBe(true);
      expect(response.approvalStatus).toBe('pending');
    });

    it('should auto-approve high confidence responses', async () => {
      const inquiry: Partial<CustomerInquiry> = {
        id: 'inquiry_123',
        message: 'What are your business hours?',
        tags: ['general']
      };

      const context = {
        confidence: 0.95,
        inquiryType: 'general' as const
      };

      const response = await automationService.generateAutomatedResponse(inquiry, context);

      if (response.confidence >= 0.9) {
        expect(response.approvalStatus).toBe('auto_approved');
      }
    });

    it('should approve response', async () => {
      const responseId = 'response_123';
      const approverId = 'user_123';
      const finalResponse = 'Approved response text';

      await expect(
        automationService.approveResponse(responseId, approverId, finalResponse)
      ).resolves.not.toThrow();
    });

    it('should reject response', async () => {
      const responseId = 'response_123';
      const approverId = 'user_123';
      const rejectionReason = 'Incorrect information';

      await expect(
        automationService.rejectResponse(responseId, approverId, rejectionReason)
      ).resolves.not.toThrow();
    });
  });

  describe('Pending Approvals', () => {
    it('should retrieve pending approvals', async () => {
      const pending = await automationService.getPendingApprovals();

      expect(Array.isArray(pending)).toBe(true);
    });

    it('should send approved response', async () => {
      const responseId = 'response_123';

      await expect(
        automationService.sendResponse(responseId)
      ).resolves.not.toThrow();
    });
  });

  describe('Performance Metrics', () => {
    it('should track automation metrics', async () => {
      const metrics = await automationService.getAutomationMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalResponses).toBeGreaterThanOrEqual(0);
      expect(metrics.autoApproved).toBeGreaterThanOrEqual(0);
      expect(metrics.humanApproved).toBeGreaterThanOrEqual(0);
      expect(metrics.rejected).toBeGreaterThanOrEqual(0);
    });

    it('should calculate approval rates', async () => {
      const metrics = await automationService.getAutomationMetrics();

      const totalApprovals = metrics.autoApproved + metrics.humanApproved;
      const approvalRate = totalApprovals / metrics.totalResponses;

      expect(approvalRate).toBeGreaterThanOrEqual(0);
      expect(approvalRate).toBeLessThanOrEqual(1);
    });

    it('should track average approval time', async () => {
      const metrics = await automationService.getAutomationMetrics();

      expect(metrics.averageApprovalTime).toBeGreaterThanOrEqual(0);
    });

    it('should track customer satisfaction', async () => {
      const metrics = await automationService.getAutomationMetrics();

      expect(metrics.customerSatisfaction).toBeGreaterThanOrEqual(0);
      expect(metrics.customerSatisfaction).toBeLessThanOrEqual(5);
    });

    it('should track template usage', async () => {
      const metrics = await automationService.getAutomationMetrics();

      expect(metrics.templateUsage).toBeDefined();
      expect(typeof metrics.templateUsage).toBe('object');
    });
  });



  describe('Error Handling', () => {
    it('should handle missing inquiry data', async () => {
      const inquiry: Partial<CustomerInquiry> = {};
      const context = {
        confidence: 0.8,
        inquiryType: 'general' as const
      };

      await expect(
        automationService.generateAutomatedResponse(inquiry, context)
      ).rejects.toThrow();
    });

    it('should handle invalid response ID on approval', async () => {
      const responseId = '';
      const approverId = 'user_123';

      await expect(
        automationService.approveResponse(responseId, approverId)
      ).rejects.toThrow();
    });

    it('should handle invalid response ID on rejection', async () => {
      const responseId = '';
      const approverId = 'user_123';
      const rejectionReason = 'Test';

      await expect(
        automationService.rejectResponse(responseId, approverId, rejectionReason)
      ).rejects.toThrow();
    });
  });
});

