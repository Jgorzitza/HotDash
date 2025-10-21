/**
 * Integration Tests: Chatwoot Automation Service
 *
 * Tests automation rules, keyword analysis, sentiment detection
 */

import { describe, it, expect } from "vitest";
import {
  analyzeConversation,
  isAfterHours,
  getAutomationRules,
  type ConversationContext,
} from "~/services/chatwoot/automation";

describe("Chatwoot Automation Service", () => {
  describe("analyzeConversation", () => {
    it("should detect order-related conversations", () => {
      const conversation: ConversationContext = {
        id: 1,
        inbox_id: 1,
        status: "open",
        messages: [
          { content: "Where is my order? I need the tracking number", message_type: 0 },
        ],
      };

      const result = analyzeConversation(conversation);

      expect(result.categories).toContain("orders");
      expect(result.intent).toBe("question");
    });

    it("should detect inventory questions", () => {
      const conversation: ConversationContext = {
        id: 2,
        inbox_id: 1,
        status: "open",
        messages: [
          { content: "Is this product in stock? When will it be available?", message_type: 0 },
        ],
      };

      const result = analyzeConversation(conversation);

      expect(result.categories).toContain("inventory");
      expect(result.intent).toBe("question");
    });

    it("should detect negative sentiment", () => {
      const conversation: ConversationContext = {
        id: 3,
        inbox_id: 1,
        status: "open",
        messages: [
          { content: "This is terrible service! I'm very disappointed and frustrated!", message_type: 0 },
        ],
      };

      const result = analyzeConversation(conversation);

      expect(result.sentiment).toBe("negative");
      expect(result.intent).toBe("complaint");
    });

    it("should detect positive sentiment", () => {
      const conversation: ConversationContext = {
        id: 4,
        inbox_id: 1,
        status: "open",
        messages: [
          { content: "Thank you so much! This is awesome, great job!", message_type: 0 },
        ],
      };

      const result = analyzeConversation(conversation);

      expect(result.sentiment).toBe("positive");
      expect(result.intent).toBe("praise");
    });

    it("should detect urgency", () => {
      const conversation: ConversationContext = {
        id: 5,
        inbox_id: 1,
        status: "open",
        messages: [
          { content: "URGENT: I need help immediately! This is an emergency!", message_type: 0 },
        ],
      };

      const result = analyzeConversation(conversation);

      expect(result.isUrgent).toBe(true);
    });

    it("should handle multiple categories", () => {
      const conversation: ConversationContext = {
        id: 6,
        inbox_id: 1,
        status: "open",
        messages: [
          { content: "I ordered AN fittings but they're out of stock. Where's my order?", message_type: 0 },
        ],
      };

      const result = analyzeConversation(conversation);

      expect(result.categories.length).toBeGreaterThan(1);
      expect(result.categories).toContain("orders");
      expect(result.categories).toContain("inventory");
    });

    it("should handle neutral sentiment", () => {
      const conversation: ConversationContext = {
        id: 7,
        inbox_id: 1,
        status: "open",
        messages: [
          { content: "What are the specifications of this fuel pump?", message_type: 0 },
        ],
      };

      const result = analyzeConversation(conversation);

      expect(result.sentiment).toBe("neutral");
    });

    it("should detect question intent", () => {
      const conversation: ConversationContext = {
        id: 8,
        inbox_id: 1,
        status: "open",
        messages: [
          { content: "How do I install this fitting? What size do I need?", message_type: 0 },
        ],
      };

      const result = analyzeConversation(conversation);

      expect(result.intent).toBe("question");
    });
  });

  describe("isAfterHours", () => {
    it("should handle business hours check", () => {
      const result = isAfterHours();

      expect(typeof result).toBe("boolean");
    });
  });

  describe("getAutomationRules", () => {
    it("should return automation rules", () => {
      const rules = getAutomationRules();

      expect(rules.length).toBeGreaterThan(0);
      expect(rules[0]).toHaveProperty("id");
      expect(rules[0]).toHaveProperty("name");
      expect(rules[0]).toHaveProperty("enabled");
    });

    it("should have order tagging rule", () => {
      const rules = getAutomationRules();
      const orderRule = rules.find((r) => r.id === "auto-tag-orders");

      expect(orderRule).toBeDefined();
      expect(orderRule?.enabled).toBe(true);
    });

    it("should have inventory tagging rule", () => {
      const rules = getAutomationRules();
      const inventoryRule = rules.find((r) => r.id === "auto-tag-inventory");

      expect(inventoryRule).toBeDefined();
      expect(inventoryRule?.enabled).toBe(true);
    });

    it("should have urgent flagging rule", () => {
      const rules = getAutomationRules();
      const urgentRule = rules.find((r) => r.id === "flag-urgent");

      expect(urgentRule).toBeDefined();
      expect(urgentRule?.enabled).toBe(true);
    });

    it("should have negative sentiment rule", () => {
      const rules = getAutomationRules();
      const sentimentRule = rules.find((r) => r.id === "flag-negative-sentiment");

      expect(sentimentRule).toBeDefined();
      expect(sentimentRule?.enabled).toBe(true);
    });
  });
});


