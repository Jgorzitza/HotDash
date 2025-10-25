/**
 * Smart Handoff Manager
 * 
 * Manages intelligent agent handoffs based on conversation context,
 * intent classification, and agent capabilities.
 */

import type { Agent } from '@openai/agents';
import type { ConversationContext } from '../context/conversation-manager';

export interface HandoffRule {
  /** Rule priority (higher = checked first) */
  priority: number;
  /** Condition function to check if rule applies */
  condition: (context: ConversationContext) => boolean;
  /** Target agent to hand off to */
  targetAgent: string;
  /** Reason for handoff (for logging) */
  reason: string;
  /** Optional confidence calculator */
  confidenceCalculator?: (context: ConversationContext) => number;
  /** Optional fallback agent */
  fallbackAgent?: string;
  /** Optional human review requirement */
  requiresHumanReview?: (context: ConversationContext) => boolean;
}

export interface HandoffDecision {
  shouldHandoff: boolean;
  targetAgent?: string;
  reason?: string;
  confidence: number;
  // Enhanced decision metadata
  intentClassification?: {
    intent: string;
    confidence: number;
  };
  alternativeAgents?: Array<{
    agent: string;
    confidence: number;
  }>;
  requiresHumanReview: boolean;
  escalationReason?: string;
  metadata: {
    processingTimeMs: number;
    rulesEvaluated: number;
    contextFactors: string[];
  };
}

/**
 * Manages smart handoff decisions between agents
 */
export class HandoffManager {
  private rules: HandoffRule[] = [];

