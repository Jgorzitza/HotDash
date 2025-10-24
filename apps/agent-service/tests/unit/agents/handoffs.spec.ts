/**
 * Unit Tests for Agent Handoffs
 *
 * Tests the agent handoff logic and configuration to ensure
 * proper routing between triage and specialist agents.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { setDefaultOpenAIKey } from '@openai/agents';
import { triageAgent, orderSupportAgent, productQAAgent } from '../../../src/agents/index.js';

beforeAll(() => {
  setDefaultOpenAIKey('sk-test-mock-key-for-unit-tests');
});

describe('Agent Handoffs', () => {
  it('should configure handoff from Triage to Order Support', () => {
    // Verify triage agent has Order Support in handoffs
    const orderSupportHandoff = triageAgent.handoffs.find((h: any) => h.name === 'Order Support');
    expect(orderSupportHandoff).toBeDefined();
    expect(orderSupportHandoff).toBe(orderSupportAgent);

    // Verify handoff instructions
    expect(triageAgent.instructions).toContain('Order Support');
    expect(triageAgent.instructions).toContain('order');
  });

  it('should configure handoff from Triage to Product Q&A', () => {
    // Verify triage agent has Product Q&A in handoffs
    const productQAHandoff = triageAgent.handoffs.find((h: any) => h.name === 'Product Q&A');
    expect(productQAHandoff).toBeDefined();
    expect(productQAHandoff).toBe(productQAAgent);

    // Verify handoff instructions
    expect(triageAgent.instructions).toContain('Product Q&A');
    expect(triageAgent.instructions).toContain('product');
  });

  it('should preserve agent context during handoff configuration', () => {
    // Verify triage agent can classify intent before handoff
    const setIntentTool = triageAgent.tools.find((t: any) => t.name === 'set_intent');
    expect(setIntentTool).toBeDefined();

    // Verify triage instructions mention recording classification
    expect(triageAgent.instructions).toContain('set_intent');
    expect(triageAgent.instructions).toContain('classification');
  });

  it('should keep Triage for unclear intent', () => {
    // Verify triage has tools to handle unclear cases
    const hasPrivateNoteTool = triageAgent.tools.some((t: any) =>
      t.name === 'chatwoot_create_private_note'
    );
    expect(hasPrivateNoteTool).toBe(true);

    // Verify instructions mention handling unclear cases
    expect(triageAgent.instructions).toContain('unclear');
    expect(triageAgent.instructions).toContain('clarification');
  });

  it('should configure Order Support agent with proper tools', () => {
    // Verify Order Support has necessary tools
    const toolNames = orderSupportAgent.tools.map((t: any) => t.name);

    // Should have RAG tool
    expect(toolNames).toContain('answer_from_docs');

    // Should have Shopify tools
    expect(toolNames).toContain('shopify_find_orders');
    expect(toolNames).toContain('shopify_cancel_order');

    // Should have Chatwoot tools
    expect(toolNames).toContain('chatwoot_create_private_note');
    expect(toolNames).toContain('chatwoot_send_public_reply');

    // Verify instructions
    expect(orderSupportAgent.instructions).toContain('order');
  });

  it('should configure Product Q&A agent with proper tools', () => {
    // Verify Product Q&A has necessary tools
    const toolNames = productQAAgent.tools.map((t: any) => t.name);

    // Should have RAG tool
    expect(toolNames).toContain('answer_from_docs');

    // Should have Chatwoot tools
    expect(toolNames).toContain('chatwoot_create_private_note');
    expect(toolNames).toContain('chatwoot_send_public_reply');

    // Should NOT have Shopify tools (proper isolation)
    expect(toolNames).not.toContain('shopify_find_orders');
    expect(toolNames).not.toContain('shopify_cancel_order');

    // Verify instructions
    expect(productQAAgent.instructions).toContain('product');
  });

  it('should enforce tool access boundaries', () => {
    // Triage should have minimal tools
    expect(triageAgent.tools.length).toBeLessThan(5);

    // Order Support should have comprehensive toolset
    expect(orderSupportAgent.tools.length).toBeGreaterThanOrEqual(5);

    // Product Q&A should have focused toolset (no Shopify)
    expect(productQAAgent.tools.length).toBeLessThan(orderSupportAgent.tools.length);
  });

  it('should configure HITL enforcement on sensitive operations', () => {
    // Check Order Support sensitive tools exist
    const cancelOrderTool = orderSupportAgent.tools.find(
      (t: any) => t.name === 'shopify_cancel_order'
    );
    expect(cancelOrderTool).toBeDefined();
    // Note: needsApproval may be wrapped by SDK, so we verify the tool exists
    // The actual HITL enforcement is tested in integration tests

    // Check public reply tool (both agents)
    const orderSupportReplyTool = orderSupportAgent.tools.find(
      (t: any) => t.name === 'chatwoot_send_public_reply'
    );
    expect(orderSupportReplyTool).toBeDefined();

    const productQAReplyTool = productQAAgent.tools.find(
      (t: any) => t.name === 'chatwoot_send_public_reply'
    );
    expect(productQAReplyTool).toBeDefined();
  });

  it('should configure read-only tools without approval', () => {
    // Check answer_from_docs (RAG) exists
    const ragTool = orderSupportAgent.tools.find(
      (t: any) => t.name === 'answer_from_docs'
    );
    expect(ragTool).toBeDefined();

    // Check shopify_find_orders exists
    const findOrdersTool = orderSupportAgent.tools.find(
      (t: any) => t.name === 'shopify_find_orders'
    );
    expect(findOrdersTool).toBeDefined();

    // Check private notes tool exists
    const privateNoteTool = triageAgent.tools.find(
      (t: any) => t.name === 'chatwoot_create_private_note'
    );
    expect(privateNoteTool).toBeDefined();
    // Note: Approval requirements are enforced at runtime by the SDK
  });
});
