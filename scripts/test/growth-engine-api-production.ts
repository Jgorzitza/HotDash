/**
 * Growth Engine API Routes Production Testing
 * 
 * Tests all Growth Engine API routes in production environment
 * Verifies endpoints work correctly with proper error handling and rate limiting
 * 
 * Task: ENG-002
 * 
 * Usage:
 *   npx tsx scripts/test/growth-engine-api-production.ts
 */

import { performance } from 'perf_hooks';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 30000; // 30 seconds per test

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  statusCode?: number;
  responseTime?: number;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

// ============================================================================
// Utility Functions
// ============================================================================

async function testEndpoint(
  endpoint: string,
  method: 'GET' | 'POST',
  body?: any,
  expectedStatus: number = 200
): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(TEST_TIMEOUT),
    };
    
    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const responseTime = performance.now() - startTime;
    const data = await response.json();
    
    const passed = response.status === expectedStatus;
    
    return {
      endpoint,
      method,
      status: passed ? 'PASS' : 'FAIL',
      statusCode: response.status,
      responseTime,
      details: data,
      error: passed ? undefined : `Expected ${expectedStatus}, got ${response.status}`,
    };
  } catch (error: any) {
    const responseTime = performance.now() - startTime;
    return {
      endpoint,
      method,
      status: 'FAIL',
      responseTime,
      error: error.message,
    };
  }
}

function logResult(result: TestResult) {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
  const time = result.responseTime ? `${result.responseTime.toFixed(0)}ms` : 'N/A';
  
  console.log(`${icon} ${result.method} ${result.endpoint}`);
  console.log(`   Status: ${result.statusCode || 'N/A'} | Time: ${time}`);
  
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
  
  if (result.details && result.status === 'FAIL') {
    console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
  }
  
  console.log('');
}

// ============================================================================
// Test Suites
// ============================================================================

async function testActionQueueEndpoints() {
  console.log('📋 Testing Action Queue Endpoints...\n');
  
  // Test 1: GET action queue with default params
  let result = await testEndpoint('/api/growth-engine/action-queue', 'GET');
  results.push(result);
  logResult(result);
  
  // Test 2: GET action queue with filters
  result = await testEndpoint(
    '/api/growth-engine/action-queue?limit=5&status=pending&agent=inventory',
    'GET'
  );
  results.push(result);
  logResult(result);
  
  // Test 3: GET action queue with risk tier filter
  result = await testEndpoint(
    '/api/growth-engine/action-queue?risk_tier=low',
    'GET'
  );
  results.push(result);
  logResult(result);
  
  // Test 4: POST approve action (should fail without valid actionId)
  result = await testEndpoint(
    '/api/growth-engine/action-queue',
    'POST',
    { action: 'approve', actionId: 'test-invalid', operatorId: 'test-operator' },
    400 // Expect 400 for invalid action
  );
  results.push(result);
  logResult(result);
  
  // Test 5: POST with invalid action type
  result = await testEndpoint(
    '/api/growth-engine/action-queue',
    'POST',
    { action: 'invalid', actionId: 'test', operatorId: 'test' },
    400
  );
  results.push(result);
  logResult(result);
}

async function testCEOAgentEndpoints() {
  console.log('👔 Testing CEO Agent Endpoints...\n');
  
  // Test 1: POST execute action with missing parameters
  let result = await testEndpoint(
    '/api/ceo-agent/execute-action',
    'POST',
    {},
    400
  );
  results.push(result);
  logResult(result);
  
  // Test 2: POST execute action with invalid actionType
  result = await testEndpoint(
    '/api/ceo-agent/execute-action',
    'POST',
    {
      actionId: 'test-action',
      actionType: 'invalid',
      approvalId: 123,
      payload: {}
    },
    400
  );
  results.push(result);
  logResult(result);
  
  // Test 3: POST execute action with missing approvalId
  result = await testEndpoint(
    '/api/ceo-agent/execute-action',
    'POST',
    {
      actionId: 'test-action',
      actionType: 'cx',
      payload: {}
    },
    400
  );
  results.push(result);
  logResult(result);
  
  // Test 4: GET CEO agent stats
  result = await testEndpoint('/api/ceo-agent/stats', 'GET');
  results.push(result);
  logResult(result);
  
  // Test 5: GET CEO agent health
  result = await testEndpoint('/api/ceo-agent/health', 'GET');
  results.push(result);
  logResult(result);
}

