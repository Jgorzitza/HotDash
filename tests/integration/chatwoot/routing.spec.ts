/**
 * Integration Tests: Chatwoot Routing Service
 *
 * Tests routing rules, auto-assignment, priority handling, and escalation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  routeConversation,
  checkSLABreach,
  getAvailableAgents,
  addConversationTags,
  DEFAULT_RULES,
  type Conversation,
  type Agent,
  type RoutingRule,
} from "~/services/chatwoot/routing";

describe("Chatwoot Routing Service", () => {
  describe("routeConversation", () => {
    it("should skip already assigned conversations", async () => {
      const conversation: Conversation = {
        id: 1,
        inbox_id: 1,
        status: "open",
        assignee_id: 5,
        created_at: Date.now() / 1000,
      };

      const agents: Agent[] = [
        { id: 5, name: "Agent 1", email: "agent1@test.com", availability_status: "online", assignedCount: 0 },
      ];

      const result = await routeConversation(conversation, agents);

      expect(result.action).toBe("no_action");
      expect(result.reason).toBe("Already assigned");
      expect(result.assigneeId).toBe(5);
    });

    it("should escalate conversations with legal keywords", async () => {
      const conversation: Conversation = {
        id: 2,
        inbox_id: 1,
        status: "open",
        created_at: Date.now() / 1000,
        messages: [
          { content: "I'm going to sue you and file a chargeback!", message_type: 0 },
        ],
      };

      const agents: Agent[] = [
        { id: 1, name: "Agent 1", email: "agent1@test.com", availability_status: "online", assignedCount: 0 },
      ];

      const result = await routeConversation(conversation, agents, DEFAULT_RULES);

      expect(result.action).toBe("escalated");
      expect(result.tags).toContain("escalated");
    });

    it("should prioritize urgent conversations", async () => {
      const conversation: Conversation = {
        id: 3,
        inbox_id: 1,
        status: "open",
        created_at: Date.now() / 1000,
        messages: [
          { content: "URGENT: My order is broken and I need help immediately!", message_type: 0 },
        ],
      };

      const agents: Agent[] = [
        { id: 1, name: "Agent 1", email: "agent1@test.com", availability_status: "online", assignedCount: 0 },
      ];

      const result = await routeConversation(conversation, agents, DEFAULT_RULES);

      expect(result.action).toBe("tagged");
      expect(result.tags).toContain("urgent");
    });

    it("should prioritize VIP conversations", async () => {
      const conversation: Conversation = {
        id: 4,
        inbox_id: 1,
        status: "open",
        created_at: Date.now() / 1000,
        messages: [
          { content: "I want to place a bulk order for my wholesale business", message_type: 0 },
        ],
      };

      const agents: Agent[] = [
        { id: 1, name: "Agent 1", email: "agent1@test.com", availability_status: "online", assignedCount: 0 },
      ];

      const result = await routeConversation(conversation, agents, DEFAULT_RULES);

      expect(result.action).toBe("tagged");
      expect(result.tags).toContain("vip");
    });

    it("should handle no available agents gracefully", async () => {
      const conversation: Conversation = {
        id: 5,
        inbox_id: 1,
        status: "open",
        created_at: Date.now() / 1000,
      };

      const agents: Agent[] = [
        { id: 1, name: "Agent 1", email: "agent1@test.com", availability_status: "offline", assignedCount: 0 },
      ];

      const result = await routeConversation(conversation, agents);

      expect(result.action).toBe("no_action");
      expect(result.reason).toBe("No agents available");
    });
  });

  describe("checkSLABreach", () => {
    it("should detect SLA breach when conversation is old", () => {
      const thirtyMinutesAgo = (Date.now() - 30 * 60 * 1000) / 1000;

      const conversation: Conversation = {
        id: 6,
        inbox_id: 1,
        status: "open",
        created_at: thirtyMinutesAgo,
      };

      const breached = checkSLABreach(conversation, 15);

      expect(breached).toBe(true);
    });

    it("should not detect breach when conversation is recent", () => {
      const fiveMinutesAgo = (Date.now() - 5 * 60 * 1000) / 1000;

      const conversation: Conversation = {
        id: 7,
        inbox_id: 1,
        status: "open",
        created_at: fiveMinutesAgo,
      };

      const breached = checkSLABreach(conversation, 15);

      expect(breached).toBe(false);
    });

    it("should not flag assigned conversations as breached", () => {
      const thirtyMinutesAgo = (Date.now() - 30 * 60 * 1000) / 1000;

      const conversation: Conversation = {
        id: 8,
        inbox_id: 1,
        status: "open",
        assignee_id: 1,
        created_at: thirtyMinutesAgo,
      };

      const breached = checkSLABreach(conversation, 15);

      expect(breached).toBe(false);
    });
  });

  describe("DEFAULT_RULES", () => {
    it("should have 5 default rules", () => {
      expect(DEFAULT_RULES).toHaveLength(5);
    });

    it("should have escalate-legal as highest priority", () => {
      const highestPriority = DEFAULT_RULES.reduce((max, rule) =>
        rule.priority > max.priority ? rule : max,
      );

      expect(highestPriority.id).toBe("escalate-legal");
      expect(highestPriority.priority).toBe(100);
    });

    it("should all be enabled by default", () => {
      expect(DEFAULT_RULES.every((rule) => rule.enabled)).toBe(true);
    });
  });
});

