/**
 * CEO Agent Knowledge Base Query Engine
 *
 * Provides query interface for CEO agent to access knowledge base
 * Built on LlamaIndex with OpenAI embeddings
 *
 * @module app/services/rag/ceo-knowledge-base
 */

import {
  VectorStoreIndex,
  storageContextFromDefaults,
  Settings,
  BaseEmbedding,
  SimilarityPostprocessor,
} from "llamaindex";
import { OpenAI } from "@llamaindex/openai";
import OpenAIClient from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

export interface QueryResult {
  answer: string;
  sources: Array<{
    document: string;
    relevance: number;
    snippet?: string;
  }>;
  confidence: "high" | "medium" | "low";
  // AI-KNOWLEDGE-012: Performance metrics
  metrics?: QueryMetrics;
}

export interface QueryOptions {
  similarityTopK?: number;
  includeSnippets?: boolean;
  // AI-KNOWLEDGE-012: Category filtering support
  category?:
    | "returns"
    | "shipping"
    | "tracking"
    | "exchanges"
    | "faq"
    | "troubleshooting";
  // AI-KNOWLEDGE-012: Priority filtering support
  priority?: "high" | "medium" | "low";
}

// AI-KNOWLEDGE-012: Performance metrics tracking
export interface QueryMetrics {
  queryTime: number;
  retrievalTime: number;
  synthesisTime: number;
  chunksRetrieved: number;
  chunksAfterFilter: number;
}

/**
 * Load OpenAI API key from vault
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

  // Fallback to environment variable
  const envKey = process.env.OPENAI_API_KEY;
  if (!envKey) {
    throw new Error(
      "OpenAI API key not found in vault or environment variables",
    );
  }
  return envKey;
}

/**
 * Custom OpenAI Embedding Provider (matches pattern from build-index.ts)
 */
class OpenAIEmbeddingProvider extends BaseEmbedding {
  private readonly client: OpenAIClient;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    super();
    this.client = new OpenAIClient({ apiKey });
    this.model = model;
  }

  async getTextEmbedding(text: string) {
    const input = text.length > 8000 ? text.slice(0, 8000) : text;
    const response = await this.client.embeddings.create({
      model: this.model,
      input,
    });
    const embedding = response.data?.[0]?.embedding;
    if (!embedding) {
      throw new Error("OpenAI embedding response missing vector data.");
    }
    return embedding;
  }
}

/**
 * Initialize query engine (cached singleton)
 */
let queryEngineCache: Awaited<ReturnType<typeof initializeQueryEngine>> | null =
  null;

async function initializeQueryEngine() {
  const apiKey = await loadOpenAIKey();

  // Configure OpenAI LLM (required for query engine response synthesis)
  // P4: Temperature set to 0 for fully deterministic responses
  Settings.llm = new OpenAI({
    apiKey,
    model: "gpt-3.5-turbo",
    temperature: 0, // Fully deterministic (was 0.1)
  });

  // Configure OpenAI embeddings (same as build-index.ts)
  Settings.embedModel = new OpenAIEmbeddingProvider(
    apiKey,
    "text-embedding-3-small",
  );

  // Load existing vector store
  const persistDir = path.join(
    PROJECT_ROOT,
    "packages/memory/indexes/operator_knowledge",
  );

  const storageContext = await storageContextFromDefaults({
    persistDir,
  });

  // Create index from storage
  const index = await VectorStoreIndex.init({
    storageContext,
  });

  // AI-KNOWLEDGE-010: Create similarity postprocessor for filtering low-relevance nodes
  // From Context7 docs: Filter nodes below similarity cutoff threshold
  const similarityProcessor = new SimilarityPostprocessor({
    similarityCutoff: 0.65, // Tested: 0.5, 0.65, 0.75 (0.65 = balanced)
  });

  // Create query engine with optimized settings
  // P1: similarityTopK=3 (optimal - more chunks adds noise/contradictions)
  // P4: Temperature 0 (fully deterministic) for consistency
  // AI-KNOWLEDGE-010: Node postprocessor for relevance filtering
  const queryEngine = index.asQueryEngine({
    similarityTopK: 3, // Retrieve 3 chunks, filter by similarity
    nodePostprocessors: [similarityProcessor], // Filter low-relevance nodes
  });

  return { queryEngine, index };
}

