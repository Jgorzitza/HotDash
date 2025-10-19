import { promises as fs } from "node:fs";
import { join } from "node:path";

type KnowledgeIndexMetadata = {
  generatedAt: string;
  sources: string[];
  documentCount: number;
  llmModel: string;
  embeddingModel: string;
  usingMockProviders: boolean;
};

type StubMetrics = {
  documentsIngested: number;
  chunksGenerated: number;
  embeddingsGenerated: number;
};

export type IngestionStubResult = {
  status: "stub";
  ready: false;
  lastBuildAt: string | null;
  metadata: KnowledgeIndexMetadata | null;
  metrics: StubMetrics;
  assumptions: string[];
  notes: string[];
};

const DEFAULT_ASSUMPTIONS = [
  "OpenAI embedding credentials are not yet approved; ingestion remains disabled.",
  "Content sources docs/enablement/job_aids, docs/marketing/launch_faq.md, docs/marketing/launch_comms_packet.md are missing from the repository.",
];

const INDEX_METADATA_PATH = join(
  process.cwd(),
  "packages/memory/indexes/operator_knowledge/index_metadata.json",
);

async function loadIndexMetadata(): Promise<KnowledgeIndexMetadata | null> {
  try {
    const raw = await fs.readFile(INDEX_METADATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<KnowledgeIndexMetadata>;

    if (
      typeof parsed.generatedAt === "string" &&
      Array.isArray(parsed.sources) &&
      typeof parsed.documentCount === "number" &&
      typeof parsed.llmModel === "string" &&
      typeof parsed.embeddingModel === "string" &&
      typeof parsed.usingMockProviders === "boolean"
    ) {
      return {
        generatedAt: parsed.generatedAt,
        sources: parsed.sources,
        documentCount: parsed.documentCount,
        llmModel: parsed.llmModel,
        embeddingModel: parsed.embeddingModel,
        usingMockProviders: parsed.usingMockProviders,
      };
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return null;
}

export async function ingestKnowledgeStub(): Promise<IngestionStubResult> {
  const metadata = await loadIndexMetadata();

  return {
    status: "stub",
    ready: false,
    lastBuildAt: metadata?.generatedAt ?? null,
    metadata,
    metrics: {
      documentsIngested: 0,
      chunksGenerated: 0,
      embeddingsGenerated: 0,
    },
    assumptions: [...DEFAULT_ASSUMPTIONS],
    notes: metadata
      ? [
          `Last index build captured ${metadata.documentCount} document(s) using ${metadata.embeddingModel}.`,
          metadata.usingMockProviders
            ? "Index build currently running against mock providers."
            : "Index build uses production providers.",
        ]
      : ["No index metadata found; build needs to run at least once."],
  };
}
