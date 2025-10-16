/**
 * Customer Support Agent
 *
 * Drafts empathetic customer support replies for Chatwoot conversations.
 * All replies require HITL approval before sending.
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import { createAgent, verifyHITLEnforcement } from '../sdk/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Agent ID for customer support agent
 */
export const CUSTOMER_AGENT_ID = 'ai-customer';

/**
 * Load system prompt from file
 */
function loadSystemPrompt(): string {
  try {
    const promptPath = join(process.cwd(), 'app/prompts/agent-sdk/order-support-agent.md');
    return readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.warn('[Customer Agent] Could not load system prompt, using default');
    return `You are a helpful customer support agent for HotDash (hotrodan.com), an automotive parts company specializing in AN fittings and hot rod parts.

Your role:
- Draft empathetic, professional responses to customer inquiries
- Help with order status, returns, product questions
- Query knowledge base for accurate information
- NEVER send messages directly - all responses require human approval

Be concise, empathetic, and solution-oriented.`;
  }
}

/**
 * Tool: Find Shopify orders
 */
const shopifyFindOrdersTool = tool({
  name: 'shopify_find_orders',
  description: 'Search for Shopify orders by order number, customer email, or other criteria',
  parameters: z.object({
    query: z.string().describe('Search query (order number, email, etc.)'),
    limit: z.number().default(10).describe('Maximum number of results'),
  }),
  execute: async ({ query, limit }) => {
    const start = Date.now();
    console.log('[Tool] shopify_find_orders:', { query, limit });

    // TODO: Implement actual Shopify Admin GraphQL query
    const result = {
      orders: [
        {
          id: 'gid://shopify/Order/12345',
          name: '#12345',
          email: 'customer@example.com',
          financial_status: 'paid',
          fulfillment_status: 'fulfilled',
          created_at: '2025-10-10T10:00:00Z',
          total_price: '125.00',
        },
      ],
    } as const;

    const { logStructured } = await import('../sdk/index.js');
    logStructured('info', '[Tool] shopify_find_orders complete', {
      durationMs: Date.now() - start,
      results: result.orders.length,
    });
    return result;
  },
});

/**
 * Tool: Answer from knowledge base
 */
const answerFromDocsTool = tool({
  name: 'answer_from_docs',
  description: 'Query the knowledge base for answers to customer questions',
  parameters: z.object({
    question: z.string().describe('Customer question'),
    category: z.string().optional().describe('Category filter (returns, shipping, products)'),
  }),
  execute: async ({ question, category }) => {
    const start = Date.now();
    console.log('[Tool] answer_from_docs:', { question, category });

    // Try llamaindex MCP first
    let result: { answer: string; sources: { title: string; url: string }[] } | null = null;
    try {
      const { mcpQuery } = await import('../tools/llamaindex');
      const r = await mcpQuery(question);
      if (r && !r.error && (r.answer || r.data)) {
        const answer = r.answer || (Array.isArray(r.data) ? String(r.data[0]?.text || r.data[0]?.content || '') : '');
        const sources = Array.isArray(r.sources)
          ? r.sources.map((s: any) => ({ title: s.title || s.id || 'source', url: s.url || '#' }))
          : [];
        if (answer) {
          result = { answer, sources };
        }
      }
    } catch {}

    // Fallback stub
    if (!result) {
      result = {
        answer: 'Our return policy allows returns within 30 days of delivery. Items must be unworn with original tags.',
        sources: [{ title: 'Return Policy', url: 'https://hotrodan.com/policies/returns' }],
      };
    }

    const { logStructured } = await import('../sdk/index.js');
    logStructured('info', '[Tool] answer_from_docs complete', {
      durationMs: Date.now() - start,
      sources: result.sources.length,
    });
    return result;
  },
});

/**
 * Tool: Create Chatwoot private note
 */
const chatwootCreatePrivateNoteTool = tool({
  name: 'cw_create_private_note',
  description: 'Create a private note in Chatwoot (visible only to agents)',
  parameters: z.object({
    conversationId: z.string().describe('Chatwoot conversation ID'),
    content: z.string().describe('Note content'),
  }),
  execute: async ({ conversationId, content }) => {
    const start = Date.now();
    console.log('[Tool] cw_create_private_note:', { conversationId });

    // TODO: Implement actual Chatwoot API call
    const result = { success: true, noteId: `note_${Date.now()}` } as const;
    const { logStructured } = await import('../sdk/index.js');
    logStructured('info', '[Tool] cw_create_private_note complete', {
      conversationId,
      durationMs: Date.now() - start,
    });
    return result;
  },
});

