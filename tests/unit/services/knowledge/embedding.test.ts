/**
 * Embedding Service Tests
 * Direction task 9: Testing
 */

import { describe, it, expect } from "vitest";
import { cosineSimilarity } from "../../../../app/services/knowledge/embedding";

describe("Embedding Service", () => {
  describe("cosineSimilarity", () => {
    it("calculates cosine similarity correctly", () => {
      const a = [1, 0, 0];
      const b = [1, 0, 0];
      const similarity = cosineSimilarity(a, b);
      expect(similarity).toBe(1);
    });

    it("returns 0 for orthogonal vectors", () => {
      const a = [1, 0];
      const b = [0, 1];
      const similarity = cosineSimilarity(a, b);
      expect(similarity).toBe(0);
    });

    it("throws error for mismatched dimensions", () => {
      const a = [1, 0, 0];
      const b = [1, 0];
      expect(() => cosineSimilarity(a, b)).toThrow(
        "Embedding dimensions must match",
      );
    });
  });
});