  /**
   * Register a handoff rule
   */
  addRule(rule: HandoffRule): void {
    this.rules.push(rule);
    // Sort by priority (highest first)
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Decide if handoff is needed based on context
   */
  decideHandoff(context: ConversationContext): HandoffDecision {
    const startTime = Date.now();
    let rulesEvaluated = 0;
    const contextFactors: string[] = [];

    // Track context factors
    if (context.intent) contextFactors.push(`intent:${context.intent}`);
    if (context.sentiment) contextFactors.push(`sentiment:${context.sentiment}`);
    if (context.urgency) contextFactors.push(`urgency:${context.urgency}`);
    if (context.customer.orderId) contextFactors.push('has_order_id');

    // Check each rule in priority order
    for (const rule of this.rules) {
      rulesEvaluated++;
      if (rule.condition(context)) {
        console.log(`[Handoff] Rule triggered: ${rule.reason} -> ${rule.targetAgent}`);

        // Calculate confidence
        const confidence = rule.confidenceCalculator
          ? rule.confidenceCalculator(context)
          : 0.9;

        // Check if human review required
        const requiresHumanReview = rule.requiresHumanReview
          ? rule.requiresHumanReview(context)
          : confidence < 0.5;

        const processingTimeMs = Date.now() - startTime;

        return {
          shouldHandoff: true,
          targetAgent: rule.targetAgent,
          reason: rule.reason,
          confidence,
          requiresHumanReview,
          escalationReason: requiresHumanReview ? 'Low confidence or policy requirement' : undefined,
          metadata: {
            processingTimeMs,
            rulesEvaluated,
            contextFactors,
          },
        };
      }
    }

    // No handoff needed
    const processingTimeMs = Date.now() - startTime;
    return {
      shouldHandoff: false,
      confidence: 1.0,
      requiresHumanReview: false,
      metadata: {
        processingTimeMs,
        rulesEvaluated,
        contextFactors,
      },
    };
  }

  /**
   * Get recommended agent based on intent
   */
  getRecommendedAgent(intent: string): string | null {
    const intentToAgent: Record<string, string> = {
      // Order-related
      'order_status': 'Order Support',
      'order_cancel': 'Order Support',
      'order_refund': 'Order Support',
      'order_exchange': 'Order Support',
      'order_modify': 'Order Support',
      // Shipping-related
      'shipping_tracking': 'Shipping Support',
      'shipping_delay': 'Shipping Support',
      'shipping_methods': 'Shipping Support',
      'shipping_cost': 'Shipping Support',
      'shipping_address': 'Shipping Support',
      // Product-related
      'product_info': 'Product Q&A',
      'product_specs': 'Product Q&A',
      'product_compatibility': 'Product Q&A',
      'product_availability': 'Product Q&A',
      // Technical support
      'technical_setup': 'Technical Support',
      'technical_troubleshoot': 'Technical Support',
      'technical_warranty': 'Technical Support',
      'technical_repair': 'Technical Support',
      // General
      'account_management': 'Order Support',
      'billing_inquiry': 'Order Support',
      'feedback': 'Triage',
      'complaint': 'Triage',
      'other': 'Triage',
    };

    return intentToAgent[intent] || null;
  }

  /**
   * Check if agent has required capabilities
   */
  hasCapability(agentName: string, capability: string): boolean {
    const agentCapabilities: Record<string, string[]> = {
      'Order Support': ['shopify_orders', 'cancel_orders', 'refunds', 'exchanges'],
      'Shipping Support': ['shipping_tracking', 'delivery_estimates', 'carrier_contact', 'shipping_methods'],
      'Product Q&A': ['product_info', 'documentation', 'specs', 'compatibility'],
      'Technical Support': ['technical_docs', 'troubleshooting', 'warranty_claims', 'product_setup'],
      'Triage': ['intent_classification', 'routing'],
    };

    const capabilities = agentCapabilities[agentName];
    if (!capabilities) {
      return false;
    }
    return capabilities.includes(capability);
  }
}

/**
 * Create default handoff rules
 */
export function createDefaultHandoffRules(handoffManager: HandoffManager): void {
  // High urgency orders -> Order Support
  handoffManager.addRule({
    priority: 100,
    condition: (ctx) => ctx.urgency === 'high' && (ctx.intent?.includes('order') || false),
    targetAgent: 'Order Support',
    reason: 'High urgency order issue',
    confidenceCalculator: (ctx) => ctx.customer.orderId ? 0.95 : 0.85,
  });

  // Shipping-related intents -> Shipping Support
  handoffManager.addRule({
    priority: 85,
    condition: (ctx) => {
      const shippingIntents = [
        'shipping_tracking',
        'shipping_delay',
        'shipping_methods',
        'shipping_cost',
        'shipping_address',
      ];
      return shippingIntents.includes(ctx.intent || '');
    },
    targetAgent: 'Shipping Support',
    reason: 'Shipping-related inquiry',
    confidenceCalculator: (ctx) => ctx.customer.orderId ? 0.95 : 0.80,
  });

  // Technical support intents -> Technical Support
  handoffManager.addRule({
    priority: 85,
    condition: (ctx) => {
      const techIntents = [
        'technical_setup',
        'technical_troubleshoot',
        'technical_warranty',
        'technical_repair',
      ];
      return techIntents.includes(ctx.intent || '');
    },
    targetAgent: 'Technical Support',
    reason: 'Technical support needed',
    confidenceCalculator: (ctx) => ctx.metadata.productId ? 0.90 : 0.70,
    requiresHumanReview: (ctx) => ctx.intent === 'technical_warranty',
  });

  // Order-related intents -> Order Support
  handoffManager.addRule({
    priority: 80,
    condition: (ctx) => {
      const orderIntents = [
        'order_status',
        'order_cancel',
        'order_refund',
        'order_exchange',
        'order_modify',
      ];
      return orderIntents.includes(ctx.intent || '');
    },
    targetAgent: 'Order Support',
    reason: 'Order-related intent detected',
    confidenceCalculator: (ctx) => ctx.customer.orderId ? 0.95 : 0.75,
  });

  // Product questions -> Product Q&A
  handoffManager.addRule({
    priority: 80,
    condition: (ctx) => {
      const productIntents = [
        'product_info',
        'product_specs',
        'product_compatibility',
        'product_availability',
      ];
      return productIntents.includes(ctx.intent || '');
    },
    targetAgent: 'Product Q&A',
    reason: 'Product question detected',
    confidenceCalculator: () => 0.85,
  });

  // Customer mentions specific order ID -> Order Support
  handoffManager.addRule({
    priority: 90,
    condition: (ctx) => !!ctx.customer.orderId && !ctx.intent?.includes('shipping'),
    targetAgent: 'Order Support',
    reason: 'Customer provided order ID',
    confidenceCalculator: () => 0.90,
  });

  // Negative sentiment + order context -> Order Support (priority)
  handoffManager.addRule({
    priority: 95,
    condition: (ctx) => ctx.sentiment === 'negative' && (ctx.intent?.includes('order') || false),
    targetAgent: 'Order Support',
    reason: 'Negative sentiment with order issue',
    confidenceCalculator: () => 0.95,
    requiresHumanReview: (ctx) => ctx.urgency === 'high',
  });

  // Complaint or feedback -> Triage (human review)
  handoffManager.addRule({
    priority: 90,
    condition: (ctx) => ['complaint', 'feedback'].includes(ctx.intent || ''),
    targetAgent: 'Triage',
    reason: 'Complaint or feedback requires human attention',
    confidenceCalculator: () => 0.80,
    requiresHumanReview: () => true,
  });
}

// Export singleton instance
export const handoffManager = new HandoffManager();
createDefaultHandoffRules(handoffManager);

