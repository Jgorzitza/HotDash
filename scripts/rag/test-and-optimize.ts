#!/usr/bin/env tsx
/**
 * RAG Knowledge Base Test & Optimization Suite
 *
 * Tests query accuracy, relevance, and response time for the CEO knowledge base
 * Provides benchmarking data for optimization decisions
 *
 * Usage:
 *   npx tsx scripts/rag/test-and-optimize.ts
 *   npx tsx scripts/rag/test-and-optimize.ts --verbose
 */

import {
  queryKnowledgeBase,
  type QueryResult,
} from "../../app/services/rag/ceo-knowledge-base";
import fs from "node:fs/promises";
import path from "node:path";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

interface TestQuery {
  query: string;
  category: string;
  expectedKeywords: string[];
  expectedConfidence: "high" | "medium" | "low";
}

interface TestResult {
  query: string;
  category: string;
  passed: boolean;
  responseTime: number;
  hasAnswer: boolean;
  confidence: string;
  keywordsFound: number;
  keywordsTotal: number;
  sources: number;
  answer: string;
  error?: string;
}

interface BenchmarkSummary {
  totalTests: number;
  passed: number;
  failed: number;
  accuracy: number;
  avgResponseTime: number;
  answerRate: number;
  avgKeywordMatch: number;
  categoryCoverage: Record<string, { passed: number; total: number }>;
}

/**
 * 20-query test suite covering all document types
 */
const TEST_QUERIES: TestQuery[] = [
  // Return Policy (refund-policy.md)
  {
    query: "What is your return policy for damaged items?",
    category: "returns",
    expectedKeywords: ["damaged", "return", "free", "30 days"],
    expectedConfidence: "medium",
  },
  {
    query: "How long do I have to return an item?",
    category: "returns",
    expectedKeywords: ["30 days", "receipt", "unused"],
    expectedConfidence: "high",
  },
  {
    query: "Do you charge a restocking fee for returns?",
    category: "returns",
    expectedKeywords: ["restocking fee", "15%", "damaged", "defective"],
    expectedConfidence: "medium",
  },
  {
    query: "Can I get a refund without a receipt?",
    category: "returns",
    expectedKeywords: ["receipt", "order number", "email"],
    expectedConfidence: "medium",
  },

  // Shipping Policy (shipping-policy.md)
  {
    query: "How long does standard shipping take?",
    category: "shipping",
    expectedKeywords: ["5-7 business days", "standard", "shipping"],
    expectedConfidence: "high",
  },
  {
    query: "Do you offer expedited shipping?",
    category: "shipping",
    expectedKeywords: ["expedited", "2-3 business days", "express"],
    expectedConfidence: "high",
  },
  {
    query: "What are your shipping costs?",
    category: "shipping",
    expectedKeywords: ["free shipping", "$50", "standard"],
    expectedConfidence: "medium",
  },
  {
    query: "Do you ship internationally?",
    category: "shipping",
    expectedKeywords: ["international", "shipping", "rates vary"],
    expectedConfidence: "medium",
  },

  // Order Tracking (order-tracking.md)
  {
    query: "How can I track my order?",
    category: "tracking",
    expectedKeywords: ["tracking number", "email", "order status"],
    expectedConfidence: "high",
  },
  {
    query: "My tracking number doesn't work, what should I do?",
    category: "tracking",
    expectedKeywords: ["24 hours", "tracking", "update", "support"],
    expectedConfidence: "medium",
  },
  {
    query: "How do I know when my order has shipped?",
    category: "tracking",
    expectedKeywords: ["email", "tracking number", "shipped"],
    expectedConfidence: "high",
  },

  // Exchange Process (exchange-process.md)
  {
    query: "Can I exchange an item for a different size?",
    category: "exchanges",
    expectedKeywords: ["exchange", "size", "30 days", "unused"],
    expectedConfidence: "medium",
  },
  {
    query: "How do I start an exchange?",
    category: "exchanges",
    expectedKeywords: ["contact", "support", "order number", "exchange"],
    expectedConfidence: "high",
  },
  {
    query: "Is there a fee for exchanges?",
    category: "exchanges",
    expectedKeywords: ["free", "exchange", "shipping"],
    expectedConfidence: "medium",
  },

  // Product Troubleshooting (product-troubleshooting.md)
  {
    query: "My product isn't working correctly, what should I do?",
    category: "troubleshooting",
    expectedKeywords: ["troubleshooting", "warranty", "support"],
    expectedConfidence: "low",
  },
  {
    query: "How do I clean and maintain my product?",
    category: "troubleshooting",
    expectedKeywords: ["clean", "maintain", "care instructions"],
    expectedConfidence: "medium",
  },

  // Common Questions (common-questions-faq.md)
  {
    query: "What payment methods do you accept?",
    category: "faq",
    expectedKeywords: ["payment", "credit card", "PayPal"],
    expectedConfidence: "high",
  },
  {
    query: "Do you have a customer service phone number?",
    category: "faq",
    expectedKeywords: ["support", "contact", "email", "phone"],
    expectedConfidence: "medium",
  },
  {
    query: "Can I cancel my order?",
    category: "faq",
    expectedKeywords: ["cancel", "order", "before ships"],
    expectedConfidence: "medium",
  },
  {
    query: "How secure is my personal information?",
    category: "faq",
    expectedKeywords: ["secure", "privacy", "encrypted"],
    expectedConfidence: "low",
  },
];