/**
 * Tool: Send Chatwoot public reply (REQUIRES HITL APPROVAL)
 */
const chatwootSendPublicReplyTool = tool({
  name: 'cw_send_public_reply',
  description: 'Send a public reply to the customer in Chatwoot. REQUIRES HUMAN APPROVAL.',
  parameters: z.object({
    conversationId: z.string().describe('Chatwoot conversation ID'),
    content: z.string().describe('Reply content'),
    approvalId: z.string().describe('Approval ID from human reviewer'),
  }),
  execute: async ({ conversationId, content, approvalId }) => {
    const start = Date.now();
    console.log('[Tool] cw_send_public_reply:', { conversationId, approvalId });

    // Verify approval is approved before sending
    const { isApprovalApproved, logStructured } = await import('../sdk/index.js');
    const approved = await isApprovalApproved(approvalId);
    if (!approved) {
      logStructured('warn', '[Tool] cw_send_public_reply blocked - approval not approved', {
        conversationId,
        approvalId,
      });
      throw new Error('Approval not granted. Cannot send public reply.');
    }

    // TODO: Implement actual Chatwoot API call (server-side)
    const result = { success: true, messageId: `msg_${Date.now()}` } as const;

    logStructured('info', '[Tool] cw_send_public_reply complete', {
      conversationId,
      durationMs: Date.now() - start,
    });
    return result;
  },
});


/**
 * Create customer support agent instance
 */

export function createCustomerAgent() {
  // Verify HITL enforcement
  verifyHITLEnforcement(CUSTOMER_AGENT_ID);

  const systemPrompt = loadSystemPrompt();

  return createAgent(CUSTOMER_AGENT_ID, {
    instructions: systemPrompt,
    tools: [
      shopifyFindOrdersTool,
      answerFromDocsTool,
      chatwootCreatePrivateNoteTool,
      chatwootSendPublicReplyTool,
    ],
  });
}

/**
 * Start approval workflow for a generated draft (helper)
 */
export async function requestApprovalForDraft(
  conversationId: string,
  draftContent: string,
  evidence?: { queries?: string[]; samples?: unknown[]; diffs?: unknown[] }
) {
  const { createApprovalRequest } = await import('../sdk/index.js');
  const approval = await createApprovalRequest({
    agentId: CUSTOMER_AGENT_ID,
    conversationId,
    action: 'Send public reply',
    draftContent,
    evidence,
  });
  return approval;
}

/**
 * Handle customer support conversation
 */
export async function handleCustomerConversation(
  conversationId: string,
  customerMessage: string
): Promise<{
  conversationId: string;
  draft: string;
  requiresApproval: boolean;
}> {
  const agent = createCustomerAgent();

  // Import run function from SDK
  const { run } = await import('../sdk/index.js');

  // Run agent to generate draft response
  const result = await run(agent, customerMessage);

  // Triage: compute sentiment and priority for this message
  try {
    const ctxMod = await import('../context/index.js');
    const messages = [{ id: 'tmp', conversationId, role: 'user', content: customerMessage, timestamp: new Date().toISOString() }];
    const sentiment = ctxMod.detectSentiment(messages);
    const priority = ctxMod.calculatePriority(messages, sentiment);
    const { logStructured } = await import('../sdk/index.js');
    logStructured('info', '[Triage] Conversation triage', { conversationId, sentiment, priority });
  } catch {}

  // Simple policy checks on generated draft (caps/refund limits placeholder)
  try {
    const warnings: string[] = [];
    const lower = String(result.finalOutput || '').toLowerCase();
    if (lower.includes('full refund')) warnings.push('mentions_full_refund');
    if (lower.includes('discount')) warnings.push('mentions_discount');
    if (warnings.length) {
      const { logStructured } = await import('../sdk/index.js');
      logStructured('warn', '[Policy] Draft policy warnings', { conversationId, warnings });
    }
  } catch {}

  return {
    conversationId,
    draft: result.finalOutput || 'No response generated',
    requiresApproval: true,
  };
}

/**
 * Export tools for testing
 */
export {
  shopifyFindOrdersTool,
  answerFromDocsTool,
  chatwootCreatePrivateNoteTool,
  chatwootSendPublicReplyTool,
};

