#!/usr/bin/env tsx
/**
 * KB Quality Dashboard CLI
 *
 * Generates an at-a-glance quality dashboard for the dev knowledge base
 * (project = 'dev_kb') by aggregating metadata directly from Supabase.
 * Metrics include coverage, freshness, metadata quality, and duplication
 * signals inspired by LlamaIndex evaluation patterns (coverage, correctness,
 * faithfulness).
 *
 * Usage:
 *   npx tsx scripts/dev-kb/quality-dashboard.ts [--project dev_kb]
 *
 * Environment:
 *   SUPABASE_DEV_KB_DIRECT_URL - direct connection string (read-only access)
 */

import fs from "node:fs/promises";
import path from "node:path";

import { Client } from "pg";

const REQUIRED_ENV = "SUPABASE_DEV_KB_DIRECT_URL" as const;
const DEFAULT_PROJECT = "dev_kb";
const OUTPUT_DIR = path.resolve(
  process.cwd(),
  "artifacts/ai-knowledge/" + new Date().toISOString().slice(0, 10),
);
const OUTPUT_FILE = path.join(OUTPUT_DIR, "quality-dashboard.json");

type SummaryMetrics = {
  project: string;
  generatedAt: string;
  totals: {
    totalChunks: number;
    currentChunks: number;
    currentDocuments: number;
    distinctDocuments: number;
    versionsWithDuplicates: number;
  };
  metadata: {
    missingTitles: number;
    missingTags: number;
    missingSourceUrl: number;
    missingEmbeddings: number;
  };
  freshness: {
    avgDaysOld: number | null;
    maxDaysOld: number | null;
    staleChunksOver30d: number;
    lastIndexedAt: string | null;
  };
  categories: Array<{ category: string; count: number }>;
  duplicates: Array<{ documentKey: string; versions: number }>;
  healthScore: {
    overall: number;
    coverage: number;
    metadata: number;
    freshness: number;
    duplication: number;
  };
};

function ensureEnv(): string {
  const value = process.env[REQUIRED_ENV];
  if (!value) {
    throw new Error(`Missing required env var: ${REQUIRED_ENV}`);
  }
  return value;
}

function parseArgs(): { project: string } {
  const args = process.argv.slice(2);
  let project = DEFAULT_PROJECT;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--project") {
      const value = args[++i];
      if (!value) {
        throw new Error("--project flag requires a value");
      }
      project = value;
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }

  return { project };
}

function safeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function maybeNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function safeDate(value: any): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

async function fetchSummary(
  client: Client,
  project: string,
): Promise<Omit<SummaryMetrics, "project" | "generatedAt" | "healthScore">> {
  const totalsQuery = await client.query(
    `
      SELECT
        COUNT(*)::int AS total_chunks,
        COUNT(*) FILTER (WHERE is_current)::int AS current_chunks,
        COUNT(DISTINCT document_key) FILTER (WHERE is_current)::int AS current_documents,
        COUNT(DISTINCT document_key)::int AS distinct_documents,
        COUNT(*) FILTER (WHERE is_current AND (tags IS NULL OR array_length(tags, 1) = 0))::int AS missing_tags,
        COUNT(*) FILTER (WHERE is_current AND (trim(title) = '' OR title IS NULL))::int AS missing_titles,
        COUNT(*) FILTER (WHERE is_current AND (source_url IS NULL OR source_url = ''))::int AS missing_source_url,
        COUNT(*) FILTER (WHERE is_current AND embedding IS NULL)::int AS missing_embeddings,
        COUNT(*) FILTER (
          WHERE is_current AND COALESCE(last_indexed_at, created_at) IS NULL
        )::int AS missing_indexed_timestamp,
        COUNT(*) FILTER (
          WHERE is_current AND COALESCE(last_indexed_at, created_at) < now() - interval '30 days'
        )::int AS stale_chunks_over_30
      FROM knowledge_base
      WHERE project = $1
    `,
    [project],
  );

  const totalsRow = totalsQuery.rows[0] ?? {};

  const recencyQuery = await client.query(
    `
      SELECT
        AVG(EXTRACT(EPOCH FROM now() - COALESCE(last_indexed_at, created_at)) / 86400) AS avg_days_old,
        MAX(EXTRACT(EPOCH FROM now() - COALESCE(last_indexed_at, created_at)) / 86400) AS max_days_old,
        MAX(COALESCE(last_indexed_at, created_at)) AS last_indexed_at
      FROM knowledge_base
      WHERE project = $1 AND is_current
    `,
    [project],
  );

  const recencyRow = recencyQuery.rows[0] ?? {};

  const categoriesQuery = await client.query(
    `
      SELECT
        COALESCE(NULLIF(category, ''), 'uncategorized') AS category,
        COUNT(*)::int AS count
      FROM knowledge_base
      WHERE project = $1 AND is_current
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 10
    `,
    [project],
  );

  const duplicatesQuery = await client.query(
    `
      SELECT document_key, COUNT(*)::int AS versions
      FROM knowledge_base
      WHERE project = $1
      GROUP BY document_key
      HAVING COUNT(*) > 1
      ORDER BY versions DESC, document_key ASC
      LIMIT 15
    `,
    [project],
  );

  return {
    totals: {
      totalChunks: safeNumber(totalsRow.total_chunks),
      currentChunks: safeNumber(totalsRow.current_chunks),
      currentDocuments: safeNumber(totalsRow.current_documents),
      distinctDocuments: safeNumber(totalsRow.distinct_documents),
      versionsWithDuplicates: duplicatesQuery.rows.length,
    },
    metadata: {
      missingTitles: safeNumber(totalsRow.missing_titles),
      missingTags: safeNumber(totalsRow.missing_tags),
      missingSourceUrl: safeNumber(totalsRow.missing_source_url),
      missingEmbeddings: safeNumber(totalsRow.missing_embeddings),
    },
    freshness: {
      avgDaysOld: (() => {
        const value = maybeNumber(recencyRow.avg_days_old);
        return value === null ? null : Number(value.toFixed(2));
      })(),
      maxDaysOld: (() => {
        const value = maybeNumber(recencyRow.max_days_old);
        return value === null ? null : Number(value.toFixed(2));
      })(),
      staleChunksOver30d: safeNumber(totalsRow.stale_chunks_over_30),
      lastIndexedAt: safeDate(recencyRow.last_indexed_at),
    },
    categories: categoriesQuery.rows.map((row) => ({
      category: row.category as string,
      count: safeNumber(row.count),
    })),
    duplicates: duplicatesQuery.rows.map((row) => ({
      documentKey: row.document_key as string,
      versions: safeNumber(row.versions),
    })),
  };
}

