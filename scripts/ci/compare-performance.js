#!/usr/bin/env node
/**
 * Performance Comparison Utility
 * 
 * Compares current performance test results against baseline
 * to detect performance regressions.
 * 
 * Usage:
 *   node scripts/ci/compare-performance.js
 *   node scripts/ci/compare-performance.js --threshold 20
 */

import fs from 'fs/promises';
import path from 'path';

const REGRESSION_THRESHOLD = parseFloat(process.argv[2]?.replace('--threshold=', '') || '20'); // 20% slower is a regression
const RESULTS_DIR = './test-results';

async function loadJSON(filepath) {
  try {
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Could not load ${filepath}:`, error.message);
    return null;
  }
}

async function comparePerformance() {
  console.log('🔍 Performance Regression Detector\n');
  console.log(`   Regression Threshold: ${REGRESSION_THRESHOLD}%\n`);

  // Load baseline snapshot
  const baselinePath = path.join(RESULTS_DIR, 'performance-baseline-snapshot.json');
  const baselineData = await loadJSON(baselinePath);

  if (!baselineData) {
    console.log('⚠️  No baseline found. Run tests to create baseline:');
    console.log('   npm run test:perf:dashboard\n');
    return;
  }

  console.log(`✅ Baseline loaded from: ${baselinePath}`);
  console.log(`   Created: ${baselineData.timestamp}\n`);

  // Load current results
  const currentPath = path.join(RESULTS_DIR, 'performance-baseline.json');
  const currentData = await loadJSON(currentPath);

  if (!currentData || currentData.length === 0) {
    console.log('❌ No current performance data found. Run tests first:');
    console.log('   npm run test:perf:dashboard\n');
    return;
  }

  const currentResult = currentData[0]; // First test is the full dashboard load
  const baseline = baselineData.baseline;

  console.log('📊 Performance Comparison\n');
  console.log('='.repeat(80));

  let hasRegression = false;
  const regressions = [];
  const improvements = [];

  // Compare total dashboard time
  const totalDashboardDelta = calculateDelta(
    baseline.totalDashboardTime,
    currentResult.totalDashboardTime
  );
  
  console.log('\n🎯 Overall Dashboard Performance:');
  console.log(`   Baseline:  ${baseline.totalDashboardTime.toFixed(2)}ms`);
  console.log(`   Current:   ${currentResult.totalDashboardTime.toFixed(2)}ms`);
  console.log(`   Change:    ${totalDashboardDelta > 0 ? '+' : ''}${totalDashboardDelta.toFixed(2)}%`);
  
  if (totalDashboardDelta > REGRESSION_THRESHOLD) {
    console.log(`   ❌ REGRESSION DETECTED (>${REGRESSION_THRESHOLD}% slower)`);
    hasRegression = true;
    regressions.push({
      metric: 'Total Dashboard Time',
      baseline: baseline.totalDashboardTime,
      current: currentResult.totalDashboardTime,
      delta: totalDashboardDelta,
    });
  } else if (totalDashboardDelta < -10) {
    console.log(`   ✨ IMPROVEMENT (${Math.abs(totalDashboardDelta).toFixed(2)}% faster)`);
    improvements.push({
      metric: 'Total Dashboard Time',
      baseline: baseline.totalDashboardTime,
      current: currentResult.totalDashboardTime,
      delta: totalDashboardDelta,
    });
  } else {
    console.log(`   ✅ Within acceptable range`);
  }

  // Compare page load time
  if (baseline.pageLoadTime && currentResult.pageLoadTime) {
    const pageLoadDelta = calculateDelta(baseline.pageLoadTime, currentResult.pageLoadTime);
    console.log('\n📄 Page Load Time:');
    console.log(`   Baseline:  ${baseline.pageLoadTime.toFixed(2)}ms`);
    console.log(`   Current:   ${currentResult.pageLoadTime.toFixed(2)}ms`);
    console.log(`   Change:    ${pageLoadDelta > 0 ? '+' : ''}${pageLoadDelta.toFixed(2)}%`);
    
    if (pageLoadDelta > REGRESSION_THRESHOLD) {
      console.log(`   ❌ REGRESSION`);
      hasRegression = true;
      regressions.push({
        metric: 'Page Load Time',
        baseline: baseline.pageLoadTime,
        current: currentResult.pageLoadTime,
        delta: pageLoadDelta,
      });
    } else if (pageLoadDelta < -10) {
      console.log(`   ✨ IMPROVEMENT`);
      improvements.push({
        metric: 'Page Load Time',
        baseline: baseline.pageLoadTime,
        current: currentResult.pageLoadTime,
        delta: pageLoadDelta,
      });
    } else {
      console.log(`   ✅ OK`);
    }
  }

  // Compare individual tile metrics
  console.log('\n🎴 Individual Tile Performance:');
  
  const baselineTiles = Object.entries(baseline).filter(([key]) => key.startsWith('tile-'));
  const currentTiles = currentResult.tileMetrics || {};

  for (const [tileKey, baselineTime] of baselineTiles) {
    const tileName = tileKey.replace('tile-', '');
    const currentTime = currentTiles[tileKey];

    if (!currentTime) {
      console.log(`   ⚠️  ${tileName}: No current data`);
      continue;
    }

    const delta = calculateDelta(baselineTime, currentTime);
    
    console.log(`\n   ${tileName}:`);
    console.log(`      Baseline:  ${baselineTime.toFixed(2)}ms`);
    console.log(`      Current:   ${currentTime.toFixed(2)}ms`);
    console.log(`      Change:    ${delta > 0 ? '+' : ''}${delta.toFixed(2)}%`);

    if (delta > REGRESSION_THRESHOLD) {
      console.log(`      ❌ REGRESSION`);
      hasRegression = true;
      regressions.push({
        metric: `Tile: ${tileName}`,
        baseline: baselineTime,
        current: currentTime,
        delta,
      });
    } else if (delta < -10) {
      console.log(`      ✨ IMPROVEMENT`);
      improvements.push({
        metric: `Tile: ${tileName}`,
        baseline: baselineTime,
        current: currentTime,
        delta,
      });
    } else {
      console.log(`      ✅ OK`);
    }
  }

  console.log('\n' + '='.repeat(80));

  // Summary
  console.log('\n📋 Summary:\n');
  
  if (regressions.length > 0) {
    console.log(`   ❌ ${regressions.length} Performance Regression(s) Detected:\n`);
    regressions.forEach((reg) => {
      console.log(`      • ${reg.metric}`);
      console.log(`        ${reg.baseline.toFixed(2)}ms → ${reg.current.toFixed(2)}ms (+${reg.delta.toFixed(2)}%)`);
    });
  }

  if (improvements.length > 0) {
    console.log(`\n   ✨ ${improvements.length} Performance Improvement(s):\n`);
    improvements.forEach((imp) => {
      console.log(`      • ${imp.metric}`);
      console.log(`        ${imp.baseline.toFixed(2)}ms → ${imp.current.toFixed(2)}ms (${imp.delta.toFixed(2)}%)`);
    });
  }

  if (regressions.length === 0 && improvements.length === 0) {
    console.log('   ✅ No significant performance changes detected');
  }

  console.log('\n' + '='.repeat(80) + '\n');

  if (hasRegression) {
    console.log('❌ PERFORMANCE REGRESSION DETECTED\n');
    console.log('   Action Required:');
    console.log('   1. Review recent code changes');
    console.log('   2. Profile slow components');
    console.log('   3. Check for new dependencies');
    console.log('   4. Review database queries\n');
    process.exit(1);
  } else {
    console.log('✅ PERFORMANCE CHECK PASSED\n');
    process.exit(0);
  }
}

function calculateDelta(baseline, current) {
  return ((current - baseline) / baseline) * 100;
}

// Run comparison
comparePerformance().catch((error) => {
  console.error('💥 Error during performance comparison:', error);
  process.exit(1);
});

