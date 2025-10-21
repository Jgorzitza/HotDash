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
}

export interface QueryOptions {
  similarityTopK?: number;
  includeSnippets?: boolean;
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

  // Create query engine with optimized settings
  // P1: similarityTopK=3 (optimal - more chunks adds noise/contradictions)
  // P2: Chunk overlap (50 tokens) improves context without adding noise
  // P4: Temperature 0 (fully deterministic) for consistency
  const queryEngine = index.asQueryEngine({
    similarityTopK: 3, // Keep at 3 - chunk overlap provides better coverage
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
  const { similarityTopK = 3, includeSnippets = true } = options;

  // Initialize or reuse cached query engine
  if (!queryEngineCache) {
    queryEngineCache = await initializeQueryEngine();
  }

  const { queryEngine } = queryEngineCache;

  // Execute query
  const response = await queryEngine.query({
    query,
  });

  // Extract sources from response metadata
  const sources: QueryResult["sources"] = [];

  if (response.sourceNodes) {
    for (const node of response.sourceNodes) {
      sources.push({
        document: node.node.metadata?.file_name || "unknown",
        relevance: node.score || 0,
        snippet: includeSnippets ? node.node.getContent().slice(0, 200) : undefined,
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

  return {
    answer: response.response,
    sources,
    confidence,
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

