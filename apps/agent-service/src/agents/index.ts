import { Agent, tool } from '@openai/agents';
import { z } from 'zod';
import { answerFromDocs } from '../tools/rag.js';
import { shopifyFindOrders, shopifyCancelOrder } from '../tools/shopify.js';
import { cwCreatePrivateNote, cwSendPublicReply } from '../tools/chatwoot.js';
import {
  trackShipment,
  estimateDelivery,
  validateAddress,
  getShippingMethods
} from '../tools/shipping.js';
import {
  searchTroubleshooting,
  checkWarranty,
  createRepairTicket,
  getSetupGuide
} from '../tools/technical.js';
import {
  getCustomerOrders,
  getOrderDetails,
  getAccountInfo,
  updatePreferences,
  getAccountsMetrics
} from '../tools/accounts.js';

/**
 * Intent classification tool for the triage agent.
 * Enhanced with more granular intents and confidence scoring.
 */
const setIntent = tool({
  name: 'set_intent',
  description: 'Classify the user message into a high-level intent bucket with confidence.',
  parameters: z.object({
    intent: z.enum([
      // Order-related
      'order_status',
      'order_cancel',
      'order_refund',
      'order_exchange',
      'order_modify',
      // Shipping-related
      'shipping_tracking',
      'shipping_delay',
      'shipping_methods',
      'shipping_cost',
      'shipping_address',
      // Product-related
      'product_info',
      'product_specs',
      'product_compatibility',
      'product_availability',
      // Technical support
      'technical_setup',
      'technical_troubleshoot',
      'technical_warranty',
      'technical_repair',
      // Account & general
      'account_management',
      'billing_inquiry',
      'feedback',
      'complaint',
      'other',
    ]).describe('The classified intent of the customer message'),
    confidence: z.number().min(0).max(1).nullable().default(null).describe('Confidence score 0-1'),
  }),
  async execute({ intent, confidence }) {
    return {
      intent,
      confidence: confidence || 0.9,
      timestamp: new Date().toISOString()
    };
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
 * Shipping Support Agent
 *
 * Handles all shipping-related inquiries: tracking, delivery estimates, shipping methods.
 * Provides tracking information and helps with shipping issues.
 * Never sends public replies without approval.
 */
export const shippingSupportAgent = new Agent({
  name: 'Shipping Support',
  instructions: [
    'You are a shipping specialist helping customers with delivery and tracking.',
    'Handle tracking inquiries, delivery estimates, and shipping method questions.',
    'Always check order status first using shopify_find_orders.',
    'Use track_shipment to get detailed tracking information.',
    'Use estimate_delivery for delivery time estimates.',
    'Reference shipping policies from answer_from_docs when needed.',
    'For address changes after shipment, escalate to Order Support.',
    'Do NOT send anything to the customer directly; use private notes and wait for approval.',
    'Be proactive about delivery delays and provide carrier contact info.',
  ].join('\n'),
  tools: [
    answerFromDocs,
    shopifyFindOrders,
    trackShipment,
    estimateDelivery,
    validateAddress,
    getShippingMethods,
    cwCreatePrivateNote,
    cwSendPublicReply,
  ],
});

/**
 * Technical Support Agent
 *
 * Handles product setup, troubleshooting, and warranty claims.
 * Provides technical guidance and creates repair tickets when needed.
 * Never sends public replies without approval.
 */
export const technicalSupportAgent = new Agent({
  name: 'Technical Support',
  instructions: [
    'You are a technical support specialist helping customers with product issues.',
    'Guide customers through product setup and troubleshooting.',
    'Use search_troubleshooting to find relevant guides.',
    'Use get_setup_guide for product setup instructions.',
    'Check warranty status with check_warranty before suggesting repairs.',
    'Create repair tickets with create_repair_ticket when needed (requires approval).',
    'Reference technical documentation from answer_from_docs.',
    'Start with basic troubleshooting before escalating.',
    'Do NOT send anything to the customer directly; use private notes and wait for approval.',
    'Document all troubleshooting steps in private notes.',
  ].join('\n'),
  tools: [
    answerFromDocs,
    searchTroubleshooting,
    checkWarranty,
    createRepairTicket,
    getSetupGuide,
    cwCreatePrivateNote,
    cwSendPublicReply,
  ],
});

/**
 * Customer Accounts Agent
 *
 * Handles authenticated customer account requests using Customer Accounts MCP.
 * This is the ONLY agent allowed to call Customer Accounts MCP with OAuth tokens.
 * Implements ABAC security for PII access.
 *
 * SECURITY:
 * - Requires OAuth token from authenticated customer session
 * - ABAC policy enforcement for all operations
 * - PII redaction in audit logs
 * - Never sends public replies without approval
 */
export const customerAccountsAgent = new Agent({
  name: 'Customer Accounts',
  instructions: [
    'You help authenticated customers with their account and order information.',
    'You have access to Customer Accounts MCP with OAuth tokens.',
    'SECURITY REQUIREMENTS:',
    '- Always verify OAuth token is present before calling account tools',
    '- All operations are logged with ABAC approval',
    '- PII access is audited (email, phone, addresses)',
    '- Never expose raw OAuth tokens in responses',
    'CAPABILITIES:',
    '- Get customer order history (get_customer_orders)',
    '- Get specific order details (get_order_details)',
    '- Get account information (get_account_info) - PII WARNING',
    '- Update customer preferences (update_preferences) - requires approval',
    'WORKFLOW:',
    '1. Verify customer is authenticated (OAuth token present)',
    '2. Use appropriate tool for the request',
    '3. Create private note with results',
    '4. Wait for approval before sending to customer',
    'Do NOT send anything to the customer directly; use private notes and wait for approval.',
    'Reference account policies from answer_from_docs when needed.',
  ].join('\n'),
  tools: [
    answerFromDocs,
    getCustomerOrders,
    getOrderDetails,
    getAccountInfo,
    updatePreferences,
    getAccountsMetrics,
    cwCreatePrivateNote,
    cwSendPublicReply,
  ],
});

/**
 * Triage Agent
 *
 * First point of contact - classifies intent and routes to specialist agents.
 * Enhanced with more specialized routing options.
 * Hands off to appropriate specialist for handling.
 */
export const triageAgent = new Agent({
  name: 'Triage',
  instructions: [
    'Classify the customer inquiry and route to the appropriate specialist.',
    'Use set_intent to record your classification with confidence score.',
    'Routing rules:',
    '- Order-related (status, cancel, refund, exchange) → Order Support',
    '- Shipping-related (tracking, delivery, methods) → Shipping Support',
    '- Product questions (features, specs, compatibility) → Product Q&A',
    '- Technical issues (setup, troubleshooting, warranty) → Technical Support',
    '- Account management (authenticated customers) → Customer Accounts',
    'If confidence < 0.7 or unclear, create a private note requesting clarification.',
    'Include intent and confidence in your handoff message.',
  ].join('\n'),
  tools: [setIntent, cwCreatePrivateNote],
  handoffs: [orderSupportAgent, shippingSupportAgent, productQAAgent, technicalSupportAgent, customerAccountsAgent],
});

