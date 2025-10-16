#!/usr/bin/env tsx
/**
 * RAG Index Builder for Support KB
 * 
 * Builds a LlamaIndex vector store from support KB content in data/support/
 * Stores index in packages/memory/indexes/operator_knowledge/
 * 
 * Usage:
 *   npx tsx scripts/rag/build-index.ts
 *   npx tsx scripts/rag/build-index.ts --force-mock  # Use local embeddings
 */

import {
  VectorStoreIndex,
  Document,
  storageContextFromDefaults,
  Settings
} from 'llamaindex';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

interface BuildResult {
  success: boolean;
  documentCount: number;
  indexPath: string;
  duration: number;
  error?: string;
}

interface BuildOptions {
  forceMock?: boolean;
  persistDir?: string;
  sourcesDir?: string;
  dryRun?: boolean; // Only print stats, don't build index
  noWrite?: boolean; // CI mode - validate but don't persist
  useMcpFallback?: boolean; // Use MCP server instead of local build
}

/**
 * Load environment variables from vault
 */
async function loadOpenAIKey(): Promise<string | undefined> {
  const vaultPath = path.join(PROJECT_ROOT, 'vault/occ/openai/api_key_staging.env');
  
  try {
    const content = await fs.readFile(vaultPath, 'utf-8');
    const match = content.match(/OPENAI_API_KEY=(.+)/);
    if (match) {
      return match[1].trim();
    }
  } catch (error) {
    console.warn('⚠️  Could not load OpenAI key from vault:', (error as Error).message);
  }
  
  return process.env.OPENAI_API_KEY;
}

/**
 * Ensure directory exists and is clean
 * SAFETY: Only cleans if embeddings are properly configured
 */
async function ensureCleanDir(dirPath: string, safeToDelete: boolean = false): Promise<void> {
  // SAFETY GUARD: Never delete existing index unless explicitly safe
  if (!safeToDelete) {
    console.warn('⚠️  Skipping directory cleanup - embeddings not validated');
    await fs.mkdir(dirPath, { recursive: true });
    return;
  }

  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    // Directory might not exist, that's fine
  }

  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Load documents from support KB directory
 */
async function loadSupportDocuments(sourcesDir: string): Promise<Document[]> {
  console.log(`📂 Loading documents from: ${sourcesDir}`);

  // Find all markdown files
  const files = await glob('**/*.md', { cwd: sourcesDir, absolute: true });

  console.log(`Found ${files.length} markdown files`);

  const documents: Document[] = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    const doc = new Document({
      text: content,
      metadata: {
        file_name: fileName,
        file_path: filePath,
        source: 'support_kb',
      },
    });

    documents.push(doc);
    console.log(`  ✓ ${fileName} (${content.length} chars)`);
  }

  console.log(`✅ Loaded ${documents.length} documents`);

  return documents;
}

/**
 * Build the RAG index
 */
