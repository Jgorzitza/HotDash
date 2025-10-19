import { parseArgs } from "node:util";
import { promises as fs } from "fs";
import { fileURLToPath } from "node:url";
import { join, relative, resolve, extname } from "path";
import OpenAI from "openai";
import {
  BaseEmbedding,
  Document,
  Settings,
  SimpleNodeParser,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";
import type { LLM } from "llamaindex";
import { loadEnvFromFiles } from "../utils/env";

type BuildOptions = {
  persistDir: string;
  sources: string[];
  useMock: boolean;
  llmModel: string;
  embeddingModel: string;
  apiKey?: string;
};

export const DEFAULT_SOURCES = [
  "docs/runbooks",
  "docs/enablement/job_aids",
  "docs/marketing/launch_faq.md",
  "docs/marketing/launch_comms_packet.md",
];

const ALLOWED_EXTENSIONS = new Set([".md", ".mdx"]);

class LocalEmbedding extends BaseEmbedding {
  private readonly dimensions: number;

  constructor(dimensions = 256) {
    super();
    this.dimensions = dimensions;
  }

  async getTextEmbedding(text: string) {
    const vector = new Array<number>(this.dimensions).fill(0);
    const normalized = text.toLowerCase();
    for (let i = 0; i < normalized.length; i += 1) {
      const code = normalized.charCodeAt(i);
      const index = code % this.dimensions;
      vector[index] += (code % 13) / 13;
    }
    const magnitude =
      Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => value / magnitude);
  }
}

class OpenAIEmbeddingProvider extends BaseEmbedding {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    super();
    this.client = new OpenAI({ apiKey });
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

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function gatherFiles(targetPath: string): Promise<string[]> {
  const stats = await fs.stat(targetPath);
  if (stats.isDirectory()) {
    const entries = await fs.readdir(targetPath);
    const results: string[] = [];
    for (const entry of entries) {
      const childPath = join(targetPath, entry);
      const childStats = await fs.stat(childPath);
      if (childStats.isDirectory()) {
        results.push(...(await gatherFiles(childPath)));
      } else if (childStats.isFile()) {
        const ext = extname(entry).toLowerCase();
        if (ALLOWED_EXTENSIONS.has(ext)) {
          results.push(childPath);
        }
      }
    }
    return results;
  }

  if (stats.isFile()) {
    const ext = extname(targetPath).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
      return [targetPath];
    }
  }

  return [];
}

async function loadDocuments(sources: string[]): Promise<Document[]> {
  const docs: Document[] = [];
  for (const source of sources) {
    const absolute = resolve(process.cwd(), source);
    if (!(await pathExists(absolute))) {
      console.warn(`[llama-index] source missing, skipping: ${source}`);
      continue;
    }

    const files = await gatherFiles(absolute);
    for (const filePath of files) {
      const content = await fs.readFile(filePath, "utf8");
      const stats = await fs.stat(filePath);
      const relativePath = relative(process.cwd(), filePath);
      docs.push(
        new Document({
          id_: relativePath,
          text: content,
          metadata: {
            source: relativePath,
            lastModified: stats.mtime.toISOString(),
          },
        }),
      );
    }
  }
  return docs;
}

