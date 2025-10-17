/*
 * Knowledge Ingestion Stub
 * Purpose: safe no-op until credentials/approvals land
 */
export interface IngestionStubResult {
  status: "stub";
  docsProcessed: number;
  tokensIndexed: number;
  sources: string[];
  assumptions: string[];
  nextSteps: string[];
  generatedAt: string;
}
export async function ingestKnowledgeStub(): Promise<IngestionStubResult> {
  return {
    status: "stub",
    docsProcessed: 0,
    tokensIndexed: 0,
    sources: [],
    assumptions: [
      "OpenAI embeddings via vault",
      "Supabase service-role via vault",
      "Approved source list finalized",
      "RLS confirmed; migrations applied",
      "HITL-approved content only",
    ],
    nextSteps: [
      "Swap stub for live ingestion once approved",
      "Wire embeddings + Supabase audit upsert",
      "Enable daily drift checks and log",
    ],
    generatedAt: new Date().toISOString(),
  };
}

