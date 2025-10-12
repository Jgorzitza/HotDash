/**
 * Hot Rod AN Content Verification
 * Test 50 queries covering all product categories
 */

import { answerQuery } from './src/pipeline/query.js';
import fs from 'fs/promises';

interface TestQuery {
  id: number;
  category: string;
  query: string;
  expectedKeywords: string[];
  criticalInfo: string[];
}

const testQueries: TestQuery[] = [
  // AN Fittings (10 queries)
  { id: 1, category: 'AN Fittings', query: 'What sizes of AN fittings do you sell?', expectedKeywords: ['AN-6', 'AN-8', 'AN-10'], criticalInfo: ['sizes'] },
  { id: 2, category: 'AN Fittings', query: 'Tell me about straight swivel fittings', expectedKeywords: ['straight', 'swivel', 'reusable'], criticalInfo: ['PTFE'] },
  { id: 3, category: 'AN Fittings', query: 'What are 45 degree fittings used for?', expectedKeywords: ['45', 'degree', 'swivel'], criticalInfo: ['angle'] },
  { id: 4, category: 'AN Fittings', query: 'Do you have 90 degree AN fittings?', expectedKeywords: ['90', 'degree', 'AN'], criticalInfo: ['AN-6', 'AN-8', 'AN-10'] },
  { id: 5, category: 'AN Fittings', query: 'What is a reusable AN fitting?', expectedKeywords: ['reusable', 'PTFE'], criticalInfo: ['ferrule'] },
  { id: 6, category: 'AN Fittings', query: 'What thread types do AN fittings use?', expectedKeywords: ['thread', 'fitting'], criticalInfo: [] },
  { id: 7, category: 'AN Fittings', query: 'Can I use AN fittings with fuel?', expectedKeywords: ['fuel', 'PTFE', 'compatible'], criticalInfo: [] },
  { id: 8, category: 'AN Fittings', query: 'What pressure rating do AN fittings have?', expectedKeywords: ['pressure', 'rating'], criticalInfo: [] },
  { id: 9, category: 'AN Fittings', query: 'What are Y adapter fittings?', expectedKeywords: ['Y', 'adapter'], criticalInfo: [] },
  { id: 10, category: 'AN Fittings', query: 'Do you sell ORB to AN adapters?', expectedKeywords: ['ORB', 'adapter', 'AN'], criticalInfo: ['O-ring'] },
  
  // PTFE Hoses (10 queries)
  { id: 11, category: 'PTFE Hoses', query: 'What colors of PTFE hose do you have?', expectedKeywords: ['black', 'nylon', 'braided'], criticalInfo: ['color', 'check'] },
  { id: 12, category: 'PTFE Hoses', query: 'Tell me about stainless braided hose', expectedKeywords: ['stainless', 'braided', 'PTFE'], criticalInfo: [] },
  { id: 13, category: 'PTFE Hoses', query: 'What is PTFE lined hose?', expectedKeywords: ['PTFE', 'lined', 'Teflon'], criticalInfo: [] },
  { id: 14, category: 'PTFE Hoses', query: 'Can PTFE hose handle E85 fuel?', expectedKeywords: ['PTFE', 'E85', 'fuel'], criticalInfo: ['compatible'] },
  { id: 15, category: 'PTFE Hoses', query: 'What temperature can PTFE hose handle?', expectedKeywords: ['temperature', 'PTFE'], criticalInfo: [] },
  { id: 16, category: 'PTFE Hoses', query: 'Do you have orange and black hose?', expectedKeywords: ['orange', 'black', 'check'], criticalInfo: [] },
  { id: 17, category: 'PTFE Hoses', query: 'What about purple braided hose?', expectedKeywords: ['purple', 'check', 'braided'], criticalInfo: [] },
  { id: 18, category: 'PTFE Hoses', query: 'Is nylon braided better than stainless?', expectedKeywords: ['nylon', 'stainless', 'braided'], criticalInfo: [] },
  { id: 19, category: 'PTFE Hoses', query: 'What sizes of PTFE hose are available?', expectedKeywords: ['AN-6', 'AN-8', 'AN-10'], criticalInfo: [] },
  { id: 20, category: 'PTFE Hoses', query: 'Can I use PTFE hose for brake lines?', expectedKeywords: ['PTFE', 'brake'], criticalInfo: [] },
  
  // Fuel Pumps (8 queries)
  { id: 21, category: 'Fuel Pumps', query: 'What fuel pumps do you sell?', expectedKeywords: ['Walbro', 'Aeromotive', 'fuel pump'], criticalInfo: ['LPH'] },
  { id: 22, category: 'Fuel Pumps', query: 'Tell me about Walbro 255 LPH pump', expectedKeywords: ['Walbro', '255', 'LPH'], criticalInfo: ['in-tank', 'inline'] },
  { id: 23, category: 'Fuel Pumps', query: 'What is an in-tank fuel pump?', expectedKeywords: ['in-tank', 'fuel pump'], criticalInfo: [] },
  { id: 24, category: 'Fuel Pumps', query: 'Do you have inline fuel pumps?', expectedKeywords: ['inline', 'fuel pump', 'Walbro'], criticalInfo: [] },
  { id: 25, category: 'Fuel Pumps', query: 'What LPH rating do I need for LS swap?', expectedKeywords: ['LPH', 'LS'], criticalInfo: ['horsepower'] },
  { id: 26, category: 'Fuel Pumps', query: 'Tell me about Aeromotive Stealth pump', expectedKeywords: ['Aeromotive', 'Stealth', '340'], criticalInfo: ['LPH'] },
  { id: 27, category: 'Fuel Pumps', query: 'What about Spectra Premium pump?', expectedKeywords: ['Spectra', 'Premium'], criticalInfo: [] },
  { id: 28, category: 'Fuel Pumps', query: 'Can these pumps handle E85?', expectedKeywords: ['E85', 'fuel', 'compatible'], criticalInfo: [] },
  
  // Fuel System Components (7 queries)
  { id: 29, category: 'Fuel Components', query: 'Do you sell fuel filters?', expectedKeywords: ['fuel filter', 'inline'], criticalInfo: [] },
  { id: 30, category: 'Fuel Components', query: 'What about fuel pressure regulators?', expectedKeywords: ['regulator', 'pressure', 'fuel'], criticalInfo: [] },
  { id: 31, category: 'Fuel Components', query: 'Tell me about the Corvette style filter regulator', expectedKeywords: ['Corvette', 'filter', 'regulator'], criticalInfo: ['AN6'] },
  { id: 32, category: 'Fuel Components', query: 'What is a fuel pressure gauge for?', expectedKeywords: ['gauge', 'pressure', 'fuel'], criticalInfo: [] },
  { id: 33, category: 'Fuel Components', query: 'Do you have EFI quick connect fittings?', expectedKeywords: ['EFI', 'quick connect'], criticalInfo: [] },
  { id: 34, category: 'Fuel Components', query: 'What are positive seal O-ring adapters?', expectedKeywords: ['O-ring', 'adapter', 'seal'], criticalInfo: [] },
  { id: 35, category: 'Fuel Components', query: 'Tell me about hard line tube fittings', expectedKeywords: ['hard line', 'tube', 'fitting'], criticalInfo: [] },
  
  // Bundle Deals (5 queries)
  { id: 36, category: 'Bundles', query: 'Do you have hose and fitting kits?', expectedKeywords: ['bundle', 'kit', 'hose', 'fitting'], criticalInfo: [] },
  { id: 37, category: 'Bundles', query: 'What comes in the AN-6 bundle?', expectedKeywords: ['AN-6', 'bundle', '8 fittings'], criticalInfo: [] },
  { id: 38, category: 'Bundles', query: 'Tell me about LS fuel line kits', expectedKeywords: ['LS', 'fuel line', 'kit'], criticalInfo: ['return', 'returnless'] },
  { id: 39, category: 'Bundles', query: 'What is included in return style kit?', expectedKeywords: ['return', 'style', 'kit'], criticalInfo: [] },
  { id: 40, category: 'Bundles', query: 'Do you have returnless fuel kits?', expectedKeywords: ['returnless', 'fuel', 'kit'], criticalInfo: [] },
  
  // Installation Tools (5 queries)
  { id: 41, category: 'Tools', query: 'What tools do I need for AN fittings?', expectedKeywords: ['tool', 'wrench', 'vise'], criticalInfo: [] },
  { id: 42, category: 'Tools', query: 'Tell me about the aluminum vice jaws', expectedKeywords: ['aluminum', 'vice', 'jaw'], criticalInfo: ['PTFE'] },
  { id: 43, category: 'Tools', query: 'Do you sell hose cutting tools?', expectedKeywords: ['shear', 'cutting', 'hose'], criticalInfo: [] },
  { id: 44, category: 'Tools', query: 'What is a spanner wrench used for?', expectedKeywords: ['spanner', 'wrench', 'fitting'], criticalInfo: [] },
  { id: 45, category: 'Tools', query: 'Do you have replacement ferrules?', expectedKeywords: ['ferrule', 'replacement'], criticalInfo: [] },
  
  // Technical/Application (5 queries)
  { id: 46, category: 'Technical', query: 'What size hose for LS swap fuel system?', expectedKeywords: ['LS', 'fuel', 'AN'], criticalInfo: ['horsepower'] },
  { id: 47, category: 'Technical', query: 'How do I install PTFE fittings?', expectedKeywords: ['install', 'PTFE', 'fitting'], criticalInfo: [] },
  { id: 48, category: 'Technical', query: 'What is the difference between AN-6 and AN-8?', expectedKeywords: ['AN-6', 'AN-8', 'size'], criticalInfo: ['diameter'] },
  { id: 49, category: 'Technical', query: 'Can I mix nylon and stainless hose?', expectedKeywords: ['nylon', 'stainless'], criticalInfo: [] },
  { id: 50, category: 'Technical', query: 'What pressure rating do I need for fuel system?', expectedKeywords: ['pressure', 'rating', 'fuel'], criticalInfo: [] },
];

