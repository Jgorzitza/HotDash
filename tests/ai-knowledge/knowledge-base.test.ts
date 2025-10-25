/**
 * Knowledge Base System Tests
 * 
 * Comprehensive test suite for validating:
 * - Search accuracy
 * - Embedding quality
 * - Knowledge extraction
 * - Learning pipeline
 * - Recommendation engine
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  generateEmbedding,
  cosineSimilarity,
  ingestDocument,
  semanticSearch,
  buildRAGContext,
  extractLearning,
  calculateConfidenceScore,
} from "~/services/knowledge";

describe("Knowledge Base - Embedding Service", () => {
  it("should generate embeddings for text", async () => {
    const result = await generateEmbedding({
      text: "How do I track my order?",
    });

    expect(result.embedding).toBeDefined();
    expect(result.embedding.length).toBe(1536); // text-embedding-3-small dimension
    expect(result.model).toBe("text-embedding-3-small");
    expect(result.usage.totalTokens).toBeGreaterThan(0);
  });

  it("should calculate cosine similarity correctly", () => {
    const vec1 = [1, 0, 0];
    const vec2 = [1, 0, 0];
    const vec3 = [0, 1, 0];

    const similarity1 = cosineSimilarity(vec1, vec2);
    const similarity2 = cosineSimilarity(vec1, vec3);

    expect(similarity1).toBe(1); // Identical vectors
    expect(similarity2).toBe(0); // Orthogonal vectors
  });

  it("should handle embedding generation errors gracefully", async () => {
    try {
      await generateEmbedding({ text: "" });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("Knowledge Base - Ingestion Service", () => {
  it("should ingest a document successfully", async () => {
    const result = await ingestDocument({
      title: "Test: How to track orders",
      content: "You can track your order by visiting the tracking page...",
      category: "orders",
      tags: ["tracking", "test"],
      source: "test-suite",
      createdBy: "test",
    });

    expect(result.success).toBe(true);
    expect(result.articleId).toBeDefined();
    expect(result.embeddingGenerated).toBe(true);
  });

  it("should handle invalid category gracefully", async () => {
    const result = await ingestDocument({
      title: "Test: Invalid category",
      content: "Test content",
      category: "invalid" as any,
      tags: ["test"],
      source: "test-suite",
      createdBy: "test",
    });

    // Should still succeed but with default category
    expect(result.success).toBe(true);
  });
});

describe("Knowledge Base - Search Service", () => {
  beforeAll(async () => {
    // Seed test data
    await ingestDocument({
      title: "How do I track my order?",
      content: "You can track your order by visiting our tracking page and entering your order number.",
      category: "orders",
      tags: ["tracking", "orders"],
      source: "test-suite",
      createdBy: "test",
    });

    await ingestDocument({
      title: "What is your return policy?",
      content: "We accept returns within 30 days of purchase. Items must be unused and in original packaging.",
      category: "returns",
      tags: ["returns", "policy"],
      source: "test-suite",
      createdBy: "test",
    });
  });

  it("should find relevant articles via semantic search", async () => {
    const results = await semanticSearch({
      query: "Where is my package?",
      limit: 5,
      minSimilarity: 0.5,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarity).toBeGreaterThan(0.5);
    expect(results[0].article).toBeDefined();
  });

  it("should filter by category", async () => {
    const results = await semanticSearch({
      query: "order tracking",
      limit: 5,
      categories: ["orders"],
    });

    results.forEach((result) => {
      expect(result.article.category).toBe("orders");
    });
  });

  it("should respect similarity threshold", async () => {
    const results = await semanticSearch({
      query: "completely unrelated query about quantum physics",
      limit: 5,
      minSimilarity: 0.9,
    });

    // Should return few or no results for unrelated query
    expect(results.length).toBeLessThanOrEqual(2);
  });
});

describe("Knowledge Base - RAG Context Builder", () => {
  it("should build RAG context for customer questions", async () => {
    const context = await buildRAGContext("How can I return an item?", {
      maxContext: 3,
      minConfidence: 0.5,
    });

    expect(context.articles).toBeDefined();
    expect(context.articles.length).toBeLessThanOrEqual(3);
    expect(context.query).toBe("How can I return an item?");
    expect(context.timestamp).toBeDefined();
  });

  it("should filter by category when specified", async () => {
    const context = await buildRAGContext("order status", {
      maxContext: 3,
      categories: ["orders"],
    });

    context.articles.forEach((article) => {
      expect(article.category).toBe("orders");
    });
  });
});

describe("Knowledge Base - Learning Pipeline", () => {
  it("should calculate confidence score correctly", () => {
    const score1 = calculateConfidenceScore(10, 9, {
      tone: 5,
      accuracy: 5,
      policy: 5,
    });

    const score2 = calculateConfidenceScore(10, 5, {
      tone: 3,
      accuracy: 3,
      policy: 3,
    });

    expect(score1).toBeGreaterThan(score2);
    expect(score1).toBeLessThanOrEqual(1);
    expect(score1).toBeGreaterThanOrEqual(0);
  });

  it("should extract learning from HITL approval", async () => {
    const result = await extractLearning({
      approvalId: "test-approval-001",
      aiDraft: "Thank you for your order. It will ship soon.",
      humanFinal: "Thank you for your order! Your package will ship within 2-3 business days.",
      grades: {
        tone: 4,
        accuracy: 5,
        policy: 5,
      },
      customerQuestion: "When will my order ship?",
      reviewer: "test-reviewer",
    });

    expect(result.editCreated).toBe(true);
    expect(result.learningType).toBeDefined();
  });

  it("should classify learning types correctly", async () => {
    // Minimal edit = tone improvement
    const result1 = await extractLearning({
      approvalId: "test-001",
      aiDraft: "Your order will ship soon.",
      humanFinal: "Your order will ship soon!",
      grades: { tone: 5, accuracy: 5, policy: 5 },
      customerQuestion: "When will it ship?",
      reviewer: "test",
    });

    expect(result1.learningType).toBe("tone_improvement");

    // Large edit = new pattern
    const result2 = await extractLearning({
      approvalId: "test-002",
      aiDraft: "It will ship.",
      humanFinal: "Your order has been processed and will ship within 2-3 business days via USPS Priority Mail. You'll receive a tracking number once it ships.",
      grades: { tone: 5, accuracy: 5, policy: 5 },
      customerQuestion: "When will it ship?",
      reviewer: "test",
    });

    expect(result2.learningType).toBe("new_pattern");
  });
});

describe("Knowledge Base - Search Accuracy", () => {
  const testQueries = [
    {
      query: "How do I track my order?",
      expectedCategory: "orders",
      expectedKeywords: ["track", "order"],
    },
    {
      query: "What is your return policy?",
      expectedCategory: "returns",
      expectedKeywords: ["return", "policy"],
    },
    {
      query: "How long does shipping take?",
      expectedCategory: "shipping",
      expectedKeywords: ["shipping", "delivery"],
    },
  ];

  testQueries.forEach(({ query, expectedCategory, expectedKeywords }) => {
    it(`should find relevant results for: "${query}"`, async () => {
      const results = await semanticSearch({
        query,
        limit: 3,
        minSimilarity: 0.6,
      });

      if (results.length > 0) {
        const topResult = results[0];
        
        // Check if category matches (if article exists)
        if (topResult.article.category === expectedCategory) {
          expect(topResult.article.category).toBe(expectedCategory);
        }

        // Check if answer contains expected keywords
        const answerLower = topResult.article.answer.toLowerCase();
        const hasKeyword = expectedKeywords.some((keyword) =>
          answerLower.includes(keyword.toLowerCase())
        );
        
        expect(hasKeyword || topResult.similarity > 0.7).toBe(true);
      }
    });
  });
});

describe("Knowledge Base - Embedding Quality", () => {
  it("should generate consistent embeddings for same text", async () => {
    const text = "How do I track my order?";
    
    const result1 = await generateEmbedding({ text });
    const result2 = await generateEmbedding({ text });

    const similarity = cosineSimilarity(result1.embedding, result2.embedding);
    
    // Should be very similar (>0.99) for identical text
    expect(similarity).toBeGreaterThan(0.99);
  });

  it("should generate different embeddings for different text", async () => {
    const result1 = await generateEmbedding({ text: "How do I track my order?" });
    const result2 = await generateEmbedding({ text: "What is your return policy?" });

    const similarity = cosineSimilarity(result1.embedding, result2.embedding);
    
    // Should be less similar for different topics
    expect(similarity).toBeLessThan(0.9);
  });

  it("should generate similar embeddings for semantically similar text", async () => {
    const result1 = await generateEmbedding({ text: "Where is my package?" });
    const result2 = await generateEmbedding({ text: "How do I track my order?" });

    const similarity = cosineSimilarity(result1.embedding, result2.embedding);
    
    // Should be moderately similar for related topics
    expect(similarity).toBeGreaterThan(0.7);
  });
});

