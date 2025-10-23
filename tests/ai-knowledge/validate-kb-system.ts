/**
 * Knowledge Base System Validation Script
 * 
 * Comprehensive validation of the KB system in production:
 * - Health checks
 * - Search accuracy tests
 * - Embedding quality validation
 * - Performance benchmarks
 * 
 * Run with: npx tsx tests/ai-knowledge/validate-kb-system.ts
 */

import {
  checkKnowledgeBaseHealth,
  getKnowledgeBaseStats,
  generateEmbedding,
  cosineSimilarity,
  semanticSearch,
  buildRAGContext,
  ingestDocument,
} from "~/services/knowledge";

interface ValidationResult {
  test: string;
  status: "pass" | "fail" | "warn";
  message: string;
  details?: any;
}

const results: ValidationResult[] = [];

/**
 * Add validation result
 */
function addResult(test: string, status: "pass" | "fail" | "warn", message: string, details?: any) {
  results.push({ test, status, message, details });
  
  const icon = status === "pass" ? "✅" : status === "fail" ? "❌" : "⚠️";
  console.log(`${icon} ${test}: ${message}`);
  
  if (details) {
    console.log(`   Details:`, details);
  }
}

/**
 * Test 1: System Health
 */
async function testSystemHealth() {
  console.log("\n🔍 Testing System Health...");
  
  try {
    const health = await checkKnowledgeBaseHealth();
    
    if (health.healthy) {
      addResult("System Health", "pass", "All components operational", {
        embedding: health.components.embedding,
        database: health.components.database,
        search: health.components.search,
      });
    } else {
      addResult("System Health", "fail", "Some components not operational", health.components);
    }
  } catch (error) {
    addResult("System Health", "fail", `Error: ${error.message}`);
  }
}

/**
 * Test 2: Database Statistics
 */
async function testDatabaseStats() {
  console.log("\n🔍 Testing Database Statistics...");
  
  try {
    const stats = await getKnowledgeBaseStats();
    
    if (stats.totalArticles > 0) {
      addResult("Database Stats", "pass", `Found ${stats.totalArticles} articles`, {
        total: stats.totalArticles,
        recent: stats.recentArticles,
        categories: stats.articlesByCategory,
      });
    } else {
      addResult("Database Stats", "warn", "No articles found in database");
    }
  } catch (error) {
    addResult("Database Stats", "fail", `Error: ${error.message}`);
  }
}

/**
 * Test 3: Embedding Generation
 */
async function testEmbeddingGeneration() {
  console.log("\n🔍 Testing Embedding Generation...");
  
  try {
    const testText = "How do I track my order?";
    const result = await generateEmbedding({ text: testText });
    
    if (result.embedding.length === 1536) {
      addResult("Embedding Generation", "pass", "Generated 1536-dimensional embedding", {
        model: result.model,
        tokens: result.usage.totalTokens,
      });
    } else {
      addResult("Embedding Generation", "fail", `Unexpected embedding dimension: ${result.embedding.length}`);
    }
  } catch (error) {
    addResult("Embedding Generation", "fail", `Error: ${error.message}`);
  }
}

/**
 * Test 4: Embedding Consistency
 */
async function testEmbeddingConsistency() {
  console.log("\n🔍 Testing Embedding Consistency...");
  
  try {
    const text = "What is your return policy?";
    
    const result1 = await generateEmbedding({ text });
    const result2 = await generateEmbedding({ text });
    
    const similarity = cosineSimilarity(result1.embedding, result2.embedding);
    
    if (similarity > 0.99) {
      addResult("Embedding Consistency", "pass", `Consistency score: ${similarity.toFixed(4)}`);
    } else {
      addResult("Embedding Consistency", "warn", `Lower than expected: ${similarity.toFixed(4)}`);
    }
  } catch (error) {
    addResult("Embedding Consistency", "fail", `Error: ${error.message}`);
  }
}

/**
 * Test 5: Semantic Similarity
 */
async function testSemanticSimilarity() {
  console.log("\n🔍 Testing Semantic Similarity...");
  
  try {
    const similar1 = await generateEmbedding({ text: "Where is my package?" });
    const similar2 = await generateEmbedding({ text: "How do I track my order?" });
    const different = await generateEmbedding({ text: "What is your return policy?" });
    
    const similarityScore = cosineSimilarity(similar1.embedding, similar2.embedding);
    const differentScore = cosineSimilarity(similar1.embedding, different.embedding);
    
    if (similarityScore > differentScore && similarityScore > 0.7) {
      addResult("Semantic Similarity", "pass", "Correctly identifies similar content", {
        similar: similarityScore.toFixed(4),
        different: differentScore.toFixed(4),
      });
    } else {
      addResult("Semantic Similarity", "warn", "Similarity scores unexpected", {
        similar: similarityScore.toFixed(4),
        different: differentScore.toFixed(4),
      });
    }
  } catch (error) {
    addResult("Semantic Similarity", "fail", `Error: ${error.message}`);
  }
}

/**
 * Test 6: Document Ingestion
 */
