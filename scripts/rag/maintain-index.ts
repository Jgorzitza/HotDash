#!/usr/bin/env tsx
/**
 * RAG Knowledge Base Maintenance Script
 *
 * Provides utilities for maintaining and updating the CEO knowledge base
 *
 * Usage:
 *   npx tsx scripts/rag/maintain-index.ts status     # Check index status
 *   npx tsx scripts/rag/maintain-index.ts rebuild    # Rebuild index from scratch
 *   npx tsx scripts/rag/maintain-index.ts verify     # Verify index integrity
 */

import fs from "node:fs/promises";
import path from "node:path";
import { buildIndex } from "./build-index";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const INDEX_DIR = path.join(
  PROJECT_ROOT,
  "packages/memory/indexes/operator_knowledge",
);

interface IndexMetadata {
  buildTime: string;
  documentCount: number;
  persistDir: string;
  useMock: boolean;
  sources: Array<{
    fileName: string;
    size: number;
  }>;
}

/**
 * Check if index exists
 */
async function indexExists(): Promise<boolean> {
  try {
    await fs.access(INDEX_DIR);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load index metadata
 */
async function loadMetadata(): Promise<IndexMetadata | null> {
  try {
    const metadataPath = path.join(INDEX_DIR, "index_metadata.json");
    const content = await fs.readFile(metadataPath, "utf-8");
    return JSON.parse(content) as IndexMetadata;
  } catch (error) {
    console.error("⚠️  Could not load metadata:", (error as Error).message);
    return null;
  }
}

/**
 * Get index status
 */
async function getStatus(): Promise<void> {
  console.log("📊 Knowledge Base Index Status\n");

  const exists = await indexExists();

  if (!exists) {
    console.log("❌ Index not found at:", INDEX_DIR);
    console.log("\n💡 Run 'npx tsx scripts/rag/maintain-index.ts rebuild' to create index");
    return;
  }

  console.log("✅ Index exists at:", INDEX_DIR);

  const metadata = await loadMetadata();
  if (!metadata) {
    console.log("⚠️  Index exists but metadata is missing or corrupted");
    return;
  }

  console.log("\n📋 Index Details:");
  console.log(`  Built: ${new Date(metadata.buildTime).toLocaleString()}`);
  console.log(`  Documents: ${metadata.documentCount}`);
  console.log(`  Embedding Mode: ${metadata.useMock ? "Mock (Local)" : "OpenAI"}`);

  console.log(`\n📄 Source Documents (${metadata.sources.length}):`);
  for (const source of metadata.sources) {
    const sizeKB = (source.size / 1024).toFixed(1);
    console.log(`  - ${source.fileName} (${sizeKB} KB)`);
  }

  // Check index files
  const indexFiles = ["doc_store.json", "index_store.json", "vector_store.json"];
  console.log("\n🗂️  Index Files:");
  for (const file of indexFiles) {
    try {
      const filePath = path.join(INDEX_DIR, file);
      const stats = await fs.stat(filePath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`  ✅ ${file} (${sizeMB} MB)`);
    } catch {
      console.log(`  ❌ ${file} (missing)`);
    }
  }

  // Calculate age
  const buildDate = new Date(metadata.buildTime);
  const ageHours = (Date.now() - buildDate.getTime()) / 1000 / 60 / 60;
  const ageDays = (ageHours / 24).toFixed(1);

  console.log(`\n⏰ Age: ${ageDays} days (${ageHours.toFixed(1)} hours)`);

  if (ageHours > 168) {
    // 7 days
    console.log("⚠️  Index is over 1 week old - consider rebuilding");
  }
}

/**
 * Rebuild index
 */
async function rebuildIndex(): Promise<void> {
  console.log("🔨 Rebuilding Knowledge Base Index\n");

  const exists = await indexExists();
  if (exists) {
    console.log("⚠️  Existing index will be replaced");
    const metadata = await loadMetadata();
    if (metadata) {
      console.log(`  Current index: ${metadata.documentCount} documents`);
      console.log(`  Last built: ${new Date(metadata.buildTime).toLocaleString()}\n`);
    }
  }

  console.log("🚀 Starting rebuild...\n");

  const result = await buildIndex();

  if (result.success) {
    console.log("\n✅ Index rebuilt successfully!");
    console.log(`  Documents: ${result.documentCount}`);
    console.log(`  Duration: ${(result.duration / 1000).toFixed(1)}s`);
    console.log(`  Location: ${result.indexPath}`);
  } else {
    console.log("\n❌ Index rebuild failed!");
    console.log(`  Error: ${result.error}`);
    process.exit(1);
  }
}

/**
 * Verify index integrity
 */
async function verifyIndex(): Promise<void> {
  console.log("🔍 Verifying Index Integrity\n");

  const exists = await indexExists();
  if (!exists) {
    console.log("❌ Index not found - cannot verify");
    process.exit(1);
  }

  const metadata = await loadMetadata();
  if (!metadata) {
    console.log("❌ Metadata missing - index may be corrupted");
    process.exit(1);
  }

  // Check required files
  const requiredFiles = [
    "doc_store.json",
    "index_store.json",
    "vector_store.json",
    "index_metadata.json",
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = path.join(INDEX_DIR, file);
    try {
      await fs.access(filePath);
      console.log(`✅ ${file}`);
    } catch {
      console.log(`❌ ${file} (missing)`);
      allFilesExist = false;
    }
  }

  // Verify vector store is not empty
  try {
    const vectorStorePath = path.join(INDEX_DIR, "vector_store.json");
    const vectorStoreContent = await fs.readFile(vectorStorePath, "utf-8");
    const vectorStore = JSON.parse(vectorStoreContent);

    if (!vectorStore || Object.keys(vectorStore).length === 0) {
      console.log("\n❌ Vector store is empty");
      allFilesExist = false;
    } else {
      console.log("\n✅ Vector store has data");
    }
  } catch (error) {
    console.log(`\n❌ Could not verify vector store: ${(error as Error).message}`);
    allFilesExist = false;
  }

  if (allFilesExist) {
    console.log("\n✅ Index integrity check passed");
  } else {
    console.log("\n❌ Index integrity check failed");
    console.log("💡 Run 'npx tsx scripts/rag/maintain-index.ts rebuild' to fix");
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  const command = process.argv[2];

  switch (command) {
    case "status":
      await getStatus();
      break;

    case "rebuild":
      await rebuildIndex();
      break;

    case "verify":
      await verifyIndex();
      break;

    default:
      console.log("📚 RAG Knowledge Base Maintenance\n");
      console.log("Usage:");
      console.log("  npx tsx scripts/rag/maintain-index.ts status     # Check index status");
      console.log("  npx tsx scripts/rag/maintain-index.ts rebuild    # Rebuild index");
      console.log("  npx tsx scripts/rag/maintain-index.ts verify     # Verify integrity");
      process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export { getStatus, rebuildIndex, verifyIndex };

