/**
 * Unit tests for CX approval flow
 */

import { describe, it, expect, beforeEach } from "vitest";
import { captureLearningSignal } from "~/services/ai-customer/learning-capture";

describe("CX Approval Flow", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
  });

  describe("Learning Signal Capture", () => {
    it("should capture edit distance when reply is edited", () => {
      const signal = captureLearningSignal(
        "conv-123",
        "Thanks for reaching out!",
        "Thanks for reaching out! I'll help you right away.",
        { tone: 5, accuracy: 4, policy: 5 },
        { ragSources: [], confidence: 0.8, gradedBy: "agent" },
      );

      expect(signal.editDistance).toBeGreaterThan(0);
      expect(signal.editDistance).toBeLessThan(50); // Reasonable edit
    });

    it("should have zero edit distance when no changes made", () => {
      const reply = "Thanks for reaching out!";
      const signal = captureLearningSignal(
        "conv-123",
        reply,
        reply,
        { tone: 5, accuracy: 5, policy: 5 },
        { ragSources: [], confidence: 0.9, gradedBy: "agent" },
      );

      expect(signal.editDistance).toBe(0);
    });

    it("should store all grading dimensions", () => {
      const signal = captureLearningSignal(
        "conv-123",
        "Draft",
        "Final",
        { tone: 3, accuracy: 4, policy: 5 },
        { ragSources: [], confidence: 0.7, gradedBy: "test" },
      );

      expect(signal.grading.tone).toBe(3);
      expect(signal.grading.accuracy).toBe(4);
      expect(signal.grading.policy).toBe(5);
    });

    it("should preserve RAG metadata", () => {
      const signal = captureLearningSignal(
        "conv-123",
        "Draft",
        "Final",
        { tone: 4, accuracy: 4, policy: 4 },
        {
          ragSources: ["article-1", "article-2"],
          confidence: 0.85,
          gradedBy: "agent@test.com",
        },
      );

      expect(signal.ragSources).toEqual(["article-1", "article-2"]);
      expect(signal.confidence).toBe(0.85);
      expect(signal.gradedBy).toBe("agent@test.com");
    });
  });
});