/**
 * Check if answer contains expected keywords
 */
function checkKeywords(
  answer: string,
  keywords: string[],
): {
  found: number;
  total: number;
  percentage: number;
} {
  const lowerAnswer = answer.toLowerCase();
  const found = keywords.filter((keyword) =>
    lowerAnswer.includes(keyword.toLowerCase()),
  ).length;

  return {
    found,
    total: keywords.length,
    percentage: (found / keywords.length) * 100,
  };
}

/**
 * Run a single test query
 */
async function runTest(
  testQuery: TestQuery,
  verbose: boolean = false,
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    // Query the knowledge base
    const result: QueryResult = await queryKnowledgeBase(testQuery.query);
    const responseTime = Date.now() - startTime;

    // Check if we got an answer
    const hasAnswer = result.answer.length > 20; // At least 20 characters

    // Check keyword matches
    const keywordCheck = checkKeywords(
      result.answer,
      testQuery.expectedKeywords,
    );

    // Determine if test passed
    // Pass criteria: has answer AND at least 50% of keywords found
    const passed = hasAnswer && keywordCheck.percentage >= 50;

    if (verbose) {
      console.log(`\n📝 Query: "${testQuery.query}"`);
      console.log(`   Category: ${testQuery.category}`);
      console.log(`   Has Answer: ${hasAnswer ? "✅ YES" : "❌ NO"}`);
      console.log(
        `   Keywords: ${keywordCheck.found}/${keywordCheck.total} (${keywordCheck.percentage.toFixed(1)}%)`,
      );
      console.log(`   Confidence: ${result.confidence}`);
      console.log(`   Response Time: ${responseTime}ms`);
      console.log(`   Sources: ${result.sources.length}`);
      console.log(`   Answer: ${result.answer.slice(0, 150)}...`);
    }

    return {
      query: testQuery.query,
      category: testQuery.category,
      passed,
      responseTime,
      hasAnswer,
      confidence: result.confidence,
      keywordsFound: keywordCheck.found,
      keywordsTotal: keywordCheck.total,
      sources: result.sources.length,
      answer: result.answer,
    };
  } catch (error) {
    return {
      query: testQuery.query,
      category: testQuery.category,
      passed: false,
      responseTime: Date.now() - startTime,
      hasAnswer: false,
      confidence: "low",
      keywordsFound: 0,
      keywordsTotal: testQuery.expectedKeywords.length,
      sources: 0,
      answer: "",
      error: (error as Error).message,
    };
  }
}

/**
 * Generate benchmark summary
 */
