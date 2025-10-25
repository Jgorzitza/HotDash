/**
 * Knowledge Base Quality Metrics
 * AI-KNOWLEDGE-014: KB Quality Metrics
 *
 * Measures knowledge base health and quality
 *
 * @module app/services/rag/kb-metrics
 */

import fs from "node:fs/promises";
import path from "node:path";

const LLAMAINDEX_MCP_URL =
  process.env.LLAMAINDEX_MCP_URL || "https://hotdash-llamaindex-mcp.fly.dev/mcp";

const PROJECT_ROOT = path.resolve(process.cwd());
const INDEX_DIR = path.join(
  PROJECT_ROOT,
  "packages/memory/indexes/operator_knowledge",
);
const SUPPORT_DIR = path.join(PROJECT_ROOT, "data/support");

export interface KBHealthScore {
  overall: number; // 0-100
  coverage: number; // 0-100
  performance: number; // 0-100
  accuracy: number; // 0-100 (from semantic eval if available)
  freshness: number; // 0-100
  details: {
    documentCount: number;
    indexSizeMB: number;
    avgQueryTime: number;
    indexAgeDays: number;
    categoryCoverage: string[];
  };
}

type QueryConfidence = "low" | "medium" | "high";

interface QuerySource {
  document: string;
  relevance: number;
  snippet?: string;
}

interface QueryMetrics {
  queryTime: number;
  retrievalTime: number;
  synthesisTime: number;
  chunksRetrieved: number;
  chunksAfterFilter: number;
}

interface QueryResult {
  answer: string;
  confidence: QueryConfidence;
  sources: QuerySource[];
  metrics: QueryMetrics;
}

/**
 * Calculate KB health score (0-100)
 */
