import { Agent, tool } from '@openai/agents';
import { z } from 'zod';
import { answerFromDocs } from '../tools/rag.js';
import { shopifyFindOrders, shopifyCancelOrder } from '../tools/shopify.js';
import { cwCreatePrivateNote, cwSendPublicReply } from '../tools/chatwoot.js';

/**
 * Intent classification tool for the triage agent.
 * Helps categorize customer requests for proper routing.
 */
const setIntent = tool({
  name: 'set_intent',
  description: 'Classify the user message into a high-level intent bucket.',
  parameters: z.object({
    intent: z.enum([
      'order_status',
      'refund',
      'cancel',
      'exchange',
      'product_question',
      'shipping',
      'other',
    ]).describe('The classified intent of the customer message'),
  }),
  async execute({ intent }) {
    return { intent };
  },
});

/**
 * Order Support Agent
 * 
 * Handles order-related requests: status checks, returns, exchanges, cancellations.
 * Always checks order status first before proposing actions.
 * Never sends public replies without approval.
 */
export const orderSupportAgent = new Agent({
  name: 'Order Support',
  instructions: [
    'You help with order status, returns, exchanges, and cancellations.',
    'Prefer read-only checks first (shopify_find_orders).',
    'If a mutation is required (cancel/refund), propose a clear private note explaining steps and risks.',
    'Do NOT send anything to the customer directly; use private notes and wait for approval.',
    'Always be empathetic and reference relevant policies from answer_from_docs.',
  ].join('\n'),
  tools: [
    answerFromDocs,
    shopifyFindOrders,
    shopifyCancelOrder,
    cwCreatePrivateNote,
    cwSendPublicReply,
  ],
});

/**
 * Product Q&A Agent
 * 
 * Answers product questions based on internal docs/FAQs/spec sheets.
 * If missing info, requests human input via private note.
 * No public replies without approval.
 */
export const productQAAgent = new Agent({
  name: 'Product Q&A',
  instructions: [
    'You answer product questions based on internal docs/FAQs/spec sheets via answer_from_docs.',
    'Be factual and cite sources when possible.',
    'If missing info, propose a private note requesting human input.',
    'No public replies without approval.',
  ].join('\n'),
  tools: [answerFromDocs, cwCreatePrivateNote, cwSendPublicReply],
});

/**
 * Triage Agent
 * 
 * First point of contact - classifies intent and routes to specialist agents.
 * Decides whether conversation is about orders or product questions.
 * Hands off to appropriate specialist for handling.
 */
export const triageAgent = new Agent({
  name: 'Triage',
  instructions: [
    'Decide whether the conversation is about orders or product questions.',
    'If order-related (status, cancel, refund, exchange), hand off to Order Support.',
    'If product knowledge (features, specs, compatibility), hand off to Product Q&A.',
    'Use set_intent to record your classification; include it in private notes.',
    'If unclear, create a private note requesting clarification.',
  ].join('\n'),
  tools: [setIntent, cwCreatePrivateNote],
  handoffs: [orderSupportAgent, productQAAgent],
});