async function buildIndex(options: BuildOptions = {}): Promise<BuildResult> {
  const startTime = Date.now();

  const {
    forceMock = false,
    persistDir = path.join(PROJECT_ROOT, 'packages/memory/indexes/operator_knowledge'),
    sourcesDir = path.join(PROJECT_ROOT, 'data/support'),
    dryRun = false,
    noWrite = false,
    useMcpFallback = false,
  } = options;

  console.log('🚀 Building RAG Index for Support KB\n');
  console.log('Configuration:');
  console.log(`  Sources: ${sourcesDir}`);
  console.log(`  Persist: ${persistDir}`);
  console.log(`  Dry Run: ${dryRun}`);
  console.log(`  No Write (CI): ${noWrite}`);
  console.log(`  MCP Fallback: ${useMcpFallback}\n`);

  try {
    // Load documents first (always safe)
    const documents = await loadSupportDocuments(sourcesDir);

    if (documents.length === 0) {
      throw new Error('No documents found in sources directory');
    }

    // DRY RUN MODE: Just print stats and exit
    if (dryRun) {
      const duration = Date.now() - startTime;
      console.log('\n📊 Dry Run - Document Statistics:');
      console.log(`  Total Documents: ${documents.length}`);
      console.log(`  Total Characters: ${documents.reduce((sum, d) => sum + d.text.length, 0)}`);
      console.log(`  Avg Document Size: ${Math.round(documents.reduce((sum, d) => sum + d.text.length, 0) / documents.length)} chars`);
      console.log(`  Duration: ${duration}ms`);
      console.log('\n✅ Dry run complete - no index built');

      return {
        success: true,
        documentCount: documents.length,
        indexPath: persistDir,
        duration,
      };
    }

    // MCP FALLBACK MODE: Recommend using MCP server instead
    if (useMcpFallback) {
      const duration = Date.now() - startTime;
      console.log('\n🔄 MCP Fallback Mode');
      console.log('  Recommendation: Use existing LlamaIndex MCP server');
      console.log('  Server: hotdash-llamaindex-mcp.fly.dev');
      console.log('  Documents ready for MCP ingestion: ${documents.length}');
      console.log('\n✅ Use MCP server for queries instead of local index');

      return {
        success: true,
        documentCount: documents.length,
        indexPath: 'mcp://hotdash-llamaindex-mcp.fly.dev',
        duration,
      };
    }

    // Load OpenAI API key
    const apiKey = await loadOpenAIKey();
    const useMock = forceMock || !apiKey;

    // SAFETY GUARD: If no API key and no embed model, use MCP fallback
    if (!apiKey && !forceMock) {
      console.log('\n⚠️  No OpenAI API key found');
      console.log('  Recommendation: Use --use-mcp-fallback or provide API key');
      console.log('  MCP Server: hotdash-llamaindex-mcp.fly.dev');
      throw new Error('No embeddings configuration available. Use --use-mcp-fallback or provide OPENAI_API_KEY');
    }

    if (useMock) {
      console.log('⚠️  Using mock embeddings (no OpenAI key available)');
    } else {
      console.log('✅ Using OpenAI embeddings');
    }

    // Set OpenAI API key in environment
    if (!useMock && apiKey) {
      process.env.OPENAI_API_KEY = apiKey;
    } else {
      throw new Error('OpenAI API key required. Use --use-mcp-fallback instead');
    }

    // SAFETY: Only clean directory if embeddings are valid
    const safeToDelete = !useMock && !!apiKey;
    await ensureCleanDir(persistDir, safeToDelete);

    // Create storage context
    const storageContext = await storageContextFromDefaults({
      persistDir,
    });

    // Build index
    console.log('\n🔨 Building vector index...');
    const index = await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });

    // NO-WRITE MODE: Skip persistence for CI
    if (noWrite) {
      const duration = Date.now() - startTime;
      console.log('\n✅ Index build validated (no-write mode)');
      console.log(`  Documents: ${documents.length}`);
      console.log(`  Duration: ${duration}ms`);
      console.log(`  Skipped: Persistence (CI mode)`);

      return {
        success: true,
        documentCount: documents.length,
        indexPath: persistDir,
        duration,
      };
    }

    // Persist index
    console.log('💾 Persisting index to disk...');
    await storageContext.persist(persistDir);

    // Write metadata
    const metadata = {
      buildTime: new Date().toISOString(),
      documentCount: documents.length,
      persistDir,
      useMock,
      sources: documents.map(doc => ({
        fileName: doc.metadata?.file_name || 'unknown',
        size: doc.text.length,
      })),
    };

    const metadataPath = path.join(persistDir, 'index_metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    const duration = Date.now() - startTime;

    console.log('\n✅ Index build complete!');
    console.log(`  Documents: ${documents.length}`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Location: ${persistDir}`);
    
    return {
      success: true,
      documentCount: documents.length,
      indexPath: persistDir,
      duration,
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = (error as Error).message;
    
    console.error('\n❌ Index build failed:', errorMessage);
    
    return {
      success: false,
      documentCount: 0,
      indexPath: persistDir,
      duration,
      error: errorMessage,
    };
  }
}

/**
 * Test the built index with sample queries
 */
async function testIndex(indexPath: string): Promise<void> {
  console.log('\n🧪 Testing index with sample queries...\n');
  
  try {
    // Load the index
    const storageContext = await storageContextFromDefaults({
      persistDir: indexPath,
    });
    
    const index = await VectorStoreIndex.init({
      storageContext,
    });
    
    const queryEngine = index.asQueryEngine({
      similarityTopK: 3,
    });
    
    // Test queries
    const testQueries = [
      "How do I process a return?",
      "What's the shipping policy?",
      "How do I cancel an order?",
    ];
    
    for (const question of testQueries) {
      console.log(`📝 Query: "${question}"`);
      console.log('-'.repeat(80));
      
      const response = await queryEngine.query({ query: question });
      console.log(`Answer: ${response.response}\n`);
    }
    
    console.log('✅ Index testing complete!');
    
  } catch (error) {
    console.error('❌ Index testing failed:', (error as Error).message);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse CLI flags
  const forceMock = args.includes('--force-mock');
  const skipTest = args.includes('--skip-test');
  const dryRun = args.includes('--dry-run');
  const noWrite = args.includes('--no-write');
  const useMcpFallback = args.includes('--use-mcp-fallback');

  // Parse directory arguments
  const sourceDirIndex = args.indexOf('--source-dir');
  const outputDirIndex = args.indexOf('--output-dir');

  const sourcesDir = sourceDirIndex >= 0 ? args[sourceDirIndex + 1] : undefined;
  const persistDir = outputDirIndex >= 0 ? args[outputDirIndex + 1] : undefined;

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
RAG Index Builder - Support KB

Usage:
  npx tsx scripts/rag/build-index.ts [options]

Options:
  --dry-run              Print document stats only, don't build index
  --no-write             Validate build but don't persist (CI mode)
  --use-mcp-fallback     Use MCP server instead of local build
  --force-mock           Use mock embeddings (not recommended)
  --skip-test            Skip index testing after build
  --source-dir <path>    Source directory for KB documents (default: data/support)
  --output-dir <path>    Output directory for index (default: packages/memory/indexes/operator_knowledge)
  --help, -h             Show this help message

Examples:
  # Dry run to see document stats
  npx tsx scripts/rag/build-index.ts --dry-run

  # CI validation (no write)
  npx tsx scripts/rag/build-index.ts --no-write

  # Use MCP server fallback
  npx tsx scripts/rag/build-index.ts --use-mcp-fallback

  # Custom directories
  npx tsx scripts/rag/build-index.ts --source-dir ./my-docs --output-dir ./my-index
    `);
    process.exit(0);
  }

  // Build index
  const result = await buildIndex({
    forceMock,
    dryRun,
    noWrite,
    useMcpFallback,
    sourcesDir,
    persistDir,
  });

  if (!result.success) {
    console.error('\n❌ Build failed. Exiting.');
    process.exit(1);
  }

  // Test index (skip for dry-run, no-write, or MCP fallback)
  if (!skipTest && !dryRun && !noWrite && !useMcpFallback) {
    await testIndex(result.indexPath);
  }

  console.log('\n🎉 All done!');
  process.exit(0);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { buildIndex, testIndex, type BuildResult, type BuildOptions };