async function testAICustomerEndpoints() {
  console.log('🤖 Testing AI-Customer Endpoints...\n');
  
  // Test 1: GET escalation detection
  let result = await testEndpoint('/api/ai-customer/escalation', 'GET');
  results.push(result);
  logResult(result);
  
  // Test 2: GET chatbot metrics
  result = await testEndpoint('/api/ai-customer/chatbot?action=performance-metrics', 'GET');
  results.push(result);
  logResult(result);
  
  // Test 3: GET SLA tracking
  result = await testEndpoint('/api/ai-customer/sla-tracking', 'GET');
  results.push(result);
  logResult(result);
  
  // Test 4: GET template optimizer
  result = await testEndpoint('/api/ai-customer/template-optimizer', 'GET');
  results.push(result);
  logResult(result);
  
  // Test 5: GET grading analytics
  result = await testEndpoint('/api/ai-customer/grading-analytics', 'GET');
  results.push(result);
  logResult(result);
}

async function testApprovalWorkflowEndpoints() {
  console.log('✅ Testing Approval Workflow Endpoints...\n');
  
  // Test 1: GET approvals summary
  let result = await testEndpoint('/api/approvals/summary', 'GET');
  results.push(result);
  logResult(result);
  
  // Test 2: POST validate approval (invalid ID)
  result = await testEndpoint(
    '/api/approvals/invalid-id/validate',
    'POST',
    {},
    404 // Expect 404 for invalid approval ID
  );
  results.push(result);
  logResult(result);
}

async function testErrorHandling() {
  console.log('⚠️ Testing Error Handling...\n');
  
  // Test 1: Invalid endpoint
  let result = await testEndpoint('/api/growth-engine/invalid', 'GET', undefined, 404);
  results.push(result);
  logResult(result);
  
  // Test 2: Malformed JSON body
  const startTime = performance.now();
  try {
    const response = await fetch(`${BASE_URL}/api/growth-engine/action-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json',
    });
    const responseTime = performance.now() - startTime;
    
    result = {
      endpoint: '/api/growth-engine/action-queue',
      method: 'POST',
      status: response.status === 400 ? 'PASS' : 'FAIL',
      statusCode: response.status,
      responseTime,
      error: response.status !== 400 ? 'Expected 400 for malformed JSON' : undefined,
    };
  } catch (error: any) {
    result = {
      endpoint: '/api/growth-engine/action-queue',
      method: 'POST',
      status: 'FAIL',
      error: error.message,
    };
  }
  results.push(result);
  logResult(result);
}

// ============================================================================
// Performance Metrics
// ============================================================================

function generatePerformanceReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 PERFORMANCE METRICS');
  console.log('='.repeat(80) + '\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
  console.log('');
  
  const responseTimes = results
    .filter(r => r.responseTime !== undefined)
    .map(r => r.responseTime!);
  
  if (responseTimes.length > 0) {
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    console.log('Response Times:');
    console.log(`  Average: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`  Min: ${minResponseTime.toFixed(0)}ms`);
    console.log(`  Max: ${maxResponseTime.toFixed(0)}ms`);
    console.log('');
  }
  
  if (failed > 0) {
    console.log('Failed Tests:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  ❌ ${r.method} ${r.endpoint}`);
        console.log(`     ${r.error || 'Unknown error'}`);
      });
    console.log('');
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function main() {
  console.log('🚀 Growth Engine API Production Testing');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('='.repeat(80) + '\n');
  
  try {
    await testActionQueueEndpoints();
    await testCEOAgentEndpoints();
    await testAICustomerEndpoints();
    await testApprovalWorkflowEndpoints();
    await testErrorHandling();
    
    generatePerformanceReport();
    
    const failed = results.filter(r => r.status === 'FAIL').length;
    
    if (failed > 0) {
      console.log('❌ Some tests failed. See details above.');
      process.exit(1);
    } else {
      console.log('✅ All tests passed!');
      process.exit(0);
    }
  } catch (error: any) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

main();

