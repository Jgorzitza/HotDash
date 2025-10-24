/**
 * Test Script for Action Queue Ranking Algorithm Optimization
 *
 * Task: DATA-002
 * Purpose: Validate ranking algorithm improvements with test data
 */
import { ActionQueueOptimizer } from './action-queue-optimizer';
// ============================================================================
// Test Data
// ============================================================================
const testActions = [
    {
        id: 'action-1',
        name: 'SEO: High-value keyword optimization',
        expectedImpact: 500,
        confidence: 0.85,
        ease: 'simple',
        riskTier: 'none',
        freshnessLabel: 'Real-time',
        realizedRevenue28d: 450,
        executionCount: 5,
        successCount: 5,
        avgRealizedROI: 480
    },
    {
        id: 'action-2',
        name: 'Inventory: Reorder high-velocity SKU',
        expectedImpact: 1000,
        confidence: 0.70,
        ease: 'medium',
        riskTier: 'perf',
        freshnessLabel: '24h',
        realizedRevenue28d: 800,
        executionCount: 10,
        successCount: 8,
        avgRealizedROI: 850
    },
    {
        id: 'action-3',
        name: 'Content: Blog post on trending topic',
        expectedImpact: 300,
        confidence: 0.60,
        ease: 'hard',
        riskTier: 'none',
        freshnessLabel: '48-72h',
        realizedRevenue28d: 100,
        executionCount: 3,
        successCount: 1,
        avgRealizedROI: 120
    },
    {
        id: 'action-4',
        name: 'Ads: Campaign budget increase',
        expectedImpact: 2000,
        confidence: 0.90,
        ease: 'simple',
        riskTier: 'policy',
        freshnessLabel: 'Real-time',
        realizedRevenue28d: 1800,
        executionCount: 15,
        successCount: 14,
        avgRealizedROI: 1900
    },
    {
        id: 'action-5',
        name: 'New action: No historical data',
        expectedImpact: 750,
        confidence: 0.75,
        ease: 'medium',
        riskTier: 'safety',
        freshnessLabel: '24h',
        // No historical data
    }
];
// ============================================================================
// Test Functions
// ============================================================================
function testRankingAlgorithm(version) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing Ranking Algorithm: ${version}`);
    console.log('='.repeat(80));
    const results = testActions.map(action => {
        const result = ActionQueueOptimizer.calculateScore(action, version);
        result.actionId = action.id;
        return { ...result, name: action.name };
    });
    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    console.log('\nRanked Actions:');
    results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.name}`);
        console.log(`   Score: ${result.score.toFixed(2)}`);
        console.log(`   Factors:`);
        console.log(`     - Base Score: ${result.factors.baseScore.toFixed(2)}`);
        console.log(`     - Freshness Bonus: ${result.factors.freshnessBonus.toFixed(2)}`);
        console.log(`     - Risk Penalty: ${result.factors.riskPenalty.toFixed(2)}`);
        console.log(`     - Historical Bonus: ${result.factors.historicalBonus.toFixed(2)}`);
        if (result.factors.mlScore) {
            console.log(`     - ML Score: ${result.factors.mlScore.toFixed(2)}`);
        }
    });
    return results;
}
function compareRankings() {
    console.log(`\n${'='.repeat(80)}`);
    console.log('Comparing Ranking Algorithms');
    console.log('='.repeat(80));
    const v1Results = testRankingAlgorithm('v1_basic');
    const v2Results = testRankingAlgorithm('v2_hybrid');
    const v3Results = testRankingAlgorithm('v3_ml');
    console.log(`\n${'='.repeat(80)}`);
    console.log('Comparison Summary');
    console.log('='.repeat(80));
    console.log('\nTop Action by Version:');
    console.log(`  v1_basic:  ${v1Results[0].name} (${v1Results[0].score.toFixed(2)})`);
    console.log(`  v2_hybrid: ${v2Results[0].name} (${v2Results[0].score.toFixed(2)})`);
    console.log(`  v3_ml:     ${v3Results[0].name} (${v3Results[0].score.toFixed(2)})`);
    console.log('\nAverage Scores:');
    const v1Avg = v1Results.reduce((sum, r) => sum + r.score, 0) / v1Results.length;
    const v2Avg = v2Results.reduce((sum, r) => sum + r.score, 0) / v2Results.length;
    const v3Avg = v3Results.reduce((sum, r) => sum + r.score, 0) / v3Results.length;
    console.log(`  v1_basic:  ${v1Avg.toFixed(2)}`);
    console.log(`  v2_hybrid: ${v2Avg.toFixed(2)}`);
    console.log(`  v3_ml:     ${v3Avg.toFixed(2)}`);
    console.log('\nScore Deltas:');
    console.log(`  v2 - v1: ${(v2Avg - v1Avg).toFixed(2)}`);
    console.log(`  v3 - v1: ${(v3Avg - v1Avg).toFixed(2)}`);
    console.log(`  v3 - v2: ${(v3Avg - v2Avg).toFixed(2)}`);
    console.log('\nRanking Changes:');
    const v1Order = v1Results.map(r => r.actionId);
    const v3Order = v3Results.map(r => r.actionId);
    const changes = v1Order.filter((id, index) => id !== v3Order[index]).length;
    console.log(`  ${changes} out of ${v1Order.length} actions changed position (v1 → v3)`);
    console.log('\nRecommendation:');
    if (v3Avg - v1Avg > 10) {
        console.log('  ✅ Use v3_ml - Significant improvement in ranking quality');
    }
    else if (v2Avg - v1Avg > 5) {
        console.log('  ✅ Use v2_hybrid - Moderate improvement with lower complexity');
    }
    else {
        console.log('  ⚠️  Continue with v1_basic - Insufficient improvement to justify change');
    }
}
function testHistoricalPerformanceImpact() {
    console.log(`\n${'='.repeat(80)}`);
    console.log('Testing Historical Performance Impact');
    console.log('='.repeat(80));
    // Test action with varying historical performance
    const baseAction = {
        expectedImpact: 500,
        confidence: 0.80,
        ease: 'medium',
        riskTier: 'none',
        freshnessLabel: '24h'
    };
    const scenarios = [
        { name: 'No history', ...baseAction },
        { name: 'Poor history', ...baseAction, executionCount: 5, successCount: 1, avgRealizedROI: 100 },
        { name: 'Good history', ...baseAction, executionCount: 5, successCount: 4, avgRealizedROI: 600 },
        { name: 'Excellent history', ...baseAction, executionCount: 10, successCount: 10, avgRealizedROI: 800 }
    ];
    console.log('\nV3 ML Scores with Different Historical Performance:');
    scenarios.forEach(scenario => {
        const result = ActionQueueOptimizer.calculateScore(scenario, 'v3_ml');
        console.log(`\n${scenario.name}:`);
        console.log(`  Score: ${result.score.toFixed(2)}`);
        console.log(`  Success Rate: ${scenario.executionCount ? ((scenario.successCount || 0) / scenario.executionCount * 100).toFixed(0) : 'N/A'}%`);
        console.log(`  Avg ROI: $${scenario.avgRealizedROI || 0}`);
    });
}
// ============================================================================
// Run Tests
// ============================================================================
export function runTests() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║  Action Queue Ranking Algorithm Optimization Tests (DATA-002)             ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝');
    try {
        compareRankings();
        testHistoricalPerformanceImpact();
        console.log(`\n${'='.repeat(80)}`);
        console.log('✅ All tests completed successfully');
        console.log('='.repeat(80));
        console.log('\n');
    }
    catch (error) {
        console.error('\n❌ Test failed:', error);
        throw error;
    }
}
// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests();
}
//# sourceMappingURL=test-action-queue-optimizer.js.map