#!/usr/bin/env tsx
/**
 * Knowledge Base Sync Utility — Keep RAG index current
 *
 * Syncs knowledge base articles to RAG vector index:
 * - Fetches articles from sources (docs, policies, FAQs)
 * - Updates LlamaIndex vector store
 * - Tracks sync status and article versions
 */

import fs from "node:fs";
import path from "node:path";

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: "policy" | "faq" | "product" | "technical";
  url?: string;
  lastUpdated: string;
  version: number;
}

export interface SyncResult {
  articlesProcessed: number;
  articlesAdded: number;
  articlesUpdated: number;
  articlesRemoved: number;
  errors: string[];
  syncedAt: string;
}

/**
 * Fetch articles from various sources
 */
async function fetchArticles(): Promise<KnowledgeArticle[]> {
  const articles: KnowledgeArticle[] = [];

  // TODO: Implement actual article fetching
  // Sources:
  // 1. docs/ directory markdown files
  // 2. Shopify product descriptions
  // 3. Email templates
  // 4. FAQ pages

  // Stub: Read from docs directory
  const docsDir = path.join(process.cwd(), "docs");

  try {
    if (fs.existsSync(docsDir)) {
      console.log(`Reading articles from ${docsDir}`);
      // Implementation would recursively read .md files
    }
  } catch (error) {
    console.error("Error reading docs directory:", error);
  }

  return articles;
}

/**
 * Update vector index with articles
 */
async function updateVectorIndex(articles: KnowledgeArticle[]): Promise<void> {
  // TODO: Implement LlamaIndex integration
  // 1. Create Document objects from articles
  // 2. Generate embeddings
  // 3. Store in vector index
  // 4. Persist index to disk or Supabase

  console.log(`Would update vector index with ${articles.length} articles`);
}

/**
 * Track sync status
 */
function recordSyncStatus(result: SyncResult): void {
  const artifactDir = path.join("artifacts", "knowledge-base");
  fs.mkdirSync(artifactDir, { recursive: true });

  const statusFile = path.join(artifactDir, "sync-status.json");
  fs.writeFileSync(statusFile, JSON.stringify(result, null, 2));

  console.log(`Sync status recorded: ${statusFile}`);
}

/**
 * Detect article changes
 */
function detectChanges(
  current: KnowledgeArticle[],
  previous: KnowledgeArticle[],
): {
  added: KnowledgeArticle[];
  updated: KnowledgeArticle[];
  removed: KnowledgeArticle[];
} {
  const currentMap = new Map(current.map((a) => [a.id, a]));
  const previousMap = new Map(previous.map((a) => [a.id, a]));

  const added: KnowledgeArticle[] = [];
  const updated: KnowledgeArticle[] = [];
  const removed: KnowledgeArticle[] = [];

  // Find added and updated
  for (const article of current) {
    const prev = previousMap.get(article.id);
    if (!prev) {
      added.push(article);
    } else if (
      article.version > prev.version ||
      article.lastUpdated !== prev.lastUpdated
    ) {
      updated.push(article);
    }
  }

  // Find removed
  for (const article of previous) {
    if (!currentMap.has(article.id)) {
      removed.push(article);
    }
  }

  return { added, updated, removed };
}

/**
 * Main sync execution
 */
async function main() {
  console.log("Starting knowledge base sync...");

  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // Fetch current articles
    const articles = await fetchArticles();
    console.log(`Fetched ${articles.length} articles`);

    // Load previous sync state
    const previousArticles: KnowledgeArticle[] = [];
    const statusFile = path.join(
      "artifacts",
      "knowledge-base",
      "sync-status.json",
    );

    if (fs.existsSync(statusFile)) {
      // TODO: Load previous article state
    }

    // Detect changes
    const changes = detectChanges(articles, previousArticles);
    console.log(
      `Changes detected: ${changes.added.length} added, ${changes.updated.length} updated, ${changes.removed.length} removed`,
    );

    // Update vector index
    if (
      changes.added.length > 0 ||
      changes.updated.length > 0 ||
      changes.removed.length > 0
    ) {
      await updateVectorIndex(articles);
      console.log("Vector index updated");
    } else {
      console.log("No changes detected - index up to date");
    }

    // Record sync result
    const result: SyncResult = {
      articlesProcessed: articles.length,
      articlesAdded: changes.added.length,
      articlesUpdated: changes.updated.length,
      articlesRemoved: changes.removed.length,
      errors,
      syncedAt: new Date().toISOString(),
    };

    recordSyncStatus(result);

    const durationMs = Date.now() - startTime;
    console.log(`✓ Sync completed in ${durationMs}ms`);
    console.log(`✓ Articles processed: ${result.articlesProcessed}`);
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(2);
  });
}
