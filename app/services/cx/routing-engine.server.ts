import type { Intent } from "./intent-classifier.server";
import { logger } from "../../utils/logger.server";

export type RoutingDestination = "auto_respond" | "operator_queue" | "escalation" | "technical_specialist";

export interface RoutingRule {
  id: string;
  name: string;
  condition: (ticket: RoutingContext) => boolean;
  destination: RoutingDestination;
  priority: number; // Lower = higher priority
  enabled: boolean;
}

export interface RoutingContext {
  conversationId: number;
  intent: Intent;
  customerMessage: string;
  hasOrderNumber: boolean;
  isVip: boolean;
  conversationAge: number; // milliseconds
  messageCount: number;
}

export interface RoutingDecision {
  destination: RoutingDestination;
  rule: string;
  priority: number;
  reason: string;
}

/**
 * Intelligent Routing System
 * 
 * Routes tickets to appropriate destination based on intent, sentiment, and context
 */
export class RoutingEngine {
  private rules: RoutingRule[];

  constructor() {
    this.rules = this.initializeDefaultRules();
  }

  /**
   * Route ticket to appropriate destination
   */
  route(context: RoutingContext): RoutingDecision {
    logger.debug("Routing ticket", {
      conversationId: context.conversationId,
      intent: context.intent.category,
      confidence: context.intent.confidence,
      sentiment: context.intent.sentiment,
    });

    // Find first matching rule (sorted by priority)
    const matchingRule = this.rules
      .filter((rule) => rule.enabled)
      .sort((a, b) => a.priority - b.priority)
      .find((rule) => rule.condition(context));

    if (!matchingRule) {
      // Fallback: route to operator queue
      return {
        destination: "operator_queue",
        rule: "default_fallback",
        priority: 999,
        reason: "No matching routing rule found",
      };
    }

    const decision: RoutingDecision = {
      destination: matchingRule.destination,
      rule: matchingRule.id,
      priority: matchingRule.priority,
      reason: matchingRule.name,
    };

    logger.info("Routing decision made", {
      conversationId: context.conversationId,
      ...decision,
    });

    return decision;
  }

  /**
   * Initialize default routing rules
   */
  private initializeDefaultRules(): RoutingRule[] {
    return [
      // Priority 0: Critical escalations (complaints, legal threats)
      {
        id: "escalate_complaint",
        name: "Complaint or negative sentiment detected",
        condition: (t) =>
          t.intent.category === "complaint" || t.intent.sentiment === "negative",
        destination: "escalation",
        priority: 0,
        enabled: true,
      },
      {
        id: "escalate_legal",
        name: "Legal threat detected",
        condition: (t) =>
          /(lawsuit|attorney|lawyer|sue)/i.test(t.customerMessage),
        destination: "escalation",
        priority: 0,
        enabled: true,
      },

      // Priority 1: VIP customers
      {
        id: "vip_priority",
        name: "VIP customer - priority queue",
        condition: (t) => t.isVip,
        destination: "operator_queue",
        priority: 1,
        enabled: true,
      },

      // Priority 2: Technical questions to specialist
      {
        id: "technical_specialist",
        name: "Complex technical question",
        condition: (t) =>
          t.intent.category === "technical" ||
          (t.intent.category === "product_fit" && t.intent.confidence < 0.7),
        destination: "technical_specialist",
        priority: 2,
        enabled: true,
      },

      // Priority 3: High confidence auto-response candidates
      {
        id: "auto_respond_order_status",
        name: "Order status with order number - auto-respond",
        condition: (t) =>
          t.intent.category === "order_status" &&
          t.hasOrderNumber &&
          t.intent.confidence >= 0.85 &&
          t.intent.sentiment !== "negative",
        destination: "auto_respond",
        priority: 3,
        enabled: true,
      },
      {
        id: "auto_respond_shipping",
        name: "Shipping info - auto-respond",
        condition: (t) =>
          t.intent.category === "shipping_info" &&
          t.intent.confidence >= 0.85 &&
          t.intent.sentiment !== "negative",
        destination: "auto_respond",
        priority: 3,
        enabled: true,
      },
      {
        id: "auto_respond_returns",
        name: "Return policy - auto-respond",
        condition: (t) =>
          t.intent.category === "return_policy" &&
          t.intent.confidence >= 0.85 &&
          t.intent.sentiment !== "negative",
        destination: "auto_respond",
        priority: 3,
        enabled: true,
      },
      {
        id: "auto_respond_faq",
        name: "FAQ - auto-respond",
        condition: (t) =>
          t.intent.category === "faq" &&
          t.intent.confidence >= 0.85 &&
          t.intent.sentiment !== "negative",
        destination: "auto_respond",
        priority: 3,
        enabled: true,
      },

      // Priority 4: Medium confidence - operator review
      {
        id: "operator_medium_confidence",
        name: "Medium confidence - operator review",
        condition: (t) =>
          t.intent.confidence >= 0.6 &&
          t.intent.confidence < 0.85 &&
          t.intent.sentiment !== "negative",
        destination: "operator_queue",
        priority: 4,
        enabled: true,
      },

      // Priority 5: Low confidence or unclear - operator queue
      {
        id: "operator_low_confidence",
        name: "Low confidence or unclear intent",
        condition: (t) => t.intent.confidence < 0.6,
        destination: "operator_queue",
        priority: 5,
        enabled: true,
      },

      // Priority 6: Urgent requests
      {
        id: "urgent_to_operator",
        name: "Urgent request - fast queue",
        condition: (t) => t.intent.urgency === "high",
        destination: "operator_queue",
        priority: 1, // High priority in operator queue
        enabled: true,
      },
    ];
  }

  /**
   * Get all routing rules (for configuration UI)
   */
  getRules(): RoutingRule[] {
    return [...this.rules];
  }

  /**
   * Update routing rule
   */
  updateRule(ruleId: string, updates: Partial<RoutingRule>): boolean {
    const ruleIndex = this.rules.findIndex((r) => r.id === ruleId);
    if (ruleIndex === -1) return false;

    this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    return true;
  }

  /**
   * Add new routing rule
   */
  addRule(rule: RoutingRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove routing rule
   */
  removeRule(ruleId: string): boolean {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter((r) => r.id !== ruleId);
    return this.rules.length < initialLength;
  }
}

// Singleton instance
let routingEngineInstance: RoutingEngine | null = null;

/**
 * Get routing engine instance
 */
export function getRoutingEngine(): RoutingEngine {
  if (!routingEngineInstance) {
    routingEngineInstance = new RoutingEngine();
  }
  return routingEngineInstance;
}

/**
 * Route a ticket to appropriate destination
 */
export function routeTicket(context: RoutingContext): RoutingDecision {
  const engine = getRoutingEngine();
  return engine.route(context);
}

