/**
 * OpenAI Embedding Service - PRODUCTION
 * Credentials: vault/occ/openai/api_key_staging.env
 */

import type { EmbeddingOptions } from "./types";

const DEFAULT_MODEL = "text-embedding-3-small";
const DEFAULT_DIMENSIONS = 1536;
const MAX_TOKENS = 8000;

function getOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY not set. Load: export $(grep -v '^#' vault/occ/openai/api_key_staging.env | xargs)",
    );
  }
  return key;
}

export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {},
): Promise<number[]> {
  const model = options.model || DEFAULT_MODEL;
  const dimensions = options.dimensions || DEFAULT_DIMENSIONS;
  const maxTokens = options.maxTokens || MAX_TOKENS;

  const truncatedText =
    text.length > maxTokens * 4 ? text.slice(0, maxTokens * 4) : text;

  try {
    const apiKey = getOpenAIKey();

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: truncatedText,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || [];
  } catch (error) {
    console.error(
      "Embedding failed:",
      error instanceof Error ? error.message : "Unknown",
    );
    throw error;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Embedding dimensions must match");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
