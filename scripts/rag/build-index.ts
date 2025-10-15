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
 */
async function ensureCleanDir(dirPath: string): Promise<void> {
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
    sourcesDir = path.join(PROJECT_ROOT, 'data/support')
  } = options;
  
  console.log('🚀 Building RAG Index for Support KB\n');
  console.log('Configuration:');
  console.log(`  Sources: ${sourcesDir}`);
  console.log(`  Persist: ${persistDir}`);
  console.log(`  Force Mock: ${forceMock}\n`);
  
  try {
    // Load OpenAI API key
    const apiKey = await loadOpenAIKey();
    const useMock = forceMock || !apiKey;
    
    if (useMock) {
      console.log('⚠️  Using mock embeddings (no OpenAI key available)');
    } else {
      console.log('✅ Using OpenAI embeddings');
    }
    
    // Set OpenAI API key in environment - llamaindex will use it automatically
    if (!useMock && apiKey) {
      process.env.OPENAI_API_KEY = apiKey;
    } else {
      throw new Error('OpenAI API key required. Use --force-mock for local embeddings (not yet implemented)');
    }
    
    // Load documents
    const documents = await loadSupportDocuments(sourcesDir);
    
    if (documents.length === 0) {
      throw new Error('No documents found in sources directory');
    }
    
    // Ensure clean persist directory
    await ensureCleanDir(persistDir);
    
    // Create storage context
    const storageContext = await storageContextFromDefaults({
      persistDir,
    });
    
    // Build index
    console.log('\n🔨 Building vector index...');
    const index = await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });
    
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
  const forceMock = args.includes('--force-mock');
  const skipTest = args.includes('--skip-test');
  
  // Build index
  const result = await buildIndex({ forceMock });
  
  if (!result.success) {
    console.error('\n❌ Build failed. Exiting.');
    process.exit(1);
  }
  
  // Test index
  if (!skipTest) {
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

