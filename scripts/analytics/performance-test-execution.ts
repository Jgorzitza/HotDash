#!/usr/bin/env tsx

/**
 * Growth Engine Performance Test Execution Script
 * 
 * ANALYTICS-001: Execute comprehensive performance testing to validate optimization impact
 * Tests the ROI and performance improvements from Growth Engine optimizations
 */

import { GrowthEnginePerformanceTester } from '~/lib/growth-engine/performance-testing';
import { logDecision } from '~/services/decisions.server';

interface TestExecutionResult {
  success: boolean;
  suite: any;
  results: any[];
  summary: any;
  performanceGains: {
    responseTime: number;
    throughput: number;
    resourceUsage: number;
    cost: number;
    overall: number;
  };
  costSavings: {
    compute: number;
    storage: number;
    network: number;
    total: number;
    annual: number;
  };
  recommendations: string[];
  nextSteps: string[];
  evidence: {
    testResults: string;
    performanceMetrics: string;
    costAnalysis: string;
    recommendations: string;
  };
}

async function executePerformanceTests(): Promise<TestExecutionResult> {
  console.log('🚀 Starting Growth Engine Performance Testing...');
  
  try {
    const tester = new GrowthEnginePerformanceTester();
    const { suite, results, summary } = await tester.executeGrowthEnginePerformanceTests();
    
    console.log('✅ Performance testing completed successfully');
    console.log(`📊 Test Results: ${summary.passedTests}/${summary.totalTests} tests passed`);
    console.log(`📈 Overall Score: ${summary.overallScore.toFixed(1)}/100`);
    console.log(`💰 Cost Savings: $${summary.costSavings.annual.toFixed(2)}/year`);
    
    // Generate evidence
    const evidence = {
      testResults: `Performance Test Results: ${summary.passedTests}/${summary.totalTests} passed, Overall Score: ${summary.overallScore.toFixed(1)}/100`,
      performanceMetrics: `Performance Gains: Response Time +${summary.performanceGains.responseTime.toFixed(1)}%, Throughput +${summary.performanceGains.throughput.toFixed(1)}%, Resource Usage +${summary.performanceGains.resourceUsage.toFixed(1)}%`,
      costAnalysis: `Cost Savings: $${summary.costSavings.total.toFixed(2)}/hour, $${summary.costSavings.annual.toFixed(2)}/year`,
      recommendations: `Recommendations: ${summary.recommendations.length} items, Next Steps: ${summary.nextSteps.length} items`
    };
    
    const result: TestExecutionResult = {
      success: true,
      suite,
      results,
      summary,
      performanceGains: summary.performanceGains,
      costSavings: summary.costSavings,
      recommendations: summary.recommendations,
      nextSteps: summary.nextSteps,
      evidence
    };
    
    // Log the test execution results
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'performance_test_completed',
      rationale: `Performance testing completed with ${summary.passedTests}/${summary.totalTests} tests passed, ${summary.overallScore.toFixed(1)}% overall score, $${summary.costSavings.annual.toFixed(2)} annual savings`,
      evidenceUrl: 'scripts/analytics/performance-test-execution.ts'
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Performance testing failed:', error);
    
    // Log the failure
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'performance_test_failed',
      rationale: `Performance testing failed: ${error}`,
      evidenceUrl: 'scripts/analytics/performance-test-execution.ts'
    });
    
    throw error;
  }
}

async function generatePerformanceReport(result: TestExecutionResult): Promise<void> {
  console.log('\n📋 Performance Test Report');
  console.log('=' .repeat(50));
  
  // Test Summary
  console.log('\n📊 Test Summary:');
  console.log(`  Total Tests: ${result.summary.totalTests}`);
  console.log(`  Passed: ${result.summary.passedTests}`);
  console.log(`  Failed: ${result.summary.failedTests}`);
  console.log(`  Warnings: ${result.summary.warningTests}`);
  console.log(`  Errors: ${result.summary.errorTests}`);
  console.log(`  Overall Score: ${result.summary.overallScore.toFixed(1)}/100`);
  
  // Performance Gains
  console.log('\n📈 Performance Gains:');
  console.log(`  Response Time: +${result.performanceGains.responseTime.toFixed(1)}%`);
  console.log(`  Throughput: +${result.performanceGains.throughput.toFixed(1)}%`);
  console.log(`  Resource Usage: +${result.performanceGains.resourceUsage.toFixed(1)}%`);
  console.log(`  Cost: +${result.performanceGains.cost.toFixed(1)}%`);
  console.log(`  Overall: +${result.performanceGains.overall.toFixed(1)}%`);
  
  // Cost Savings
  console.log('\n💰 Cost Savings:');
  console.log(`  Compute: $${result.costSavings.compute.toFixed(2)}/hour`);
  console.log(`  Storage: $${result.costSavings.storage.toFixed(2)}/hour`);
  console.log(`  Network: $${result.costSavings.network.toFixed(2)}/hour`);
  console.log(`  Total: $${result.costSavings.total.toFixed(2)}/hour`);
  console.log(`  Annual: $${result.costSavings.annual.toFixed(2)}/year`);
  
  // Recommendations
  if (result.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    result.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }
  
  // Next Steps
  if (result.nextSteps.length > 0) {
    console.log('\n🎯 Next Steps:');
    result.nextSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
  }
  
  // Evidence Summary
  console.log('\n📁 Evidence:');
  console.log(`  Test Results: ${result.evidence.testResults}`);
  console.log(`  Performance Metrics: ${result.evidence.performanceMetrics}`);
  console.log(`  Cost Analysis: ${result.evidence.costAnalysis}`);
  console.log(`  Recommendations: ${result.evidence.recommendations}`);
}

async function main() {
  try {
    console.log('🎯 Growth Engine Performance Test Execution');
    console.log('==========================================');
    
    const result = await executePerformanceTests();
    await generatePerformanceReport(result);
    
    console.log('\n✅ Performance testing completed successfully!');
    console.log('📊 Results logged to decision database');
    console.log('📁 Evidence saved for audit trail');
    
  } catch (error) {
    console.error('\n❌ Performance testing failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { executePerformanceTests, generatePerformanceReport };
