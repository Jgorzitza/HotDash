#!/usr/bin/env tsx
/**
 * Semantic Evaluation Suite for RAG Knowledge Base
 *
 * Uses LlamaIndex evaluators for proper semantic validation:
 * - CorrectnessEvaluator: Validates against ground-truth answers
 * - FaithfulnessEvaluator: Checks citation accuracy
 * - RelevancyEvaluator: Validates semantic relevance
 *
 * Based on Context7 docs: /run-llama/llamaindexts evaluation module
 *
 * Usage:
 *   npx tsx scripts/rag/semantic-evaluation.ts
 *   npx tsx scripts/rag/semantic-evaluation.ts --verbose
 */

import {
  CorrectnessEvaluator,
  FaithfulnessEvaluator,
  RelevancyEvaluator,
  Settings,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";
import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import fs from "node:fs/promises";
import path from "node:path";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

interface GroundTruthTest {
  query: string;
  referenceAnswer: string;
  category: string;
  description: string;
}

interface SemanticTestResult {
  query: string;
  category: string;
  actualAnswer: string;
  referenceAnswer: string;
  correctnessScore: number;
  correctnessPassing: boolean;
  faithfulnessPassing: boolean;
  relevancyPassing: boolean;
  responseTime: number;
  error?: string;
}

interface SemanticBenchmark {
  totalTests: number;
  passed: number;
  failed: number;
  avgCorrectnessScore: number;
  avgResponseTime: number;
  faithfulnessRate: number;
  relevancyRate: number;
  results: SemanticTestResult[];
}

/**
 * Ground-truth test cases with reference answers
 * These represent the ACTUAL correct answers from documents
 */
const GROUND_TRUTH_TESTS: GroundTruthTest[] = [
  {
    query: "What is your return policy for damaged items?",
    referenceAnswer:
      "Items damaged during shipping can be returned for free within 30 days without a restocking fee. The return shipping is covered by us for damaged items.",
    category: "returns",
    description: "Damaged item return policy",
  },
  {
    query: "How long do I have to return an item?",
    referenceAnswer:
      "You have 30 days from the delivery date to return items. Items must be unused, in original packaging, with tags attached, and include the original receipt or order confirmation.",
    category: "returns",
    description: "Return time window",
  },
  {
    query: "What is the restocking fee for returns?",
    referenceAnswer:
      "The restocking fee is 15% of the purchase price for standard returns (non-defective items, items missing packaging, or returns without accessories). There is no restocking fee for defective items, wrong items sent (our error), or items damaged in shipping. Used or installed products cannot be refunded for safety reasons.",
    category: "returns",
    description: "Restocking fee policy",
  },
  {
    query: "How long does standard shipping take?",
    referenceAnswer:
      "Standard shipping (USPS/UPS Ground) takes 5-7 business days after order processing. Processing time is 1-2 business days.",
    category: "shipping",
    description: "Standard shipping timeline",
  },
  {
    query: "Do you offer expedited shipping?",
    referenceAnswer:
      "Yes, we offer expedited shipping via UPS 2-Day which delivers in 2-3 business days after processing. Processing time is 1 business day.",
    category: "shipping",
    description: "Expedited shipping availability",
  },
  {
    query: "What are your shipping costs?",
    referenceAnswer:
      "Standard shipping costs $8.95 for orders under $75. Orders $75 and over receive free standard shipping. Expedited shipping costs $18.95, and overnight shipping costs $35.95.",
    category: "shipping",
    description: "Shipping cost structure",
  },
  {
    query: "How can I track my order?",
    referenceAnswer:
      "You will receive a tracking number via email once your order ships. You can use this tracking number on the carrier's website to monitor your shipment status.",
    category: "tracking",
    description: "Order tracking process",
  },
  {
    query: "Can I exchange an item for a different size?",
    referenceAnswer:
      "Yes, exchanges are free within 30 days of delivery. Items must be unused, in original condition with tags attached. Contact customer support to initiate an exchange.",
    category: "exchanges",
    description: "Exchange eligibility",
  },
  {
    query: "What payment methods do you accept?",
    referenceAnswer:
      "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay for online orders.",
    category: "faq",
    description: "Accepted payment methods",
  },
  {
    query: "Can I cancel my order after placing it?",
    referenceAnswer:
      "Orders can be cancelled before they ship. Contact customer support immediately if you need to cancel. Once an order has shipped, you will need to follow the return process instead.",
    category: "faq",
    description: "Order cancellation policy",
  },
];

/**
 * Load OpenAI API key
 */
async function loadOpenAIKey(): Promise<string> {
  const vaultPath = path.join(
    PROJECT_ROOT,
    "vault/occ/openai/api_key_staging.env",
  );

  try {
    const content = await fs.readFile(vaultPath, "utf-8");
    const match = content.match(/OPENAI_API_KEY=(.+)/);
    if (match) {
      return match[1].trim();
    }
  } catch (error) {
    console.error(
      "⚠️  Could not load OpenAI key from vault:",
      (error as Error).message,
    );
  }

  const envKey = process.env.OPENAI_API_KEY;
  if (!envKey) {
    throw new Error(
      "OpenAI API key not found in vault or environment variables",
    );
  }
  return envKey;
}

/**
 * Initialize query engine from existing index
 */
async function initializeQueryEngine() {
  const persistDir = path.join(
    PROJECT_ROOT,
    "packages/memory/indexes/operator_knowledge",
  );

  const storageContext = await storageContextFromDefaults({
    persistDir,
  });

  const index = await VectorStoreIndex.init({
    storageContext,
  });

  return index.asQueryEngine({
    similarityTopK: 3,
  });
}

/**
 * Run semantic evaluation test
 */
async function runSemanticTest(
  test: GroundTruthTest,
  queryEngine: any,
  correctnessEval: CorrectnessEvaluator,
  faithfulnessEval: FaithfulnessEvaluator,
  relevancyEval: RelevancyEvaluator,
  verbose: boolean = false,
): Promise<SemanticTestResult> {
  const startTime = Date.now();

  try {
    // Query the knowledge base
    const queryResponse = await queryEngine.query({
      query: test.query,
    });

    const responseTime = Date.now() - startTime;
    const actualAnswer = queryResponse.response;

    if (verbose) {
      console.log(`\n📝 Query: "${test.query}"`);
      console.log(`   Category: ${test.category}`);
      console.log(`   Description: ${test.description}`);
    }

    // Evaluate correctness against ground truth
    // Pass the full query response object
    const correctnessResult = await correctnessEval.evaluateResponse({
      query: test.query,
      response: queryResponse,
      reference: test.referenceAnswer,
    });

    if (verbose) {
      console.log(
        `   Correctness Score: ${(correctnessResult.score * 100).toFixed(1)}%`,
      );
      console.log(
        `   Correctness: ${correctnessResult.passing ? "✅ PASS" : "❌ FAIL"}`,
      );
    }

    // Evaluate faithfulness (does response match retrieved context?)
    const faithfulnessResult = await faithfulnessEval.evaluateResponse({
      query: test.query,
      response: queryResponse,
    });

    if (verbose) {
      console.log(
        `   Faithfulness: ${faithfulnessResult.passing ? "✅ PASS" : "❌ FAIL"}`,
      );
    }

    // Evaluate relevancy
    const relevancyResult = await relevancyEval.evaluateResponse({
      query: test.query,
      response: queryResponse,
    });

    if (verbose) {
      console.log(
        `   Relevancy: ${relevancyResult.passing ? "✅ PASS" : "❌ FAIL"}`,
      );
      console.log(`   Response Time: ${responseTime}ms`);
      console.log(`   Actual: ${actualAnswer.slice(0, 150)}...`);
      console.log(`   Reference: ${test.referenceAnswer.slice(0, 150)}...`);
    }

    return {
      query: test.query,
      category: test.category,
      actualAnswer,
      referenceAnswer: test.referenceAnswer,
      correctnessScore: correctnessResult.score,
      correctnessPassing: correctnessResult.passing,
      faithfulnessPassing: faithfulnessResult.passing,
      relevancyPassing: relevancyResult.passing,
      responseTime,
    };
  } catch (error) {
    return {
      query: test.query,
      category: test.category,
      actualAnswer: "",
      referenceAnswer: test.referenceAnswer,
      correctnessScore: 0,
      correctnessPassing: false,
      faithfulnessPassing: false,
      relevancyPassing: false,
      responseTime: Date.now() - startTime,
      error: (error as Error).message,
    };
  }
}

/**
 * Generate semantic benchmark summary
 */
function generateSemanticSummary(
  results: SemanticTestResult[],
): SemanticBenchmark {
  const passed = results.filter(
    (r) => r.correctnessPassing && r.faithfulnessPassing && r.relevancyPassing,
  ).length;

  const avgCorrectnessScore =
    results.reduce((sum, r) => sum + r.correctnessScore, 0) / results.length;

  const avgResponseTime =
    results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

  const faithfulnessRate =
    results.filter((r) => r.faithfulnessPassing).length / results.length;

  const relevancyRate =
    results.filter((r) => r.relevancyPassing).length / results.length;

  return {
    totalTests: results.length,
    passed,
    failed: results.length - passed,
    avgCorrectnessScore,
    avgResponseTime,
    faithfulnessRate,
    relevancyRate,
    results,
  };
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose") || args.includes("-v");

  console.log("🧪 Semantic Evaluation Suite (LlamaIndex Evaluators)\n");
  console.log(`Total Ground-Truth Tests: ${GROUND_TRUTH_TESTS.length}`);
  console.log(
    `Categories: ${new Set(GROUND_TRUTH_TESTS.map((t) => t.category)).size}`,
  );
  console.log(`Verbose Mode: ${verbose ? "ON" : "OFF"}`);
  console.log("\nEvaluators:");
  console.log("  - CorrectnessEvaluator: Validates against ground-truth");
  console.log("  - FaithfulnessEvaluator: Checks citation accuracy");
  console.log("  - RelevancyEvaluator: Validates semantic relevance\n");

  // Load API key and configure Settings
  const apiKey = await loadOpenAIKey();

  // Configure LLM for evaluators (using GPT-3.5-turbo for speed)
  // Context7 docs recommend GPT-4 but 3.5-turbo is faster and sufficient
  Settings.llm = new OpenAI({
    apiKey,
    model: "gpt-3.5-turbo",
    temperature: 0.1,
  });

  // Configure embedding model (required for loading index)
  Settings.embedModel = new OpenAIEmbedding({
    apiKey,
    model: "text-embedding-3-small",
  });

  // Initialize query engine
  console.log("⏱️  Loading knowledge base...");
  const queryEngine = await initializeQueryEngine();
  console.log("✅ Knowledge base loaded\n");

  // Initialize evaluators
  const correctnessEval = new CorrectnessEvaluator();
  const faithfulnessEval = new FaithfulnessEvaluator();
  const relevancyEval = new RelevancyEvaluator();

  console.log("🔬 Running semantic tests...\n");

  // Run all tests
  const results: SemanticTestResult[] = [];
  for (let i = 0; i < GROUND_TRUTH_TESTS.length; i++) {
    const test = GROUND_TRUTH_TESTS[i];
    if (!verbose) {
      process.stdout.write(
        `  [${i + 1}/${GROUND_TRUTH_TESTS.length}] ${test.category}...`,
      );
    }

    const result = await runSemanticTest(
      test,
      queryEngine,
      correctnessEval,
      faithfulnessEval,
      relevancyEval,
      verbose,
    );
    results.push(result);

    if (!verbose) {
      const passed =
        result.correctnessPassing &&
        result.faithfulnessPassing &&
        result.relevancyPassing;
      console.log(passed ? " ✅" : " ❌");
    }
  }

  // Generate summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 SEMANTIC EVALUATION SUMMARY");
  console.log("=".repeat(80) + "\n");

  const summary = generateSemanticSummary(results);

  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(
    `Fully Passed: ${summary.passed} (${((summary.passed / summary.totalTests) * 100).toFixed(1)}%)`,
  );
  console.log(`Failed: ${summary.failed}`);
  console.log(`\nSemantic Metrics:`);
  console.log(
    `  Avg Correctness Score: ${(summary.avgCorrectnessScore * 100).toFixed(1)}%`,
  );
  console.log(
    `  Faithfulness Rate: ${(summary.faithfulnessRate * 100).toFixed(1)}%`,
  );
  console.log(`  Relevancy Rate: ${(summary.relevancyRate * 100).toFixed(1)}%`);
  console.log(`  Avg Response Time: ${summary.avgResponseTime.toFixed(0)}ms`);

  // Category breakdown
  const categoryStats: Record<string, { passed: number; total: number }> = {};
  for (const result of results) {
    if (!categoryStats[result.category]) {
      categoryStats[result.category] = { passed: 0, total: 0 };
    }
    categoryStats[result.category].total++;
    if (
      result.correctnessPassing &&
      result.faithfulnessPassing &&
      result.relevancyPassing
    ) {
      categoryStats[result.category].passed++;
    }
  }

  console.log(`\nCategory Breakdown:`);
  for (const [category, stats] of Object.entries(categoryStats)) {
    const catAccuracy = (stats.passed / stats.total) * 100;
    console.log(
      `  ${category}: ${stats.passed}/${stats.total} (${catAccuracy.toFixed(1)}%)`,
    );
  }

  // Benchmark targets
  console.log(`\n📋 Quality Targets:`);
  console.log(
    `  Correctness: ≥80% (${summary.avgCorrectnessScore >= 0.8 ? "✅ PASS" : "❌ FAIL"})`,
  );
  console.log(
    `  Faithfulness: ≥90% (${summary.faithfulnessRate >= 0.9 ? "✅ PASS" : "❌ FAIL"})`,
  );
  console.log(
    `  Relevancy: ≥90% (${summary.relevancyRate >= 0.9 ? "✅ PASS" : "❌ FAIL"})`,
  );
  console.log(
    `  Response Time: <2000ms (${summary.avgResponseTime < 2000 ? "✅ PASS" : "❌ FAIL"})`,
  );

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsPath = path.join(
    PROJECT_ROOT,
    "packages/memory/logs/build",
    `semantic-eval-${timestamp}.json`,
  );

  await fs.mkdir(path.dirname(resultsPath), { recursive: true });
  await fs.writeFile(
    resultsPath,
    JSON.stringify({ summary, timestamp: new Date().toISOString() }, null, 2),
  );

  console.log(`\n💾 Results saved to: ${resultsPath}`);
  console.log("\n🎉 Semantic evaluation complete!");

  // Exit with appropriate code
  const qualityPassed =
    summary.avgCorrectnessScore >= 0.8 &&
    summary.faithfulnessRate >= 0.9 &&
    summary.relevancyRate >= 0.9;

  process.exit(qualityPassed ? 0 : 1);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export { runSemanticTest, generateSemanticSummary, GROUND_TRUTH_TESTS };
