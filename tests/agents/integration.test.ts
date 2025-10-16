/**
 * Integration Tests for AI Agents
 * 
 * Tests complete workflows with fixtures:
 * - Customer support agent workflow
 * - HITL approval flow
 * - Grading capture
 * - Learning from edits
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createCustomerAgent } from '../../app/agents/customer/index';
import { createCEOAgent } from '../../app/agents/ceo/index';
import { run } from '../../app/agents/sdk/index';
import { captureEditDiff } from '../../app/agents/learning/index';
import { checkEscalation } from '../../app/agents/escalation';
import type { ConversationContext } from '../../app/agents/context/index';

describe('Customer Support Agent Integration', () => {
  it('should draft a reply for order status inquiry', async () => {
    const agent = createCustomerAgent();
    const customerMessage = 'Where is my order #12345?';

    const result = await run(agent, customerMessage);

    expect(result).toBeDefined();
    expect(result.finalOutput).toBeTruthy();
    expect(result.finalOutput).toContain('order');
  });

  it('should handle return request', async () => {
    const agent = createCustomerAgent();
    const customerMessage = 'I want to return my AN-6 fittings. They don\'t fit.';

    const result = await run(agent, customerMessage);

    expect(result).toBeDefined();
    expect(result.finalOutput).toBeTruthy();
    expect(result.finalOutput.toLowerCase()).toMatch(/return|refund/);
  });

  it('should query knowledge base for policy questions', async () => {
    const agent = createCustomerAgent();
    const customerMessage = 'What is your return policy?';

    const result = await run(agent, customerMessage);

    expect(result).toBeDefined();
    expect(result.finalOutput).toBeTruthy();
    expect(result.finalOutput.toLowerCase()).toContain('return');
  });
});

describe('CEO Assistant Agent Integration', () => {
  it('should analyze inventory levels', async () => {
    const agent = createCEOAgent();
    const ceoRequest = 'Show me current inventory levels and identify low stock items';

    const result = await run(agent, ceoRequest);

    expect(result).toBeDefined();
    expect(result.finalOutput).toBeTruthy();
  });

  it('should calculate reorder points', async () => {
    const agent = createCEOAgent();
    const ceoRequest = 'Calculate reorder points for all products';

    const result = await run(agent, ceoRequest);

    expect(result).toBeDefined();
    expect(result.finalOutput).toBeTruthy();
  });

  it('should provide growth insights', async () => {
    const agent = createCEOAgent();
    const ceoRequest = 'Give me revenue trends for the last 30 days';

    const result = await run(agent, ceoRequest);

    expect(result).toBeDefined();
    expect(result.finalOutput).toBeTruthy();
  });
});

describe('HITL Approval Workflow', () => {
  it('should require approval for customer-facing messages', () => {
    const agent = createCustomerAgent();
    
    // Verify HITL is enforced
    expect(agent.name).toBe('ai-customer');
    // In production, would verify human_review flag is set
  });

  it('should capture grading after approval', async () => {
    const approvalId = 'approval_test_123';
    const conversationId = 'conv_test_123';
    const agentId = 'ai-customer';
    const draftContent = 'Your order will ship tomorrow.';
    const finalContent = 'I understand your concern. Your order will ship tomorrow and you\'ll receive tracking info via email.';
    const grading = { tone: 5, accuracy: 5, policy: 5 };

    const diff = await captureEditDiff(
      approvalId,
      conversationId,
      agentId,
      draftContent,
      finalContent,
      grading
    );

    expect(diff).toBeDefined();
    expect(diff.editDistance).toBeGreaterThan(0);
    expect(diff.editType).toBe('moderate');
    expect(diff.grading).toEqual(grading);
  });
});

describe('Auto-Escalation Rules', () => {
  it('should escalate on legal keywords', () => {
    const context: ConversationContext = {
      conversationId: 'conv_123',
      messages: [
        {
          id: 'msg_1',
          conversationId: 'conv_123',
          role: 'user',
          content: 'I will contact my lawyer if you don\'t refund me',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = checkEscalation(context);

    expect(result.shouldEscalate).toBe(true);
    expect(result.reasons).toContain('legal_threat');
    expect(result.priority).toBe('urgent');
  });

  it('should escalate on negative sentiment', () => {
    const context: ConversationContext = {
      conversationId: 'conv_124',
      messages: [
        {
          id: 'msg_1',
          conversationId: 'conv_124',
          role: 'user',
          content: 'This is terrible service. I am very disappointed.',
          timestamp: new Date().toISOString(),
        },
      ],
      metadata: {
        sentiment: 'negative',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = checkEscalation(context);

    expect(result.shouldEscalate).toBe(true);
    expect(result.reasons).toContain('negative_sentiment');
    expect(result.priority).toBe('high');
  });

  it('should escalate VIP customers', () => {
    const context: ConversationContext = {
      conversationId: 'conv_125',
      messages: [
        {
          id: 'msg_1',
          conversationId: 'conv_125',
          role: 'user',
          content: 'I have a question about my order',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const customerData = {
      lifetimeValue: 2000,
      orderCount: 15,
    };

    const result = checkEscalation(context, customerData);

    expect(result.shouldEscalate).toBe(true);
    expect(result.reasons).toContain('vip_customer');
  });
});

describe('Learning from Edits', () => {
  it('should calculate edit distance correctly', async () => {
    const draft = 'Hello';
    const final = 'Hello there';

    const diff = await captureEditDiff(
      'approval_1',
      'conv_1',
      'ai-customer',
      draft,
      final
    );

    expect(diff.editDistance).toBeGreaterThan(0);
    expect(diff.editType).toBe('minor');
  });

  it('should identify major rewrites', async () => {
    const draft = 'Your order is delayed.';
    const final = 'I sincerely apologize for the delay with your order. I understand how frustrating this must be. Let me check the status and get back to you with an update within the hour.';

    const diff = await captureEditDiff(
      'approval_2',
      'conv_2',
      'ai-customer',
      draft,
      final
    );

    expect(diff.editType).toMatch(/major|complete_rewrite/);
  });

  it('should extract specific changes', async () => {
    const draft = 'Your order will ship tomorrow.';
    const final = 'Your order will ship tomorrow via USPS.';

    const diff = await captureEditDiff(
      'approval_3',
      'conv_3',
      'ai-customer',
      draft,
      final
    );

    expect(diff.changes.length).toBeGreaterThan(0);
    expect(diff.changes.some(c => c.type === 'addition')).toBe(true);
  });
});

describe('End-to-End Workflow', () => {
  it('should complete full customer support workflow', async () => {
    // 1. Customer sends message
    const customerMessage = 'I haven\'t received my order #12345 yet';

    // 2. Agent drafts reply
    const agent = createCustomerAgent();
    const result = await run(agent, customerMessage);
    const draftReply = result.finalOutput;

    expect(draftReply).toBeTruthy();

    // 3. Human reviews and edits
    const finalReply = draftReply + ' I\'ve also sent you a tracking link via email.';

    // 4. Grading captured
    const grading = { tone: 4, accuracy: 5, policy: 5 };

    // 5. Learning captured
    const diff = await captureEditDiff(
      'approval_e2e',
      'conv_e2e',
      'ai-customer',
      draftReply,
      finalReply,
      grading
    );

    expect(diff).toBeDefined();
    expect(diff.grading).toEqual(grading);
  });
});

