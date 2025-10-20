/**
 * Knowledge Ingestion - PRODUCTION
 * Credentials: vault/occ/supabase/service_key_staging.env
 */

import type { KnowledgeDocument, IngestionResult } from "./types";
import { generateEmbedding } from "./embedding";

function getSupabaseClient() {
  const url = process.env.DATABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase credentials not set. Load from vault/occ/supabase/",
    );
  }

  return { url, serviceKey };
}

export async function ingestDocument(
  content: string,
  metadata: KnowledgeDocument["metadata"],
): Promise<KnowledgeDocument> {
  if (!content || content.trim().length === 0) {
    throw new Error("Content cannot be empty");
  }

  const embedding = await generateEmbedding(content);
  const { url, serviceKey } = getSupabaseClient();

  // TODO: Actual Supabase INSERT when @supabase/supabase-js added
  // For now, return stub with real embedding
  return {
    id: `doc-${Date.now()}`,
    content,
    embedding,
    metadata,
    source: "manual_ingestion",
    created_at: new Date().toISOString(),
  };
}

export async function ingestKnowledgeStub(): Promise<IngestionResult> {
  // Test if credentials are available
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const dbUrl = process.env.DATABASE_URL;

    if (apiKey && dbUrl) {
      return {
        documentsProcessed: 0,
        chunksCreated: 0,
        embeddingsGenerated: 0,
        errors: ["Credentials available - ready for production ingestion"],
      };
    }
  } catch (e) {
    // Fall through
  }

  return {
    documentsProcessed: 0,
    chunksCreated: 0,
    embeddingsGenerated: 0,
    errors: [
      "Load credentials: export $(grep -v '^#' vault/occ/openai/api_key_staging.env | xargs)",
      "Load credentials: export $(grep -v '^#' vault/occ/supabase/database_url_staging.env | xargs)",
    ],
  };
}
