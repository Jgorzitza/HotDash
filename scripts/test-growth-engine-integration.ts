#!/usr/bin/env tsx

/**
 * Growth Engine Integration Test Runner
 * 
 * Runs comprehensive integration tests for the Growth Engine
 * QA-001: Growth Engine End-to-End Integration Testing
 */

import { execSync } from 'child_process';
import { logDecision } from '~/services/decisions.server';

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  evidence?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
  passed: number;
  failed: number;
  skipped: number;
}

async function main() {
  console.log('🚀 Starting Growth Engine Integration Tests');
  console.log('==========================================');

  const startTime = Date.now();
  const testSuites: TestSuite[] = [];

  try {
    // Run end-to-end tests
    console.log('\n📋 Running End-to-End Integration Tests...');
    const e2eResults = await runTestSuite('end-to-end');
    testSuites.push(e2eResults);

    // Run telemetry pipeline tests
    console.log('\n📊 Running Telemetry Pipeline Tests...');
    const telemetryResults = await runTestSuite('telemetry-pipeline');
    testSuites.push(telemetryResults);

    // Run approval workflow tests
    console.log('\n✅ Running Approval Workflow Tests...');
    const approvalResults = await runTestSuite('approval-workflow');
    testSuites.push(approvalResults);

    // Generate comprehensive report
    const totalDuration = Date.now() - startTime;
    const report = generateTestReport(testSuites, totalDuration);

    // Log test results
    await logTestResults(report);

    // Display summary
    displayTestSummary(report);

    // Exit with appropriate code
    const hasFailures = testSuites.some(suite => suite.failed > 0);
    process.exit(hasFailures ? 1 : 0);

  } catch (error) {
    console.error('❌ Test runner failed:', error);
    await logDecision({
      scope: 'build',
      actor: 'qa-helper',
      action: 'integration_test_failed',
      rationale: `Growth Engine integration test runner failed: ${error}`,
      evidenceUrl: 'scripts/test-growth-engine-integration.ts'
    });
    process.exit(1);
  }
}

async function runTestSuite(suiteName: string): Promise<TestSuite> {
  const startTime = Date.now();
  const tests: TestResult[] = [];

  try {
    console.log(`  Running ${suiteName} tests...`);
    
    // Run the test suite using vitest
    const testCommand = `npx vitest run tests/integration/growth-engine/${suiteName}.spec.ts --reporter=json`;
    
    try {
      const output = execSync(testCommand, { 
        encoding: 'utf-8',
        cwd: process.cwd(),
        timeout: 300000 // 5 minutes timeout
      });

      // Parse test results
      const results = JSON.parse(output);
      
      // Convert vitest results to our format
      for (const test of results.testResults) {
        tests.push({
          testName: test.name,
          status: test.status === 'passed' ? 'passed' : 'failed',
          duration: test.duration || 0,
          error: test.status === 'failed' ? test.error : undefined
        });
      }

    } catch (error: any) {
      // Handle test execution errors
      tests.push({
        testName: `${suiteName} suite`,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.message
      });
    }

  } catch (error) {
    console.error(`  ❌ Failed to run ${suiteName} tests:`, error);
    tests.push({
      testName: `${suiteName} suite`,
      status: 'failed',
      duration: Date.now() - startTime,
      error: String(error)
    });
  }

  const totalDuration = Date.now() - startTime;
  const passed = tests.filter(t => t.status === 'passed').length;
  const failed = tests.filter(t => t.status === 'failed').length;
  const skipped = tests.filter(t => t.status === 'skipped').length;

  return {
    name: suiteName,
    tests,
    totalDuration,
    passed,
    failed,
    skipped
  };
}

function generateTestReport(testSuites: TestSuite[], totalDuration: number) {
  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passed, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failed, 0);
  const totalSkipped = testSuites.reduce((sum, suite) => sum + suite.skipped, 0);

  const report = {
    summary: {
      totalSuites: testSuites.length,
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      totalDuration,
      successRate: totalTests > 0 ? (totalPassed / totalTests) * 100 : 0
    },
    suites: testSuites,
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };

  return report;
}

async function logTestResults(report: any) {
  try {
    await logDecision({
      scope: 'build',
      actor: 'qa-helper',
      action: 'integration_test_completed',
      rationale: `Growth Engine integration tests completed: ${report.summary.totalPassed}/${report.summary.totalTests} passed`,
      evidenceUrl: 'tests/integration/growth-engine/',
      payload: {
        summary: report.summary,
        suites: report.suites.map((suite: any) => ({
          name: suite.name,
          passed: suite.passed,
          failed: suite.failed,
          duration: suite.totalDuration
        }))
      }
    });
  } catch (error) {
    console.error('Failed to log test results:', error);
  }
}

function displayTestSummary(report: any) {
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`Total Suites: ${report.summary.totalSuites}`);
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Passed: ${report.summary.totalPassed}`);
  console.log(`Failed: ${report.summary.totalFailed}`);
  console.log(`Skipped: ${report.summary.totalSkipped}`);
  console.log(`Success Rate: ${report.summary.successRate.toFixed(1)}%`);
  console.log(`Total Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`);

  console.log('\n📋 Test Suites');
  console.log('===============');
  for (const suite of report.suites) {
    const status = suite.failed > 0 ? '❌' : '✅';
    console.log(`${status} ${suite.name}: ${suite.passed}/${suite.tests.length} passed (${(suite.totalDuration / 1000).toFixed(2)}s)`);
    
    if (suite.failed > 0) {
      console.log('  Failed tests:');
      for (const test of suite.tests) {
        if (test.status === 'failed') {
          console.log(`    - ${test.testName}: ${test.error}`);
        }
      }
    }
  }

  if (report.summary.totalFailed > 0) {
    console.log('\n❌ Some tests failed. Please review the output above.');
  } else {
    console.log('\n✅ All tests passed!');
  }
}

// Run the test runner
if (require.main === module) {
  main().catch(console.error);
}

export { main as runGrowthEngineIntegrationTests };