async function ensureCleanDir(dirPath: string) {
  await fs.rm(dirPath, { recursive: true, force: true });
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeMetadata(
  persistDir: string,
  meta: {
    generatedAt: string;
    sources: string[];
    documentCount: number;
    llmModel: string;
    embeddingModel: string;
    usingMockProviders: boolean;
  },
) {
  const filePath = join(persistDir, "index_metadata.json");
  await fs.writeFile(filePath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
}

async function buildIndex(options: BuildOptions) {
  const documents = await loadDocuments(options.sources);
  if (!documents.length) {
    throw new Error("No documents found for the provided sources.");
  }

  const parser = new SimpleNodeParser();
  Settings.nodeParser = parser;

  if (options.useMock) {
    Settings.llm = undefined as unknown as LLM;
    Settings.embedModel = new LocalEmbedding();
  } else {
    if (!options.apiKey) {
      throw new Error(
        "OPENAI_API_KEY is required for OpenAI-backed index builds.",
      );
    }
    Settings.llm = undefined as unknown as LLM;
    Settings.embedModel = new OpenAIEmbeddingProvider(
      options.apiKey,
      options.embeddingModel,
    );
  }

  const storageContext = await storageContextFromDefaults({
    persistDir: options.persistDir,
  });

  await VectorStoreIndex.fromDocuments(documents, {
    storageContext,
  });

  const creationTimestamp = new Date().toISOString();

  const embeddingModelName = options.useMock
    ? "local-hash-embedding"
    : options.embeddingModel;

  const llmModelName = options.useMock ? "disabled" : options.llmModel;

  await writeMetadata(options.persistDir, {
    generatedAt: creationTimestamp,
    sources: options.sources,
    documentCount: documents.length,
    llmModel: llmModelName,
    embeddingModel: embeddingModelName,
    usingMockProviders: options.useMock,
  });

  await writeServiceContext(options.persistDir, {
    provider: options.useMock ? "local" : "openai",
    llmModel: llmModelName,
    embeddingModel: embeddingModelName,
    envVars: options.useMock ? [] : ["OPENAI_API_KEY"],
    createdAt: creationTimestamp,
    planned: options.useMock
      ? {
          provider: "openai",
          llmModel: options.llmModel,
          embeddingModel: options.embeddingModel,
          envVars: ["OPENAI_API_KEY"],
        }
      : undefined,
  });

  return {
    persistDir: options.persistDir,
    documentCount: documents.length,
    sources: options.sources,
    usingMockProviders: options.useMock,
  };
}

async function writeServiceContext(
  persistDir: string,
  context: {
    provider: "openai" | "local";
    llmModel: string;
    embeddingModel: string;
    envVars: string[];
    createdAt: string;
    planned?: {
      provider: "openai";
      llmModel: string;
      embeddingModel: string;
      envVars: string[];
    };
  },
) {
  const filePath = join(persistDir, "service_context.json");
  await fs.writeFile(filePath, `${JSON.stringify(context, null, 2)}\n`, "utf8");
}

async function main() {
  const { values } = parseArgs({
    options: {
      "persist-dir": {
        type: "string",
        default: "packages/memory/indexes/operator_knowledge",
      },
      source: { type: "string", multiple: true },
      "llm-model": {
        type: "string",
        default: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      },
      "embedding-model": {
        type: "string",
        default: process.env.OPENAI_EMBED_MODEL ?? "text-embedding-3-small",
      },
      "force-mock": { type: "boolean", default: false },
    },
  });

  await loadEnvFromFiles([
    "vault/occ/openai/api_key_staging.env",
    ".env.staging",
    ".env",
  ]);

  const persistDir = resolve(process.cwd(), values["persist-dir"]);
  const sources: string[] = (values.source as string[] | undefined)?.length
    ? (values.source as string[])
    : DEFAULT_SOURCES;
  const openAiKey = process.env.OPENAI_API_KEY;
  const useMock = values["force-mock"] || !openAiKey;

  if (!useMock && !openAiKey) {
    throw new Error(
      "OPENAI_API_KEY is required unless --force-mock is provided.",
    );
  }

  await ensureCleanDir(persistDir);

  const result = await buildIndex({
    persistDir,
    sources,
    useMock,
    llmModel: values["llm-model"],
    embeddingModel: values["embedding-model"],
    apiKey: openAiKey,
  });

  console.log(
    JSON.stringify(
      {
        status: "ok",
        message: "LlamaIndex build complete",
        ...result,
      },
      null,
      2,
    ),
  );
}

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] === modulePath) {
  main().catch((error) => {
    console.error("[ai:build-llama-index] failed", error);
    process.exitCode = 1;
  });
}