function generateSummary(results: TestResult[]): BenchmarkSummary {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  const avgResponseTime =
    results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

  const answerRate = results.filter((r) => r.hasAnswer).length / results.length;

  const avgKeywordMatch =
    results.reduce((sum, r) => (r.keywordsFound / r.keywordsTotal) * 100, 0) /
    results.length;

  // Category breakdown
  const categoryCoverage: Record<string, { passed: number; total: number }> =
    {};
  for (const result of results) {
    if (!categoryCoverage[result.category]) {
      categoryCoverage[result.category] = { passed: 0, total: 0 };
    }
    categoryCoverage[result.category].total++;
    if (result.passed) {
      categoryCoverage[result.category].passed++;
    }
  }

  return {
    totalTests: results.length,
    passed,
    failed,
    accuracy: (passed / results.length) * 100,
    avgResponseTime,
    answerRate: answerRate * 100,
    avgKeywordMatch,
    categoryCoverage,
  };
}

/**
 * Main test execution
 */
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose") || args.includes("-v");

  console.log("🧪 RAG Knowledge Base Test Suite\n");
  console.log(`Total Test Queries: ${TEST_QUERIES.length}`);
  console.log(
    `Categories: ${new Set(TEST_QUERIES.map((t) => t.category)).size}`,
  );
  console.log(`Verbose Mode: ${verbose ? "ON" : "OFF"}\n`);

  console.log("⏱️  Running tests...\n");

  // Run all tests
  const results: TestResult[] = [];
  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const testQuery = TEST_QUERIES[i];
    if (!verbose) {
      process.stdout.write(
        `  [${i + 1}/${TEST_QUERIES.length}] ${testQuery.category}...`,
      );
    }

    const result = await runTest(testQuery, verbose);
    results.push(result);

    if (!verbose) {
      console.log(result.passed ? " ✅" : " ❌");
    }
  }

  // Generate summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 BENCHMARK SUMMARY");
  console.log("=".repeat(80) + "\n");

  const summary = generateSummary(results);

  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(`Passed: ${summary.passed} (${summary.accuracy.toFixed(1)}%)`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`\nPerformance:`);
  console.log(`  Avg Response Time: ${summary.avgResponseTime.toFixed(0)}ms`);
  console.log(`  Answer Rate: ${summary.answerRate.toFixed(1)}%`);
  console.log(`  Keyword Match Rate: ${summary.avgKeywordMatch.toFixed(1)}%`);

  console.log(`\nCategory Breakdown:`);
  for (const [category, stats] of Object.entries(summary.categoryCoverage)) {
    const catAccuracy = (stats.passed / stats.total) * 100;
    console.log(
      `  ${category}: ${stats.passed}/${stats.total} (${catAccuracy.toFixed(1)}%)`,
    );
  }

  // Evaluation against benchmarks (from direction file)
  console.log(`\n📋 Benchmark Targets (from direction):`);
  console.log(
    `  Response Time: <2000ms (${summary.avgResponseTime < 2000 ? "✅ PASS" : "❌ FAIL"})`,
  );
  console.log(
    `  Accuracy: ≥90% (${summary.accuracy >= 90 ? "✅ PASS" : "❌ FAIL"})`,
  );
  console.log(
    `  Answer Rate: ≥90% (${summary.answerRate >= 90 ? "✅ PASS" : "❌ FAIL"})`,
  );

  // Save results to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsPath = path.join(
    PROJECT_ROOT,
    "packages/memory/logs/build",
    `test-results-${timestamp}.json`,
  );

  await fs.mkdir(path.dirname(resultsPath), { recursive: true });
  await fs.writeFile(
    resultsPath,
    JSON.stringify(
      { summary, results, timestamp: new Date().toISOString() },
      null,
      2,
    ),
  );

  console.log(`\n💾 Full results saved to: ${resultsPath}`);

  console.log("\n🎉 Test suite complete!");

  // Exit with appropriate code
  process.exit(summary.accuracy >= 90 ? 0 : 1);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export {
  runTest,
  generateSummary,
  TEST_QUERIES,
  type TestResult,
  type BenchmarkSummary,
};
