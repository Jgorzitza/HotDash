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
}

export interface HandoffDecision {
  shouldHandoff: boolean;
  targetAgent?: string;
  reason?: string;
  confidence: number;
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
    // Check each rule in priority order
    for (const rule of this.rules) {
      if (rule.condition(context)) {
        console.log(`[Handoff] Rule triggered: ${rule.reason} -> ${rule.targetAgent}`);
        return {
          shouldHandoff: true,
          targetAgent: rule.targetAgent,
          reason: rule.reason,
          confidence: 0.9,
        };
      }
    }

    // No handoff needed
    return {
      shouldHandoff: false,
      confidence: 1.0,
    };
  }

  /**
   * Get recommended agent based on intent
   */
  getRecommendedAgent(intent: string): string | null {
    const intentToAgent: Record<string, string> = {
      'order_status': 'Order Support',
      'refund': 'Order Support',
      'cancel': 'Order Support',
      'exchange': 'Order Support',
      'product_question': 'Product Q&A',
      'shipping': 'Order Support',
      'tracking': 'Order Support',
      'product_info': 'Product Q&A',
      'product_specs': 'Product Q&A',
      'other': 'Triage',
    };

    return intentToAgent[intent] || null;
  }

  /**
   * Check if agent has required capabilities
   */
  hasCapability(agentName: string, capability: string): boolean {
    const agentCapabilities: Record<string, string[]> = {
      'Order Support': ['shopify_orders', 'cancel_orders', 'refunds', 'shipping'],
      'Product Q&A': ['product_info', 'documentation', 'specs'],
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
  });

  // Order-related intents -> Order Support
  handoffManager.addRule({
    priority: 80,
    condition: (ctx) => {
      const orderIntents = ['order_status', 'refund', 'cancel', 'exchange', 'shipping', 'tracking'];
      return orderIntents.includes(ctx.intent || '');
    },
    targetAgent: 'Order Support',
    reason: 'Order-related intent detected',
  });

  // Product questions -> Product Q&A
  handoffManager.addRule({
    priority: 80,
    condition: (ctx) => {
      const productIntents = ['product_question', 'product_info', 'product_specs'];
      return productIntents.includes(ctx.intent || '');
    },
    targetAgent: 'Product Q&A',
    reason: 'Product question detected',
  });

  // Customer mentions specific order ID -> Order Support
  handoffManager.addRule({
    priority: 90,
    condition: (ctx) => !!ctx.customer.orderId,
    targetAgent: 'Order Support',
    reason: 'Customer provided order ID',
  });

  // Negative sentiment + order context -> Order Support (priority)
  handoffManager.addRule({
    priority: 95,
    condition: (ctx) => ctx.sentiment === 'negative' && (ctx.intent?.includes('order') || false),
    targetAgent: 'Order Support',
    reason: 'Negative sentiment with order issue',
  });
}

// Export singleton instance
export const handoffManager = new HandoffManager();
createDefaultHandoffRules(handoffManager);

