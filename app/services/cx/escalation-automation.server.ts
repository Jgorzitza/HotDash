import type { Intent } from "./intent-classifier.server";
import { logger } from "../../utils/logger.server";

export interface EscalationTrigger {
  id: string;
  name: string;
  condition: (context: EscalationContext) => boolean;
  assignTo: "senior_operator" | "manager" | "technical_specialist";
  alertLevel: "normal" | "urgent" | "critical";
  enabled: boolean;
}

export interface EscalationContext {
  conversationId: number;
  intent: Intent;
  customerMessage: string;
  messageCount: number;
  conversationAge: number; // milliseconds
  previousEscalations: number;
  customerLifetimeValue?: number;
  customerOrderCount?: number;
}

export interface EscalationResult {
  shouldEscalate: boolean;
  assignTo?: "senior_operator" | "manager" | "technical_specialist";
  alertLevel?: "normal" | "urgent" | "critical";
  reason: string;
  triggerId?: string;
}

/**
 * Escalation Automation System
 * 
 * Automatically detects and routes escalations based on triggers
 */
export class EscalationAutomation {
  private triggers: EscalationTrigger[];

  constructor() {
    this.triggers = this.initializeDefaultTriggers();
  }

  /**
   * Evaluate if conversation should be escalated
   */
  evaluate(context: EscalationContext): EscalationResult {
    logger.debug("Evaluating escalation triggers", {
      conversationId: context.conversationId,
      intent: context.intent.category,
      sentiment: context.intent.sentiment,
    });

    // Find first matching trigger (sorted by priority)
    const matchingTrigger = this.triggers
      .filter((trigger) => trigger.enabled)
      .find((trigger) => trigger.condition(context));

    if (!matchingTrigger) {
      return {
        shouldEscalate: false,
        reason: "No escalation triggers matched",
      };
    }

    const result: EscalationResult = {
      shouldEscalate: true,
      assignTo: matchingTrigger.assignTo,
      alertLevel: matchingTrigger.alertLevel,
      reason: matchingTrigger.name,
      triggerId: matchingTrigger.id,
    };

    logger.info("Escalation triggered", {
      conversationId: context.conversationId,
      ...result,
    });

    return result;
  }

  /**
   * Execute escalation (assign and alert)
   */
  async executeEscalation(
    conversationId: number,
    escalation: EscalationResult
  ): Promise<void> {
    if (!escalation.shouldEscalate) return;

    logger.info("Executing escalation", {
      conversationId,
      assignTo: escalation.assignTo,
      alertLevel: escalation.alertLevel,
    });

    // TODO: Assign to operator/specialist in Chatwoot
    // TODO: Send alert (email, Slack, etc.) based on alert level
    // TODO: Track escalation in database

    // Placeholder implementation
    switch (escalation.alertLevel) {
      case "critical":
        logger.warn("CRITICAL ESCALATION", {
          conversationId,
          reason: escalation.reason,
        });
        // TODO: Alert manager immediately
        break;

      case "urgent":
        logger.info("URGENT ESCALATION", {
          conversationId,
          reason: escalation.reason,
        });
        // TODO: Alert assigned specialist
        break;

      case "normal":
        logger.info("NORMAL ESCALATION", {
          conversationId,
          reason: escalation.reason,
        });
        // TODO: Queue assignment
        break;
    }
  }

  /**
   * Initialize default escalation triggers
   */
  private initializeDefaultTriggers(): EscalationTrigger[] {
    return [
      // Critical escalations
      {
        id: "legal_threat",
        name: "Legal threat or lawsuit mention",
        condition: (ctx) =>
          /(lawsuit|attorney|lawyer|sue|legal action)/i.test(
            ctx.customerMessage
          ),
        assignTo: "manager",
        alertLevel: "critical",
        enabled: true,
      },
      {
        id: "extreme_negative",
        name: "Extreme negative sentiment",
        condition: (ctx) =>
          ctx.intent.sentiment === "negative" &&
          /(terrible|worst|horrible|never again)/i.test(ctx.customerMessage),
        assignTo: "manager",
        alertLevel: "critical",
        enabled: true,
      },

      // Urgent escalations
      {
        id: "vip_complaint",
        name: "VIP customer with negative sentiment",
        condition: (ctx) =>
          (ctx.customerLifetimeValue || 0) > 2000 &&
          ctx.intent.sentiment === "negative",
        assignTo: "manager",
        alertLevel: "urgent",
        enabled: true,
      },
      {
        id: "high_value_order_issue",
        name: "High-value order issue",
        condition: (ctx) =>
          ctx.intent.category === "complaint" &&
          (ctx.customerLifetimeValue || 0) > 5000,
        assignTo: "senior_operator",
        alertLevel: "urgent",
        enabled: true,
      },
      {
        id: "race_weekend_emergency",
        name: "Race weekend emergency",
        condition: (ctx) =>
          /(race weekend|racing saturday|need (by|for) (friday|saturday))/i.test(
            ctx.customerMessage
          ) && ctx.intent.urgency === "high",
        assignTo: "senior_operator",
        alertLevel: "urgent",
        enabled: true,
      },

      // Normal escalations
      {
        id: "repeated_contact",
        name: "Customer contacted multiple times without resolution",
        condition: (ctx) =>
          ctx.messageCount > 5 && ctx.conversationAge > 24 * 60 * 60 * 1000,
        assignTo: "senior_operator",
        alertLevel: "normal",
        enabled: true,
      },
      {
        id: "technical_complex",
        name: "Complex technical question",
        condition: (ctx) =>
          ctx.intent.category === "technical" ||
          (ctx.intent.category === "product_fit" &&
            /build|custom|swap|modify/i.test(ctx.customerMessage)),
        assignTo: "technical_specialist",
        alertLevel: "normal",
        enabled: true,
      },
      {
        id: "installation_complex",
        name: "Complex installation question",
        condition: (ctx) =>
          ctx.intent.category === "installation" &&
          /(torque|timing|wiring|plumb)/i.test(ctx.customerMessage),
        assignTo: "technical_specialist",
        alertLevel: "normal",
        enabled: true,
      },
    ];
  }

  /**
   * Get all triggers (for configuration UI)
   */
  getTriggers(): EscalationTrigger[] {
    return [...this.triggers];
  }

  /**
   * Update escalation trigger
   */
  updateTrigger(triggerId: string, updates: Partial<EscalationTrigger>): boolean {
    const triggerIndex = this.triggers.findIndex((t) => t.id === triggerId);
    if (triggerIndex === -1) return false;

    this.triggers[triggerIndex] = { ...this.triggers[triggerIndex], ...updates };
    return true;
  }
}

// Singleton instance
let escalationEngineInstance: EscalationAutomation | null = null;

/**
 * Get escalation engine instance
 */
export function getEscalationEngine(): EscalationAutomation {
  if (!escalationEngineInstance) {
    escalationEngineInstance = new EscalationAutomation();
  }
  return escalationEngineInstance;
}

/**
 * Evaluate and execute escalation if needed
 */
export async function processEscalation(
  context: EscalationContext
): Promise<EscalationResult> {
  const engine = getEscalationEngine();
  const result = engine.evaluate(context);

  if (result.shouldEscalate) {
    await engine.executeEscalation(context.conversationId, result);
  }

  return result;
}

