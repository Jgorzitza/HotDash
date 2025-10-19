/**
 * Unit tests for learning signals capture
 */

import { describe, it, expect, beforeEach } from "vitest";
import { captureLearningSignal } from "~/services/ai-customer/learning-capture";

describe("Learning Signals Capture", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
  });

  describe("captureLearningSignal", () => {
    it("should capture complete learning signal", () => {
      const signal = captureLearningSignal(
        "conv-123",
        "Thanks for reaching out!",
        "Thanks for contacting us! I'll help you with that.",
        { tone: 5, accuracy: 4, policy: 5 },
        {
          ragSources: ["shipping-policy"],
          confidence: 0.85,
          gradedBy: "agent@example.com",
        },
      );

      expect(signal.conversationId).toBe("conv-123");
      expect(signal.draftReply).toBe("Thanks for reaching out!");
      expect(signal.humanReply).toBe(
        "Thanks for contacting us! I'll help you with that.",
      );
      expect(signal.editDistance).toBeGreaterThan(0);
      expect(signal.grading.tone).toBe(5);
      expect(signal.grading.accuracy).toBe(4);
      expect(signal.grading.policy).toBe(5);
      expect(signal.approved).toBe(true);
    });

    it("should calculate edit distance correctly", () => {
      const signal = captureLearningSignal(
        "conv-123",
        "Hello",
        "Hello there",
        { tone: 4, accuracy: 4, policy: 4 },
        { ragSources: [], confidence: 0.8, gradedBy: "test" },
      );

      expect(signal.editDistance).toBe(6); // " there" added
    });

    it("should store RAG metadata", () => {
      const signal = captureLearningSignal(
        "conv-123",
        "Draft",
        "Final",
        { tone: 4, accuracy: 4, policy: 4 },
        {
          ragSources: ["article-1", "article-2"],
          confidence: 0.9,
          gradedBy: "test",
        },
      );

      expect(signal.ragSources).toEqual(["article-1", "article-2"]);
      expect(signal.confidence).toBe(0.9);
      expect(signal.gradedBy).toBe("test");
    });
  });
});
