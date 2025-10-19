/**
 * Knowledge Ingestion Tests
 * Direction task 9: Testing
 */

import { describe, it, expect, vi } from "vitest";
import { ingestKnowledgeStub } from "../../../../app/services/knowledge/ingestion.stub";

describe("Knowledge Ingestion", () => {
  describe("ingestKnowledgeStub", () => {
    it("returns stub result with error messages", async () => {
      const result = await ingestKnowledgeStub();

      expect(result).toEqual({
        documentsProcessed: 0,
        chunksCreated: 0,
        embeddingsGenerated: 0,
        errors: [
          "Waiting for OpenAI credentials (DevOps)",
          "Waiting for Supabase credentials (DevOps D-002)",
        ],
      });
    });

    it("returns zero metrics while awaiting credentials", async () => {
      const result = await ingestKnowledgeStub();

      expect(result.documentsProcessed).toBe(0);
      expect(result.chunksCreated).toBe(0);
      expect(result.embeddingsGenerated).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