export async function calculateHealthScore(): Promise<KBHealthScore> {
  // Load index metadata
  const metadataPath = path.join(INDEX_DIR, "index_metadata.json");
  let metadata: any = null;

  try {
    const content = await fs.readFile(metadataPath, "utf-8");
    metadata = JSON.parse(content);
  } catch {
    // Index not found
    return {
      overall: 0,
      coverage: 0,
      performance: 0,
      accuracy: 0,
      freshness: 0,
      details: {
        documentCount: 0,
        indexSizeMB: 0,
        avgQueryTime: 0,
        indexAgeDays: 999,
        categoryCoverage: [],
      },
    };
  }

  // Calculate metrics
  const documentCount = metadata.documentCount || 0;

  // Index size
  let indexSizeMB = 0;
  try {
    const vectorStoreStats = await fs.stat(
      path.join(INDEX_DIR, "vector_store.json"),
    );
    indexSizeMB = vectorStoreStats.size / 1024 / 1024;
  } catch {
    // Ignore
  }

  // Index age
  const buildDate = new Date(metadata.buildTime);
  const indexAgeDays = (Date.now() - buildDate.getTime()) / 1000 / 60 / 60 / 24;

  // Category coverage
  const categories = new Set(
    metadata.sources?.map((s: any) => getCategoryFromFilename(s.fileName)) ||
      [],
  );

  // Test query performance (3 sample queries)
  const sampleQueries = [
    "What is the return policy?",
    "How long does shipping take?",
    "How can I track my order?",
  ];

  let totalQueryTime = 0;
  let successfulQueries = 0;

  for (const query of sampleQueries) {
    try {
      const result = await queryKnowledgeBase(query);
      if (result.metrics) {
        totalQueryTime += result.metrics.queryTime;
        successfulQueries++;
      }
    } catch {
      // Query failed
    }
  }

  const avgQueryTime =
    successfulQueries > 0 ? totalQueryTime / successfulQueries : 0;

  // Calculate component scores

  // Coverage: Based on document count and categories
  // Target: 50+ documents, 6+ categories
  const coverageScore = Math.min(
    100,
    (documentCount / 50) * 50 + (categories.size / 6) * 50,
  );

  // Performance: Based on query time
  // Target: <2000ms (100 points), >5000ms (0 points)
  const performanceScore =
    avgQueryTime > 0
      ? Math.max(0, Math.min(100, 100 - (avgQueryTime - 1000) / 40))
      : 50;

  // Freshness: Based on index age
  // Target: <7 days (100 points), >30 days (0 points)
  const freshnessScore = Math.max(
    0,
    Math.min(100, 100 - (indexAgeDays / 30) * 100),
  );

  // Accuracy: Load from semantic eval if available
  let accuracyScore = 50; // Default
  try {
    const evalFiles = await fs.readdir(
      path.join(PROJECT_ROOT, "packages/memory/logs/build"),
    );
    const semanticEvals = evalFiles.filter((f) =>
      f.startsWith("semantic-eval-"),
    );

    if (semanticEvals.length > 0) {
      // Get most recent
      semanticEvals.sort().reverse();
      const latestEval = semanticEvals[0];
      const evalPath = path.join(
        PROJECT_ROOT,
        "packages/memory/logs/build",
        latestEval,
      );
      const evalData = JSON.parse(await fs.readFile(evalPath, "utf-8"));

      // Extract correctness (0-5 scale → 0-100)
      if (evalData.summary?.results) {
        const avgCorrectness =
          evalData.summary.results
            .map((r: any) => r.correctnessScore)
            .reduce((a: number, b: number) => a + b, 0) /
          evalData.summary.results.length;
        accuracyScore = (avgCorrectness / 5) * 100;
      }
    }
  } catch {
    // No semantic eval available
  }

  // Overall score: Weighted average
  const overall = Math.round(
    coverageScore * 0.3 +
      performanceScore * 0.2 +
      accuracyScore * 0.3 +
      freshnessScore * 0.2,
  );

  return {
    overall,
    coverage: Math.round(coverageScore),
    performance: Math.round(performanceScore),
    accuracy: Math.round(accuracyScore),
    freshness: Math.round(freshnessScore),
    details: {
      documentCount,
      indexSizeMB: Number(indexSizeMB.toFixed(2)),
      avgQueryTime: Math.round(avgQueryTime),
      indexAgeDays: Number(indexAgeDays.toFixed(1)),
      categoryCoverage: Array.from(categories),
    },
  };
}

async function queryKnowledgeBase(query: string, topK = 5): Promise<QueryResult> {
  const startTime = Date.now();

  const response = await fetch(`${LLAMAINDEX_MCP_URL}/tools/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "query_support",
      arguments: {
        q: query,
        topK,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `LlamaIndex MCP error: ${response.status} ${response.statusText}`,
    );
  }

  const data: any = await response.json();
  const primaryContent = data?.content?.[0]?.text;
  const answer =
    typeof primaryContent === "string" && primaryContent.trim().length > 0
      ? primaryContent.trim()
      : "No answer found in knowledge base.";

  const totalTime = Date.now() - startTime;

  const metrics: QueryMetrics = {
    queryTime: totalTime,
    retrievalTime: totalTime,
    synthesisTime: 0,
    chunksRetrieved: topK,
    chunksAfterFilter: answer === "No answer found in knowledge base." ? 0 : 1,
  };

  const confidence: QueryConfidence =
    answer === "No answer found in knowledge base." ? "low" : "medium";

  return {
    answer,
    confidence,
    sources: [],
    metrics,
  };
}

function getCategoryFromFilename(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("refund") || lower.includes("return")) return "returns";
  if (lower.includes("shipping")) return "shipping";
  if (lower.includes("tracking") || lower.includes("order")) return "tracking";
  if (lower.includes("exchange")) return "exchanges";
  if (lower.includes("faq") || lower.includes("question")) return "faq";
  if (lower.includes("troubleshoot") || lower.includes("product"))
    return "troubleshooting";
  return "general";
}
