/**
 * KB Ingestion Tests
 * Task 8
 */
import { ingestKBArticles, getIngestionStats } from './kb-ingest';

async function runTests() {
  console.log('🧪 Testing KB Ingestion\n');
  
  const result = await ingestKBArticles('data/support');
  
  console.log(`✅ Ingested ${result.articlesProcessed} articles`);
  console.log(`✅ ${result.errors.length} errors`);
  
  const stats = getIngestionStats(result.articles);
  console.log('\n📊 Stats:', JSON.stringify(stats, null, 2));
}

if (import.meta.url === 'file://' + process.argv[1]) {
  runTests();
}
