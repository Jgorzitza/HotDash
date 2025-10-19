/**
 * Unit tests for draft-generator
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  generateReplyDraft,
  formatAsPrivateNote,
} from "~/agents/customer/draft-generator";
import type { ConversationMessage } from "~/agents/customer/draft-generator";

describe("draft-generator", () => {
  const mockMessages: ConversationMessage[] = [
    {
      id: "1",
      sender: "customer",
      content: "I need help with my order #12345",
      timestamp: "2025-10-19T10:00:00Z",
    },
    {
      id: "2",
      sender: "agent",
      content: "I'll look into that for you.",
      timestamp: "2025-10-19T10:01:00Z",
    },
    {
      id: "3",
      sender: "customer",
      content: "Thank you! When will it ship?",
      timestamp: "2025-10-19T10:05:00Z",
    },
  ];

  beforeEach(() => {
    process.env.NODE_ENV = "test";
  });

  describe("generateReplyDraft", () => {
    it("should generate draft from conversation messages", async () => {
      const result = await generateReplyDraft({
        conversationId: "conv-123",
        messages: mockMessages,
      });

      expect(result).toHaveProperty("conversationId", "conv-123");
      expect(result).toHaveProperty("suggestedReply");
      expect(result).toHaveProperty("context");
      expect(result).toHaveProperty("evidence");
      expect(result).toHaveProperty("risk");
      expect(result).toHaveProperty("rollback");
    });

    it("should include conversation context", async () => {
      const result = await generateReplyDraft({
        conversationId: "conv-123",
        messages: mockMessages,
      });

      expect(result.context).toHaveLength(3);
      expect(result.context[0]).toContain("[customer]");
      expect(result.context[0]).toContain("order #12345");
    });

    it("should provide RAG evidence", async () => {
      const result = await generateReplyDraft({
        conversationId: "conv-123",
        messages: mockMessages,
      });

      expect(result.evidence).toHaveProperty("ragSources");
      expect(result.evidence).toHaveProperty("confidence");
      expect(result.evidence.confidence).toBeGreaterThanOrEqual(0);
      expect(result.evidence.confidence).toBeLessThanOrEqual(1);
    });

    it("should flag low confidence as higher risk", async () => {
      const result = await generateReplyDraft({
        conversationId: "conv-123",
        messages: mockMessages,
        ragContext: {
          sources: [],
          relevantArticles: [],
          confidence: 0.5,
        },
      });

      expect(result.risk).toContain("Low confidence");
    });

    it("should throw error when no customer messages exist", async () => {
      const agentOnlyMessages: ConversationMessage[] = [
        {
          id: "1",
          sender: "agent",
          content: "Hello",
          timestamp: "2025-10-19T10:00:00Z",
        },
      ];

      await expect(
        generateReplyDraft({
          conversationId: "conv-123",
          messages: agentOnlyMessages,
        }),
      ).rejects.toThrow("No customer message found");
    });

    it("should use provided RAG context when available", async () => {
      const customRAG = {
        sources: ["article-1", "article-2"],
        relevantArticles: [
          {
            title: "Shipping Policy",
            excerpt: "Orders ship within 2-3 business days",
          },
        ],
        confidence: 0.9,
      };

      const result = await generateReplyDraft({
        conversationId: "conv-123",
        messages: mockMessages,
        ragContext: customRAG,
      });

      expect(result.evidence.ragSources).toEqual(["article-1", "article-2"]);
      expect(result.evidence.confidence).toBe(0.9);
      expect(result.risk).toContain("Standard customer inquiry");
    });
  });

  describe("formatAsPrivateNote", () => {
    it("should format draft as Private Note with required sections", () => {
      const draft = {
        conversationId: "conv-123",
        context: ["[customer] Hello"],
        suggestedReply: "Thank you for reaching out!",
        evidence: {
          ragSources: ["article-1"],
          confidence: 0.85,
        },
        risk: "Standard customer inquiry",
        rollback: "Delete Private Note if draft is rejected",
      };

      const note = formatAsPrivateNote(draft);

      expect(note).toContain("AI Draft Reply");
      expect(note).toContain("Suggested Reply:");
      expect(note).toContain("Thank you for reaching out!");
      expect(note).toContain("Evidence:");
      expect(note).toContain("RAG Sources: article-1");
      expect(note).toContain("Confidence: 85%");
      expect(note).toContain("Risk Assessment:");
      expect(note).toContain("Standard customer inquiry");
    });

    it("should handle missing RAG sources gracefully", () => {
      const draft = {
        conversationId: "conv-123",
        context: [],
        suggestedReply: "Test reply",
        evidence: {
          confidence: 0.7,
        },
        risk: "Low confidence",
        rollback: "Delete note",
      };

      const note = formatAsPrivateNote(draft);

      expect(note).toContain("RAG Sources: None");
      expect(note).toContain("Confidence: 70%");
    });

    it("should include HITL action instructions", () => {
      const draft = {
        conversationId: "conv-123",
        context: [],
        suggestedReply: "Reply",
        evidence: { confidence: 0.8 },
        risk: "Standard",
        rollback: "Delete",
      };

      const note = formatAsPrivateNote(draft);

      expect(note).toContain("Actions:");
      expect(note).toContain("Approve & Send");
      expect(note).toContain("Reject");
    });
  });
});
