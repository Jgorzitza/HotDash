import { answerQuery } from './src/pipeline/query.js';

console.log('🔍 Testing vector index query...\n');

const testQueries = [
  "What PTFE hoses do you sell?",
  "Tell me about fuel pumps",
  "What sizes of AN fittings are available?"
];

for (const query of testQueries) {
  console.log(`Query: "${query}"`);
  try {
    const result = await answerQuery(query, 3);
    console.log(`Response: ${result.response}`);
    console.log(`Sources: ${result.sources.length} documents`);
    console.log(`Processing time: ${result.metadata.processingTime}ms\n`);
  } catch (error) {
    console.error(`Error: ${error}\n`);
  }
}

console.log('✅ Test completed!');
