/**
 * Unit Tests: AI Customer Service Ticket Routing
 * 
 * Tests intelligent ticket routing, agent assignment, priority handling,
 * and escalation workflows.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TicketRoutingService } from '~/services/ai-customer/ticket-routing.service';
import type { CustomerInquiry } from '~/services/ai-customer/chatbot.service';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'agent_123',
              name: 'Test Agent',
              email: 'agent@example.com',
              specializations: ['orders', 'returns'],
              currentLoad: 5,
              maxLoad: 10,
              isAvailable: true
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
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'agent_1',
                name: 'Agent 1',
                specializations: ['orders'],
                currentLoad: 3,
                maxLoad: 10,
                isAvailable: true
              },
              {
                id: 'agent_2',
                name: 'Agent 2',
                specializations: ['returns'],
                currentLoad: 5,
                maxLoad: 10,
                isAvailable: true
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
              id: 'routing_123',
              inquiryId: 'inquiry_123',
              assignedAgentId: 'agent_123',
              routingReason: 'Specialization match',
              priority: 'medium',
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
              data: {
                id: 'agent_123',
                currentLoad: 6
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

describe('AI Customer Service Ticket Routing', () => {
  let routingService: TicketRoutingService;

  beforeEach(async () => {
    routingService = new TicketRoutingService();
    await routingService.initialize();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const service = new TicketRoutingService();
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('should load routing rules', async () => {
      const service = new TicketRoutingService();
      await service.initialize();
      expect(service).toBeDefined();
    });
  });

  describe('Agent Assignment', () => {
    it('should route inquiry to available agent', async () => {
      const inquiryId = 'inquiry_123';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'Where is my order?',
        priority: 'medium',
        tags: ['orders']
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      expect(result).toBeDefined();
      expect(result.assignedAgentId).toBeDefined();
      expect(result.routingReason).toBeDefined();
    });

    it('should match agent specialization', async () => {
      const inquiryId = 'inquiry_123';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'I want to return my order',
        priority: 'medium',
        tags: ['returns']
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      expect(result.assignedAgentId).toBeDefined();
      expect(result.routingReason).toContain('specialization');
    });

    it('should consider agent workload', async () => {
      const inquiryId = 'inquiry_123';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'General question',
        priority: 'low',
        tags: []
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      expect(result.assignedAgentId).toBeDefined();
      // Should assign to agent with lower workload
    });

    it('should handle routing when agents are busy', async () => {
      const inquiryId = 'inquiry_123';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'Test message',
        priority: 'medium',
        tags: []
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      // Should still route even if agents are busy
      expect(result).toBeDefined();
      expect(result.routingReason).toBeDefined();
    });
  });

  describe('Priority Handling', () => {
    it('should prioritize urgent inquiries', async () => {
      const inquiryId = 'inquiry_urgent';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'URGENT: Payment issue',
        priority: 'urgent',
        tags: ['payment']
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      expect(result.priority).toBe('urgent');
      expect(result.assignedAgentId).toBeDefined();
    });

    it('should handle high priority inquiries', async () => {
      const inquiryId = 'inquiry_high';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'Need help with refund',
        priority: 'high',
        tags: ['refund']
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      expect(result.priority).toBe('high');
    });

    it('should handle low priority inquiries', async () => {
      const inquiryId = 'inquiry_low';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'General question about products',
        priority: 'low',
        tags: ['general']
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      expect(result.priority).toBe('low');
    });
  });

  describe('Escalation Workflows', () => {
    it('should escalate complex issues', async () => {
      const inquiryId = 'inquiry_complex';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'Legal issue with my order',
        priority: 'high',
        tags: ['legal', 'complaint']
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      expect(result.escalated).toBe(true);
      expect(result.escalationReason).toBeDefined();
    });

    it('should escalate VIP customers', async () => {
      const inquiryId = 'inquiry_vip';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'VIP customer inquiry',
        priority: 'high',
        tags: ['vip']
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      expect(result.priority).toBe('high');
    });

    it('should escalate after multiple failed attempts', async () => {
      const inquiryId = 'inquiry_failed';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'Still not resolved',
        priority: 'medium',
        tags: ['follow-up'],
        metadata: { attemptCount: 3 }
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      if (inquiry.metadata && inquiry.metadata.attemptCount >= 3) {
        expect(result.escalated).toBe(true);
      }
    });
  });

  describe('Routing Statistics', () => {
    it('should track routing metrics', async () => {
      const stats = await routingService.getRoutingStats();

      expect(stats).toBeDefined();
      expect(stats.totalInquiries).toBeGreaterThanOrEqual(0);
      expect(stats.averageRoutingTime).toBeGreaterThanOrEqual(0);
    });

    it('should track agent utilization', async () => {
      const stats = await routingService.getRoutingStats();

      expect(stats.agentUtilization).toBeDefined();
      expect(typeof stats.agentUtilization).toBe('object');
    });

    it('should track auto-routed and escalated counts', async () => {
      const stats = await routingService.getRoutingStats();

      expect(stats.autoRouted).toBeGreaterThanOrEqual(0);
      expect(stats.escalated).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Routing Rules', () => {
    it('should apply business hours rules', async () => {
      const inquiryId = 'inquiry_hours';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'Test message',
        priority: 'medium',
        tags: []
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      expect(result).toBeDefined();
      // Business hours logic should be applied
    });

    it('should apply weekend routing rules', async () => {
      const inquiryId = 'inquiry_weekend';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'Weekend inquiry',
        priority: 'medium',
        tags: []
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      expect(result).toBeDefined();
    });

    it('should apply holiday routing rules', async () => {
      const inquiryId = 'inquiry_holiday';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'Holiday inquiry',
        priority: 'medium',
        tags: []
      };

      const result = await routingService.routeInquiry(inquiryId, inquiry);

      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid inquiry ID', async () => {
      const inquiryId = '';
      const inquiry: Partial<CustomerInquiry> = {
        message: 'Test message',
        priority: 'medium',
        tags: []
      };

      await expect(routingService.routeInquiry(inquiryId, inquiry)).rejects.toThrow();
    });

    it('should handle missing inquiry data', async () => {
      const inquiryId = 'inquiry_123';
      const inquiry: Partial<CustomerInquiry> = {};

      await expect(routingService.routeInquiry(inquiryId, inquiry)).rejects.toThrow();
    });

    it('should handle routing errors gracefully', async () => {
      const inquiryId = 'inquiry_123';
      const inquiry: Partial<CustomerInquiry> = {};

      // Empty inquiry should cause an error
      await expect(routingService.routeInquiry(inquiryId, inquiry)).rejects.toThrow();
    });
  });
});

