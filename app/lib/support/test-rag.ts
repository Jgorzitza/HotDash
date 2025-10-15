/**
 * Test RAG queries against the knowledge base
 * 
 * This script validates that the LlamaIndex MCP server can retrieve
 * accurate answers from the support KB content.
 */

const LLAMAINDEX_MCP_URL = process.env.LLAMAINDEX_MCP_URL || 'https://hotdash-llamaindex-mcp.fly.dev/mcp';

interface QueryResult {
  question: string;
  answer: string;
  success: boolean;
  error?: string;
}

async function queryRAG(question: string, topK: number = 5): Promise<QueryResult> {
  try {
    const response = await fetch(`${LLAMAINDEX_MCP_URL}/tools/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'query_support',
        arguments: {
          q: question,
          topK: topK,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`MCP server returned ${response.status}`);
    }

    const result = await response.json() as any;
    
    // MCP returns { content: [{ type: 'text', text: '...' }] }
    if (result.content && result.content[0]) {
      return {
        question,
        answer: result.content[0].text,
        success: true,
      };
    }

    return {
      question,
      answer: 'No answer found in knowledge base.',
      success: false,
    };
  } catch (error: any) {
    return {
      question,
      answer: '',
      success: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log('🧪 Testing RAG Queries\n');
  console.log('=' .repeat(80));
  
  const testQueries = [
    "How do I process a return?",
    "What's the shipping policy?",
    "How do I cancel an order?",
    "What size AN hose do I need for 600 HP?",
    "My fitting is leaking, what should I do?",
  ];

  const results: QueryResult[] = [];

  for (const question of testQueries) {
    console.log(`\n📝 Query: "${question}"`);
    console.log('-'.repeat(80));
    
    const result = await queryRAG(question);
    results.push(result);

    if (result.success) {
      console.log('✅ Success');
      console.log(`\n${result.answer}\n`);
    } else {
      console.log('❌ Failed');
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Test Summary\n');
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`Total queries: ${results.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`Success rate: ${((successCount / results.length) * 100).toFixed(1)}%`);

  if (failCount > 0) {
    console.log('\n⚠️  Failed queries:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - "${r.question}"`);
      if (r.error) console.log(`    Error: ${r.error}`);
    });
  }

  return results;
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(() => {
      console.log('\n✅ RAG testing complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ RAG testing failed:', error);
      process.exit(1);
    });
}

export { queryRAG, runTests };

