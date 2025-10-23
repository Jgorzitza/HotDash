#!/usr/bin/env tsx
/**
 * Dev Knowledge Base Ingestion Script
 *
 * Scans markdown documentation across the repo, chunks content, generates
 * OpenAI embeddings, and stores them in the dedicated Supabase knowledge_base
 * table (project='dev_kb').
 *
 * Usage:
 *   set -a && source vault/dev-kb/supabase.env && source vault/occ/openai/api_key_staging.env && set +a
 *   npx tsx scripts/dev-kb/ingest.ts
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { Client } from "pg";
import OpenAI from "openai";
import { SentenceSplitter } from "llamaindex";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const REQUIRED_ENVS = ["SUPABASE_DEV_KB_DIRECT_URL", "OPENAI_API_KEY"] as const;

const SHOP_DOMAIN = "internal.dev";
const CREATED_BY = "dev-kb-ingest";
const DEFAULT_VERSION = 1;

const GLOB_PATTERN = "**/*.md";
const GLOB_IGNORE = [
  "node_modules/**",
  ".git/**",
  "coverage/**",
  "playwright-report/**",
  "artifacts/**",
  "tmp/**",
  "dist/**",
  "build/**",
  "storage/**",
  "public/**",
  "packages/dev-kb-prisma/**",
];

const MAX_CHARS_PER_EMBED = 8000;
const LOG_EVERY_FILES = 50;
const LOG_EVERY_CHUNKS = 250;

type IngestChunk = {
  documentKey: string;
  title: string;
  content: string;
  documentType: string;
  category: string;
  tags: string[];
  sourcePath: string;
  sectionIndex: number;
};

function requireEnvironmentVariables() {
  const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`,
    );
  }
}

function sanitizeSegment(segment: string): string {
  return segment
    .replace(/\.[^.]+$/, "")
    .replace(/[^\w/-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildMetadata(
  relativePath: string,
): Pick<IngestChunk, "documentType" | "category" | "tags"> {
  const normalizedPath = relativePath.split(path.sep).join("/");
  const segments = normalizedPath.split("/");
  const topLevel = segments[0] ?? "root";
  const category = sanitizeSegment(topLevel) || "root";

  const baseName = sanitizeSegment(
    path.basename(normalizedPath, path.extname(normalizedPath)),
  );

  const tags = new Set<string>();
  tags.add(category);
  if (baseName) tags.add(baseName);

  segments.slice(1).forEach((segment) => {
    const cleaned = sanitizeSegment(segment);
    if (cleaned) tags.add(cleaned);
  });

  return {
    documentType: `doc_${category}`,
    category,
    tags: Array.from(tags),
  };
}

async function collectSourceFiles(): Promise<string[]> {
  const matches = await glob(GLOB_PATTERN, {
    cwd: PROJECT_ROOT,
    nodir: true,
    absolute: true,
    ignore: GLOB_IGNORE,
  });
  return matches;
}

async function readAndChunkFile(
  absolutePath: string,
): Promise<{ chunks: IngestChunk[]; relativePath: string } | null> {
  const relativeRaw = path.relative(PROJECT_ROOT, absolutePath);
  const relativePath = relativeRaw.split(path.sep).join("/");
  const descriptor = buildMetadata(relativePath);

  const content = await fs.readFile(absolutePath, "utf-8");
  if (!content.trim()) {
    return null;
  }

  const splitter = new SentenceSplitter({
    chunkSize: 512,
    chunkOverlap: 64,
  });
  const chunks = splitter.splitText(content);

  return {
    relativePath,
    chunks: chunks.map((chunk, index) => {
      const documentKey = `${relativePath}#${index}`;
      const title = deriveTitle(chunk, relativePath, index);

      return {
        documentKey,
        title,
        content: chunk,
        documentType: descriptor.documentType,
        category: descriptor.category,
        tags: descriptor.tags,
        sourcePath: relativePath,
        sectionIndex: index,
      };
    }),
  };
}

function deriveTitle(
  chunk: string,
  relativePath: string,
  index: number,
): string {
  const headingMatch = chunk.match(/^#{1,6}\s+(.*)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  const base = path.basename(relativePath, path.extname(relativePath));
  return `${base} — Section ${index + 1}`;
}

async function generateEmbedding(
  client: OpenAI,
  text: string,
): Promise<number[]> {
  const normalized =
    text.length > MAX_CHARS_PER_EMBED
      ? text.slice(0, MAX_CHARS_PER_EMBED)
      : text;
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: normalized,
  });
  const vector = response.data?.[0]?.embedding;
  if (!vector) {
    throw new Error("OpenAI embedding response missing vector data.");
  }
  return vector;
}