async function testDocumentIngestion() {
  console.log("\n🔍 Testing Document Ingestion...");
  
  try {
    const result = await ingestDocument({
      title: "VALIDATION TEST: Sample FAQ",
      content: "This is a test article for validation purposes.",
      category: "technical",
      tags: ["validation", "test"],
      source: "validation-script",
      createdBy: "ai-knowledge-validator",
    });
    
    if (result.success && result.embeddingGenerated) {
      addResult("Document Ingestion", "pass", "Successfully ingested test document", {
        articleId: result.articleId,
        embeddingGenerated: result.embeddingGenerated,
      });
    } else {
      addResult("Document Ingestion", "fail", "Failed to ingest document", result);
    }
  } catch (error) {
    addResult("Document Ingestion", "fail", `Error: ${error.message}`);
  }
}

/**
 * Test 7: Semantic Search
 */
async function testSemanticSearch() {
  console.log("\n🔍 Testing Semantic Search...");
  
  try {
    const results = await semanticSearch({
      query: "How do I track my order?",
      limit: 5,
      minSimilarity: 0.5,
    });
    
    if (results.length > 0) {
      addResult("Semantic Search", "pass", `Found ${results.length} results`, {
        topSimilarity: results[0].similarity.toFixed(4),
        topArticle: results[0].article.question.substring(0, 50),
      });
    } else {
      addResult("Semantic Search", "warn", "No results found (may need more articles)");
    }
  } catch (error) {
    addResult("Semantic Search", "fail", `Error: ${error.message}`);
  }
}

/**
 * Test 8: RAG Context Building
 */
async function testRAGContext() {
  console.log("\n🔍 Testing RAG Context Building...");
  
  try {
    const context = await buildRAGContext("How can I return an item?", {
      maxContext: 3,
      minConfidence: 0.5,
    });
    
    if (context.articles.length > 0) {
      addResult("RAG Context", "pass", `Built context with ${context.articles.length} articles`, {
        articlesFound: context.totalFound,
        query: context.query,
      });
    } else {
      addResult("RAG Context", "warn", "No articles in context (may need more articles)");
    }
  } catch (error) {
    addResult("RAG Context", "fail", `Error: ${error.message}`);
  }
}

/**
 * Test 9: Search Accuracy
 */
async function testSearchAccuracy() {
  console.log("\n🔍 Testing Search Accuracy...");
  
  const testCases = [
    { query: "track order", expectedCategory: "orders" },
    { query: "return policy", expectedCategory: "returns" },
    { query: "shipping time", expectedCategory: "shipping" },
  ];
  
  let passCount = 0;
  
  for (const testCase of testCases) {
    try {
      const results = await semanticSearch({
        query: testCase.query,
        limit: 3,
        minSimilarity: 0.5,
      });
      
      if (results.length > 0) {
        const topResult = results[0];
        if (topResult.article.category === testCase.expectedCategory || topResult.similarity > 0.7) {
          passCount++;
        }
      }
    } catch (error) {
      // Skip this test case
    }
  }
  
  const accuracy = (passCount / testCases.length) * 100;
  
  if (accuracy >= 66) {
    addResult("Search Accuracy", "pass", `${accuracy.toFixed(0)}% accuracy`, {
      passed: passCount,
      total: testCases.length,
    });
  } else {
    addResult("Search Accuracy", "warn", `${accuracy.toFixed(0)}% accuracy (may need more articles)`);
  }
}

/**
 * Test 10: Performance Benchmark
 */
async function testPerformance() {
  console.log("\n🔍 Testing Performance...");
  
  try {
    // Embedding generation speed
    const embeddingStart = Date.now();
    await generateEmbedding({ text: "Test performance" });
    const embeddingTime = Date.now() - embeddingStart;
    
    // Search speed
    const searchStart = Date.now();
    await semanticSearch({ query: "test", limit: 5 });
    const searchTime = Date.now() - searchStart;
    
    if (embeddingTime < 2000 && searchTime < 1000) {
      addResult("Performance", "pass", "Performance within acceptable limits", {
        embeddingMs: embeddingTime,
        searchMs: searchTime,
      });
    } else {
      addResult("Performance", "warn", "Performance slower than expected", {
        embeddingMs: embeddingTime,
        searchMs: searchTime,
      });
    }
  } catch (error) {
    addResult("Performance", "fail", `Error: ${error.message}`);
  }
}

/**
 * Main validation function
 */
async function runValidation() {
  console.log("🚀 Knowledge Base System Validation");
  console.log("=====================================\n");
  
  await testSystemHealth();
  await testDatabaseStats();
  await testEmbeddingGeneration();
  await testEmbeddingConsistency();
  await testSemanticSimilarity();
  await testDocumentIngestion();
  await testSemanticSearch();
  await testRAGContext();
  await testSearchAccuracy();
  await testPerformance();
  
  // Summary
  console.log("\n📊 Validation Summary");
  console.log("=====================\n");
  
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const warned = results.filter((r) => r.status === "warn").length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log(`📝 Total: ${results.length}\n`);
  
  if (failed === 0) {
    console.log("🎉 All critical tests passed!");
  } else {
    console.log("⚠️  Some tests failed. Review the results above.");
  }
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run validation
runValidation().catch((error) => {
  console.error("❌ Validation failed with error:", error);
  process.exit(1);
});

