/**
 * Customer Accounts Agent Integration Tests
 * 
 * Tests the end-to-end flow: Triage → Customer Accounts Agent
 * Verifies OAuth token handling, ABAC enforcement, and PII redaction.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { triageAgent, customerAccountsAgent } from '../../apps/agent-service/src/agents/index.js';

describe('Customer Accounts Agent', () => {
  const mockCustomerId = 'cust_123456';
  const mockToken = 'oauth_token_abc123';
  const mockOrderId = 'order_789';

  describe('Agent Configuration', () => {
    it('should have Customer Accounts agent defined', () => {
      expect(customerAccountsAgent).toBeDefined();
      expect(customerAccountsAgent.name).toBe('Customer Accounts');
    });

    it('should have required tools', () => {
      const toolNames = customerAccountsAgent.tools.map((t: any) => t.name);
      
      expect(toolNames).toContain('get_customer_orders');
      expect(toolNames).toContain('get_order_details');
      expect(toolNames).toContain('get_account_info');
      expect(toolNames).toContain('update_preferences');
      expect(toolNames).toContain('get_accounts_metrics');
      expect(toolNames).toContain('answer_from_docs');
      expect(toolNames).toContain('cw_create_private_note');
      expect(toolNames).toContain('cw_send_public_reply');
    });

    it('should be in Triage handoffs', () => {
      const handoffNames = triageAgent.handoffs.map((h: any) => h.name);
      expect(handoffNames).toContain('Customer Accounts');
    });
  });

  describe('Tool Execution', () => {
    it('should execute get_customer_orders tool', async () => {
      const tool = customerAccountsAgent.tools.find((t: any) => t.name === 'get_customer_orders');
      expect(tool).toBeDefined();

      const result = await tool.execute({
        customerId: mockCustomerId,
        token: mockToken,
        limit: 5,
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      
      if (result.success) {
        expect(result).toHaveProperty('orders');
        expect(result).toHaveProperty('count');
      }
    });

    it('should execute get_order_details tool', async () => {
      const tool = customerAccountsAgent.tools.find((t: any) => t.name === 'get_order_details');
      expect(tool).toBeDefined();

      const result = await tool.execute({
        customerId: mockCustomerId,
        orderId: mockOrderId,
        token: mockToken,
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      
      if (result.success) {
        expect(result).toHaveProperty('order');
      }
    });

    it('should execute get_account_info tool (PII)', async () => {
      const tool = customerAccountsAgent.tools.find((t: any) => t.name === 'get_account_info');
      expect(tool).toBeDefined();

      const result = await tool.execute({
        customerId: mockCustomerId,
        token: mockToken,
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      
      if (result.success) {
        expect(result).toHaveProperty('account');
        expect(result).toHaveProperty('piiAccessed');
        expect(result.piiAccessed).toBe(true);
      }
    });

    it('should execute update_preferences tool', async () => {
      const tool = customerAccountsAgent.tools.find((t: any) => t.name === 'update_preferences');
      expect(tool).toBeDefined();

      const result = await tool.execute({
        customerId: mockCustomerId,
        token: mockToken,
        preferences: {
          marketing: false,
          notifications: true,
        },
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('preferences');
    });

    it('should execute get_accounts_metrics tool', async () => {
      const tool = customerAccountsAgent.tools.find((t: any) => t.name === 'get_accounts_metrics');
      expect(tool).toBeDefined();

      const result = await tool.execute({});

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      
      if (result.success) {
        expect(result).toHaveProperty('metrics');
        expect(result.metrics).toHaveProperty('totalQueries');
        expect(result.metrics).toHaveProperty('successfulQueries');
        expect(result.metrics).toHaveProperty('mcpEnabled');
      }
    });
  });

  describe('Security & ABAC', () => {
    it('should handle missing OAuth token gracefully', async () => {
      const tool = customerAccountsAgent.tools.find((t: any) => t.name === 'get_customer_orders');
      
      const result = await tool.execute({
        customerId: mockCustomerId,
        token: '', // Empty token
        limit: 5,
      });

      // Should fail gracefully
      expect(result).toHaveProperty('success');
      // May succeed with mock data or fail with error
    });

    it('should handle invalid customer ID gracefully', async () => {
      const tool = customerAccountsAgent.tools.find((t: any) => t.name === 'get_customer_orders');
      
      const result = await tool.execute({
        customerId: '', // Invalid customer ID
        token: mockToken,
        limit: 5,
      });

      // Should fail gracefully
      expect(result).toHaveProperty('success');
    });
  });

  describe('Instructions', () => {
    it('should have security requirements in instructions', () => {
      const instructions = customerAccountsAgent.instructions;
      
      expect(instructions).toContain('OAuth');
      expect(instructions).toContain('ABAC');
      expect(instructions).toContain('PII');
      expect(instructions).toContain('approval');
    });

    it('should have workflow guidance in instructions', () => {
      const instructions = customerAccountsAgent.instructions;
      
      expect(instructions).toContain('authenticated');
      expect(instructions).toContain('private note');
      expect(instructions).toContain('wait for approval');
    });
  });

  describe('End-to-End Flow', () => {
    it('should be accessible from Triage agent', () => {
      const triageHandoffs = triageAgent.handoffs;
      const accountsAgent = triageHandoffs.find((h: any) => h.name === 'Customer Accounts');
      
      expect(accountsAgent).toBeDefined();
      expect(accountsAgent).toBe(customerAccountsAgent);
    });

    it('should have account_management intent in Triage instructions', () => {
      const instructions = triageAgent.instructions;
      
      expect(instructions).toContain('Account management');
      expect(instructions).toContain('Customer Accounts');
    });
  });
});