async function upsertChunks(
  pgClient: Client,
  chunks: IngestChunk[],
  openAi: OpenAI,
) {
  console.log(`🧹 Clearing existing rows for shop_domain='${SHOP_DOMAIN}'...`);
  await pgClient.query("DELETE FROM knowledge_base WHERE shop_domain = $1", [
    SHOP_DOMAIN,
  ]);

  console.log(`📚 Inserting ${chunks.length} chunk(s) into knowledge_base`);
  let processed = 0;
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(openAi, chunk.content);
    const embeddingLiteral = `[${embedding.join(",")}]`;

    const id = crypto.randomUUID();
    await pgClient.query(
      `
        INSERT INTO knowledge_base (
          id,
          shop_domain,
          document_key,
          document_type,
          title,
          content,
          embedding,
          source_url,
          tags,
          category,
          version,
          is_current,
          previous_version_id,
          created_by,
          created_at,
          updated_at,
          metadata,
          project
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7::vector,
          $8,
          $9,
          $10,
          $11,
          $12,
          NULL,
          $13,
          NOW(),
          NOW(),
          $14::jsonb,
          'dev_kb'
        )
      `,
      [
        id,
        SHOP_DOMAIN,
        chunk.documentKey,
        chunk.documentType,
        chunk.title,
        chunk.content,
        embeddingLiteral,
        chunk.sourcePath,
        chunk.tags,
        chunk.category,
        DEFAULT_VERSION,
        true,
        CREATED_BY,
        JSON.stringify({
          source_path: chunk.sourcePath,
          section_index: chunk.sectionIndex,
        }),
      ],
    );

    processed += 1;
    if (processed % LOG_EVERY_CHUNKS === 0) {
      console.log(`   … ${processed}/${chunks.length} chunks processed`);
    }
  }
}

async function main() {
  requireEnvironmentVariables();

  const skippedFiles: Array<{ path: string; reason: string }> = [];
  const fileStats = new Map<
    string,
    { files: number; chunks: number; example?: string }
  >();

  const files = await collectSourceFiles();
  if (files.length === 0) {
    console.warn("⚠️  No source files matched. Nothing to ingest.");
    return;
  }

  console.log(`📄 Found ${files.length} markdown file(s)`);

  const allChunks: IngestChunk[] = [];
  let processedFiles = 0;
  for (const filePath of files) {
    const result = await readAndChunkFile(filePath);
    processedFiles += 1;

    if (processedFiles % LOG_EVERY_FILES === 0) {
      console.log(`   … scanned ${processedFiles}/${files.length} files`);
    }

    if (!result) {
      skippedFiles.push({
        path: path.relative(PROJECT_ROOT, filePath).split(path.sep).join("/"),
        reason: "empty or whitespace-only",
      });
      continue;
    }

    const { relativePath, chunks } = result;
    if (chunks.length === 0) {
      skippedFiles.push({
        path: relativePath,
        reason: "chunker produced no output",
      });
      continue;
    }

    allChunks.push(...chunks);

    const topLevel = relativePath.split("/")[0] ?? "root";
    const stat = fileStats.get(topLevel) ?? { files: 0, chunks: 0 };
    stat.files += 1;
    stat.chunks += chunks.length;
    if (!stat.example) {
      stat.example = relativePath;
    }
    fileStats.set(topLevel, stat);
  }

  if (allChunks.length === 0) {
    console.warn("⚠️  No chunks generated. Nothing to ingest.");
    return;
  }

  console.log(`🔢 Prepared ${allChunks.length} chunk(s) for ingestion`);
  console.log("📊 Coverage by top-level directory:");
  const sortedStats = Array.from(fileStats.entries()).sort(
    (a, b) => b[1].chunks - a[1].chunks,
  );
  for (const [directory, stat] of sortedStats) {
    console.log(
      `   - ${directory}: ${stat.files} files, ${stat.chunks} chunks (example: ${stat.example})`,
    );
  }
  if (skippedFiles.length > 0) {
    console.warn("⚠️  Skipped files:");
    skippedFiles.slice(0, 10).forEach((item) => {
      console.warn(`   - ${item.path} (${item.reason})`);
    });
    if (skippedFiles.length > 10) {
      console.warn(
        `   … ${skippedFiles.length - 10} additional file(s) skipped`,
      );
    }
  }

  const pgClient = new Client({
    connectionString: process.env.SUPABASE_DEV_KB_DIRECT_URL,
  });
  await pgClient.connect();

  try {
    const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    await upsertChunks(pgClient, allChunks, openAi);
  } finally {
    await pgClient.end();
  }

  console.log("✅ Dev knowledge base ingestion complete");
}

main().catch((error) => {
  console.error("❌ Ingestion failed:", error);
  process.exitCode = 1;
});
