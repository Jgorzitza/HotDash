/**
 * Unit tests for AI drafter
 */

import { describe, it, expect, beforeEach } from "vitest";
import { formatAsPrivateNote } from "~/services/ai-customer/drafter";
import type { DraftResponse } from "~/services/ai-customer/drafter";

describe("AI Customer Drafter", () => {
  describe("formatAsPrivateNote", () => {
    it("should format draft as Private Note with all sections", () => {
      const draft: DraftResponse = {
        conversationId: "conv-123",
        suggestedReply:
          "Thanks for reaching out! Your order will ship tomorrow.",
        confidence: 0.85,
        ragSources: ["shipping-policy"],
        toneAnalysis: {
          score: 4.5,
          passesThreshold: true,
          issues: [],
        },
        evidence:
          "Customer query: When will my order ship?\nRAG confidence: 85%",
        risk: "Standard customer inquiry",
      };

      const note = formatAsPrivateNote(draft);

      expect(note).toContain("AI Draft Reply");
      expect(note).toContain("Suggested Reply:");
      expect(note).toContain("Your order will ship tomorrow");
      expect(note).toContain("Evidence:");
      expect(note).toContain("Confidence:");
      expect(note).toContain("85%");
      expect(note).toContain("Tone Check:");
      expect(note).toContain("4.5");
      expect(note).toContain("Risk:");
      expect(note).toContain("Actions:");
      expect(note).toContain("Approve & Send");
    });

    it("should show high confidence badge for 80%+", () => {
      const draft: DraftResponse = {
        conversationId: "conv-123",
        suggestedReply: "Reply",
        confidence: 0.9,
        ragSources: [],
        toneAnalysis: { score: 4, passesThreshold: true, issues: [] },
        evidence: "Test",
        risk: "Standard",
      };

      const note = formatAsPrivateNote(draft);
      expect(note).toContain("✓ High");
    });

    it("should show tone issues when present", () => {
      const draft: DraftResponse = {
        conversationId: "conv-123",
        suggestedReply: "Reply",
        confidence: 0.8,
        ragSources: [],
        toneAnalysis: {
          score: 3.5,
          passesThreshold: false,
          issues: ["Too formal", "Missing greeting"],
        },
        evidence: "Test",
        risk: "Tone issues",
      };

      const note = formatAsPrivateNote(draft);
      expect(note).toContain("Tone Issues:");
      expect(note).toContain("Too formal");
      expect(note).toContain("Missing greeting");
    });
  });
});
