import { fetchHotrodanContent } from './src/loaders/sitemap.js';

console.log('🚀 Starting hotrodan.com crawl test...\n');

try {
  const docs = await fetchHotrodanContent();
  
  console.log(`\n✅ Crawl completed successfully!`);
  console.log(`📊 Documents fetched: ${docs.length}`);
  console.log(`📝 Total content length: ${docs.reduce((sum, d) => sum + d.getText().length, 0)} characters`);
  
  if (docs.length > 0) {
    console.log(`\n📄 Sample document:`);
    console.log(`   ID: ${docs[0].id_}`);
    console.log(`   URL: ${docs[0].metadata.url}`);
    console.log(`   Length: ${docs[0].getText().length} characters`);
    console.log(`   Preview: ${docs[0].getText().slice(0, 200)}...`);
  }
  
  // List all URLs fetched
  console.log(`\n🔗 URLs fetched:`);
  docs.forEach((doc, i) => {
    console.log(`   ${i + 1}. ${doc.metadata.url} (${doc.getText().length} chars)`);
  });
  
} catch (error) {
  console.error('❌ Crawl failed:', error);
  process.exit(1);
}