console.log('🚀 Hot Rod AN Content Verification Test Suite\n');
console.log(`Testing ${testQueries.length} queries across all product categories\n`);
console.log('='.repeat(80) + '\n');

const results: Array<{
  query: TestQuery;
  response: string;
  sourceCount: number;
  processingTime: number;
  keywordsFound: string[];
  keywordScore: number;
  accuracyScore: number;
  completenessScore: number;
}> = [];

for (const testQuery of testQueries) {
  try {
    console.log(`[${testQuery.id}/50] ${testQuery.category}: "${testQuery.query}"`);
    
    const result = await answerQuery(testQuery.query, 3);
    const responseLower = result.response.toLowerCase();
    
    // Check expected keywords
    const keywordsFound = testQuery.expectedKeywords.filter(kw => 
      responseLower.includes(kw.toLowerCase())
    );
    const keywordScore = keywordsFound.length / testQuery.expectedKeywords.length;
    
    // Check critical information
    const criticalFound = testQuery.criticalInfo.filter(info =>
      responseLower.includes(info.toLowerCase())
    );
    const completenessScore = testQuery.criticalInfo.length === 0 ? 1 : 
      criticalFound.length / testQuery.criticalInfo.length;
    
    // Overall accuracy score (0-1)
    const accuracyScore = (keywordScore + completenessScore) / 2;
    
    results.push({
      query: testQuery,
      response: result.response,
      sourceCount: result.sources.length,
      processingTime: result.metadata.processingTime,
      keywordsFound,
      keywordScore,
      accuracyScore,
      completenessScore,
    });
    
    console.log(`  ✓ Response in ${result.metadata.processingTime}ms`);
    console.log(`  ✓ Accuracy: ${(accuracyScore * 100).toFixed(0)}% (${keywordsFound.length}/${testQuery.expectedKeywords.length} keywords)`);
    console.log(`  ✓ Sources: ${result.sources.length}\n`);
    
  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}\n`);
    results.push({
      query: testQuery,
      response: `ERROR: ${error.message}`,
      sourceCount: 0,
      processingTime: 0,
      keywordsFound: [],
      keywordScore: 0,
      accuracyScore: 0,
      completenessScore: 0,
    });
  }
}

// Calculate overall statistics
const totalQueries = results.length;
const successfulQueries = results.filter(r => r.accuracyScore > 0).length;
const avgAccuracy = results.reduce((sum, r) => sum + r.accuracyScore, 0) / totalQueries;
const avgProcessingTime = results.filter(r => r.processingTime > 0).reduce((sum, r) => sum + r.processingTime, 0) / successfulQueries;
const highAccuracy = results.filter(r => r.accuracyScore >= 0.9).length;
const mediumAccuracy = results.filter(r => r.accuracyScore >= 0.7 && r.accuracyScore < 0.9).length;
const lowAccuracy = results.filter(r => r.accuracyScore < 0.7).length;

// Summary report
console.log('\n' + '='.repeat(80));
console.log('VERIFICATION RESULTS SUMMARY');
console.log('='.repeat(80) + '\n');

console.log(`Total Queries: ${totalQueries}`);
console.log(`Successful: ${successfulQueries} (${(successfulQueries/totalQueries*100).toFixed(1)}%)`);
console.log(`Average Accuracy: ${(avgAccuracy * 100).toFixed(1)}%`);
console.log(`Average Processing Time: ${avgProcessingTime.toFixed(0)}ms\n`);

console.log('Accuracy Distribution:');
console.log(`  High (≥90%): ${highAccuracy} queries (${(highAccuracy/totalQueries*100).toFixed(1)}%)`);
console.log(`  Medium (70-89%): ${mediumAccuracy} queries (${(mediumAccuracy/totalQueries*100).toFixed(1)}%)`);
console.log(`  Low (<70%): ${lowAccuracy} queries (${(lowAccuracy/totalQueries*100).toFixed(1)}%)\n`);

// Category breakdown
const categories = Array.from(new Set(testQueries.map(q => q.category)));
console.log('Category Performance:');
categories.forEach(cat => {
  const catResults = results.filter(r => r.query.category === cat);
  const catAvg = catResults.reduce((sum, r) => sum + r.accuracyScore, 0) / catResults.length;
  console.log(`  ${cat}: ${(catAvg * 100).toFixed(1)}% (${catResults.length} queries)`);
});

// Low performers (need attention)
const lowPerformers = results.filter(r => r.accuracyScore < 0.7);
if (lowPerformers.length > 0) {
  console.log(`\n⚠️  LOW ACCURACY QUERIES (${lowPerformers.length}):` );
  lowPerformers.forEach(r => {
    console.log(`  - [${r.query.id}] ${r.query.query}`);
    console.log(`    Accuracy: ${(r.accuracyScore * 100).toFixed(0)}% | Found: ${r.keywordsFound.join(', ') || 'none'}`);
  });
}

// Save detailed results
const reportPath = 'packages/memory/logs/verification/hot-rod-an-verification-' + new Date().toISOString().slice(0,10) + '.json';
await fs.mkdir('packages/memory/logs/verification', { recursive: true });
await fs.writeFile(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    totalQueries,
    successfulQueries,
    avgAccuracy,
    avgProcessingTime,
    highAccuracy,
    mediumAccuracy,
    lowAccuracy,
  },
  categoryPerformance: categories.map(cat => {
    const catResults = results.filter(r => r.query.category === cat);
    return {
      category: cat,
      queries: catResults.length,
      avgAccuracy: catResults.reduce((sum, r) => sum + r.accuracyScore, 0) / catResults.length
    };
  }),
  detailedResults: results.map(r => ({
    id: r.query.id,
    category: r.query.category,
    query: r.query.query,
    response: r.response,
    sourceCount: r.sourceCount,
    processingTime: r.processingTime,
    accuracyScore: r.accuracyScore,
    keywordsFound: r.keywordsFound,
    expectedKeywords: r.query.expectedKeywords,
  }))
}, null, 2));

console.log(`\n✅ Detailed results saved to: ${reportPath}`);
console.log(`\n🎯 VERIFICATION ${avgAccuracy >= 0.9 ? 'PASSED ✅' : avgAccuracy >= 0.7 ? 'ACCEPTABLE ⚠️' : 'NEEDS IMPROVEMENT ❌'}`);
console.log(`   Target: ≥90% accuracy | Actual: ${(avgAccuracy * 100).toFixed(1)}%\n`);

