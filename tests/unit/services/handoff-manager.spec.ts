import { beforeEach, describe, expect, it } from "vitest";
import { HandoffManager, createDefaultHandoffRules } from "../../../apps/agent-service/src/handoff/handoff-manager";
import type { ConversationContext } from "../../../apps/agent-service/src/context/conversation-manager";

function buildContext(partial: Partial<ConversationContext>): ConversationContext {
  return {
    conversationId: partial.conversationId ?? 1,
    messages: partial.messages ?? [],
    customer: { ...(partial.customer ?? {}) },
    metadata: { ...(partial.metadata ?? {}) },
    intent: partial.intent,
    sentiment: partial.sentiment,
    urgency: partial.urgency,
    createdAt: partial.createdAt ?? new Date(),
    updatedAt: partial.updatedAt ?? new Date(),
  };
}

describe("HandoffManager", () => {
  let manager: HandoffManager;

  beforeEach(() => {
    manager = new HandoffManager();
    createDefaultHandoffRules(manager);
  });

  it("prioritizes high urgency order handoffs", () => {
    const decision = manager.decideHandoff(
      buildContext({
        intent: "order_status",
        urgency: "high",
        sentiment: "neutral",
        customer: { orderId: "HD-123" },
      }),
    );

    expect(decision.shouldHandoff).toBe(true);
    expect(decision.targetAgent).toBe("Order Support");
    expect(decision.reason).toBe("High urgency order issue");
    expect(decision.confidence).toBeCloseTo(0.95);
    expect(decision.requiresHumanReview).toBe(false);
    expect(decision.metadata.rulesEvaluated).toBeGreaterThan(0);
  });

  it("prioritizes negative sentiment handoffs when urgency is not high", () => {
    const decision = manager.decideHandoff(
      buildContext({
        intent: "order_refund",
        sentiment: "negative",
        urgency: "medium",
        customer: { orderId: "HD-321" },
      }),
    );

    expect(decision.shouldHandoff).toBe(true);
    expect(decision.targetAgent).toBe("Order Support");
    expect(decision.reason).toBe("Negative sentiment with order issue");
    expect(decision.requiresHumanReview).toBe(false);
    expect(decision.escalationReason).toBeUndefined();
  });

  it("routes shipping intents to shipping support", () => {
    const decision = manager.decideHandoff(
      buildContext({
        intent: "shipping_tracking",
        customer: { orderId: "HD-999" },
      }),
    );

    expect(decision.shouldHandoff).toBe(true);
    expect(decision.targetAgent).toBe("Shipping Support");
    expect(decision.reason).toBe("Shipping-related inquiry");
    expect(decision.confidence).toBeCloseTo(0.95);
  });

  it("returns no handoff when no rules match", () => {
    const decision = manager.decideHandoff(
      buildContext({
        intent: "general_question",
        sentiment: "neutral",
        urgency: "low",
      }),
    );

    expect(decision.shouldHandoff).toBe(false);
    expect(decision.targetAgent).toBeUndefined();
    expect(decision.confidence).toBe(1);
  });

  describe("utility helpers", () => {
    it("maps intents to recommended agents", () => {
      expect(manager.getRecommendedAgent("technical_setup")).toBe("Technical Support");
      expect(manager.getRecommendedAgent("feedback")).toBe("Triage");
      expect(manager.getRecommendedAgent("unknown_intent")).toBeNull();
    });

    it("validates agent capabilities", () => {
      expect(manager.hasCapability("Order Support", "cancel_orders")).toBe(true);
      expect(manager.hasCapability("Order Support", "product_info")).toBe(false);
      expect(manager.hasCapability("Unknown Agent", "cancel_orders")).toBe(false);
    });
  });
});