function computeHealthScore(summary: Omit<SummaryMetrics, "project" | "generatedAt">): SummaryMetrics["healthScore"] {
  const { totals, metadata, freshness, duplicates } = summary;

  const coverageScore = totals.currentDocuments
    ? Math.min(100, Math.round((totals.currentDocuments / 120) * 100))
    : 0;

  const metadataPenaltyBase = totals.currentChunks || 1;
  const totalMetadataIssues =
    metadata.missingTags + metadata.missingTitles + metadata.missingSourceUrl;
  const metadataScore = Math.max(
    0,
    Math.round(100 - (totalMetadataIssues / metadataPenaltyBase) * 100),
  );

  const freshnessScore = freshness.avgDaysOld === null
    ? 0
    : Math.max(0, Math.min(100, Math.round(100 - (freshness.avgDaysOld / 30) * 100)));

  const duplicationScore = duplicates.length === 0
    ? 100
    : Math.max(
        0,
        Math.round(100 - Math.min(30, duplicates.length * 5)),
      );

  const overall = Math.round(
    coverageScore * 0.35 + metadataScore * 0.25 + freshnessScore * 0.25 + duplicationScore * 0.15,
  );

  return { overall, coverage: coverageScore, metadata: metadataScore, freshness: freshnessScore, duplication: duplicationScore };
}

function printDashboard(summary: SummaryMetrics) {
  const { totals, metadata, freshness, categories, duplicates, healthScore } = summary;

  console.log("\n=== KB Quality Dashboard ===");
  console.log(`Project: ${summary.project}`);
  console.log(`Generated: ${summary.generatedAt}`);

  console.log("\nHealth Scores (0-100)");
  console.table({
    Overall: healthScore.overall,
    Coverage: healthScore.coverage,
    Metadata: healthScore.metadata,
    Freshness: healthScore.freshness,
    Duplication: healthScore.duplication,
  });

  console.log("Totals");
  console.table({
    totalChunks: totals.totalChunks,
    currentChunks: totals.currentChunks,
    currentDocuments: totals.currentDocuments,
    distinctDocuments: totals.distinctDocuments,
    duplicateKeys: totals.versionsWithDuplicates,
  });

  console.log("Metadata Gaps (current chunks)");
  console.table({
    missingTitles: metadata.missingTitles,
    missingTags: metadata.missingTags,
    missingSourceUrl: metadata.missingSourceUrl,
    missingEmbeddings: metadata.missingEmbeddings,
  });

  console.log("Freshness");
  console.table({
    avgDaysOld: freshness.avgDaysOld ?? "n/a",
    maxDaysOld: freshness.maxDaysOld ?? "n/a",
    staleChunksOver30d: freshness.staleChunksOver30d,
    lastIndexedAt: freshness.lastIndexedAt ?? "n/a",
  });

  console.log("Top Categories (current)");
  categories.forEach((cat) => {
    console.log(` - ${cat.category}: ${cat.count}`);
  });

  if (duplicates.length > 0) {
    console.log("\nDuplicate Document Keys (>1 version)");
    duplicates.forEach((dup) => {
      console.log(` - ${dup.documentKey}: ${dup.versions} versions`);
    });
  } else {
    console.log("\nNo duplicate document keys detected. ✅");
  }

  console.log("\nNext Actions (LlamaIndex-inspired)");
  console.log(
    " - Run faithfulness + correctness evaluators against top CX queries when metadata gaps exceed 5%",
  );
  console.log(
    " - Re-ingest stale documents (>30 days) to keep retrieval context fresh",
  );
  console.log(
    " - Backfill tags/titles before running relevancy tests to improve reranker signals",
  );
}

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function persistSummary(summary: SummaryMetrics) {
  await ensureOutputDir();
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(summary, null, 2));
}

async function main() {
  const { project } = parseArgs();
  const connectionString = ensureEnv();

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const summaryCore = await fetchSummary(client, project);
    const healthScore = computeHealthScore(summaryCore);

    const summary: SummaryMetrics = {
      project,
      generatedAt: new Date().toISOString(),
      ...summaryCore,
      healthScore,
    };

    printDashboard(summary);
    await persistSummary(summary);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("KB quality dashboard failed:", error);
  process.exit(1);
});