/**
 * Query the knowledge base for CEO agent
 *
 * @example
 * const result = await queryKnowledgeBase("What's our return policy for damaged items?");
 * console.log(result.answer);
 * console.log(result.sources);
 */
export async function queryKnowledgeBase(
  query: string,
  options: QueryOptions = {},
): Promise<QueryResult> {
  const {
    similarityTopK = 3,
    includeSnippets = true,
    category,
    priority,
  } = options;

  // AI-KNOWLEDGE-012: Performance tracking
  const startTime = Date.now();

  // Initialize or reuse cached query engine
  if (!queryEngineCache) {
    queryEngineCache = await initializeQueryEngine();
  }

  const { queryEngine } = queryEngineCache;
  const retrievalStart = Date.now();

  // Execute query
  // Note: Category/priority filtering would require dynamic query engine per filter
  // Current implementation uses cached engine for performance
  // TODO: Implement per-category engines for filtered queries
  const response = await queryEngine.query({
    query,
  });

  const retrievalTime = Date.now() - retrievalStart;

  // Extract sources from response metadata
  const sources: QueryResult["sources"] = [];
  let chunksBeforeFilter = 0;

  if (response.sourceNodes) {
    chunksBeforeFilter = response.sourceNodes.length;

    for (const node of response.sourceNodes) {
      // AI-KNOWLEDGE-012: Optional filtering by category/priority
      const nodeCategory = node.node.metadata?.category;
      const nodePriority = node.node.metadata?.priority;

      // Apply post-query filtering if specified
      if (category && nodeCategory !== category) continue;
      if (priority && nodePriority !== priority) continue;

      sources.push({
        document: node.node.metadata?.file_name || "unknown",
        relevance: node.score || 0,
        snippet: includeSnippets
          ? node.node.getContent().slice(0, 200)
          : undefined,
      });
    }
  }

  // Calculate confidence based on relevance scores
  const avgRelevance =
    sources.length > 0
      ? sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length
      : 0;

  let confidence: QueryResult["confidence"];
  if (avgRelevance >= 0.8) {
    confidence = "high";
  } else if (avgRelevance >= 0.6) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  // AI-KNOWLEDGE-012: Calculate metrics
  const totalTime = Date.now() - startTime;
  const synthesisTime = totalTime - retrievalTime;

  const metrics: QueryMetrics = {
    queryTime: totalTime,
    retrievalTime,
    synthesisTime,
    chunksRetrieved: chunksBeforeFilter,
    chunksAfterFilter: sources.length,
  };

  return {
    answer: response.response,
    sources,
    confidence,
    metrics,
  };
}

/**
 * Test queries for CEO agent knowledge base
 * Run with: npx tsx app/services/rag/ceo-knowledge-base.ts
 */
async function testQueries() {
  console.log("🧪 Testing CEO Knowledge Base Query Engine\\n");

  const testQueries = [
    "What's our return policy for damaged items?",
    "How do I process a refund for order #12345?",
    "What's the escalation process for VIP customers?",
    "How long does shipping take?",
  ];

  for (const query of testQueries) {
    console.log(`\\n📝 Query: "${query}"`);
    console.log("⏱️  Processing...\\n");

    try {
      const result = await queryKnowledgeBase(query);

      console.log(`✅ Answer (${result.confidence} confidence):`);
      console.log(result.answer);
      console.log(`\\n📚 Sources (${result.sources.length}):`);
      result.sources.forEach((source, idx) => {
        console.log(
          `  ${idx + 1}. ${source.document} (relevance: ${(source.relevance * 100).toFixed(1)}%)`,
        );
        if (source.snippet) {
          console.log(`     "${source.snippet}..."`);
        }
      });
    } catch (error) {
      console.error(`❌ Error:`, (error as Error).message);
    }

    console.log("\\n" + "=".repeat(80));
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testQueries().catch(console.error);
}
