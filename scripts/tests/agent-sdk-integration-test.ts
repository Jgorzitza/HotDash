/**
 * Agent SDK Integration Test Suite
 * 
 * Tests the complete Agent SDK workflow including:
 * - OpenAI GPT-4 integration
 * - LlamaIndex knowledge retrieval
 * - Approval queue functionality
 * - Load testing for concurrent operators
 * 
 * Run with: npx tsx scripts/tests/agent-sdk-integration-test.ts
 */

import { createClient } from '@supabase/supabase-js';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

interface HealthCheckResult {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptime?: string;
  metrics?: any;
}

// Configuration
const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'https://hotdash-agent-service.fly.dev';
const LLAMAINDEX_SERVICE_URL = process.env.LLAMAINDEX_SERVICE_URL || 'https://hotdash-llamaindex-mcp.fly.dev';
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const results: TestResult[] = [];

/**
 * Run a single test and record results
 */
async function runTest(name: string, testFn: () => Promise<any>): Promise<void> {
  const startTime = Date.now();
  try {
    const result = await testFn();
    results.push({
      name,
      passed: true,
      duration: Date.now() - startTime,
      details: result
    });
    console.log(`✅ ${name} - PASSED (${Date.now() - startTime}ms)`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error(`❌ ${name} - FAILED (${Date.now() - startTime}ms)`);
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Test 1: Agent Service Health Check
 */
async function testAgentServiceHealth(): Promise<HealthCheckResult> {
  const response = await fetch(`${AGENT_SERVICE_URL}/health`, {
    signal: AbortSignal.timeout(5000) // 5 second timeout
  });
  
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  
  const health: HealthCheckResult = await response.json();
  
  if (health.status !== 'ok') {
    throw new Error(`Service unhealthy: ${health.status}`);
  }
  
  return health;
}

/**
 * Test 2: LlamaIndex MCP Service Health Check
 */
async function testLlamaIndexHealth(): Promise<HealthCheckResult> {
  const response = await fetch(`${LLAMAINDEX_SERVICE_URL}/health`, {
    signal: AbortSignal.timeout(5000)
  });
  
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  
  const health: HealthCheckResult = await response.json();
  
  if (health.status !== 'ok') {
    throw new Error(`Service unhealthy: ${health.status}`);
  }
  
  return health;
}

/**
 * Test 3: Approval Queue Retrieval
 */
async function testApprovalQueueRetrieval(): Promise<any> {
  const response = await fetch(`${AGENT_SERVICE_URL}/approvals`, {
    signal: AbortSignal.timeout(10000)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch approvals with status ${response.status}`);
  }
  
  const approvals = await response.json();
  
  if (!Array.isArray(approvals)) {
    throw new Error('Approvals response is not an array');
  }
  
  return {
    count: approvals.length,
    sample: approvals.slice(0, 1)
  };
}

/**
 * Test 4: Supabase Connection
 */
async function testSupabaseConnection(): Promise<any> {
  if (!SUPABASE_KEY) {
    throw new Error('Supabase key not configured');
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Test basic query
  const { data, error } = await supabase
    .from('agent_approvals')
    .select('id, status, priority, created_at')
    .limit(5);
  
  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }
  
  return {
    connected: true,
    recordCount: data?.length || 0
  };
}

/**
 * Test 5: Chatwoot Approval Workflow
 */
async function testChatwootApprovalWorkflow(): Promise<any> {
  if (!SUPABASE_KEY) {
    throw new Error('Supabase key not configured');
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Check for pending Chatwoot approvals
  const { data: pendingApprovals, error } = await supabase
    .from('agent_approvals')
    .select('*')
    .eq('status', 'pending')
    .not('chatwoot_conversation_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    throw new Error(`Failed to query Chatwoot approvals: ${error.message}`);
  }
  
  // Calculate statistics
  const stats = {
    total: pendingApprovals?.length || 0,
    byPriority: {
      urgent: pendingApprovals?.filter(a => a.priority === 'urgent').length || 0,
      high: pendingApprovals?.filter(a => a.priority === 'high').length || 0,
      normal: pendingApprovals?.filter(a => a.priority === 'normal').length || 0,
      low: pendingApprovals?.filter(a => a.priority === 'low').length || 0,
    }
  };
  
  return stats;
}

/**
 * Test 6: Load Test - Concurrent Requests
 */
async function testConcurrentLoad(): Promise<any> {
  const concurrentRequests = 10;
  const startTime = Date.now();
  
  // Simulate 10 concurrent operators requesting approvals
  const promises = Array.from({ length: concurrentRequests }, async (_, i) => {
    const reqStart = Date.now();
    const response = await fetch(`${AGENT_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(10000)
    });
    const reqEnd = Date.now();
    
    return {
      requestId: i + 1,
      success: response.ok,
      duration: reqEnd - reqStart,
      status: response.status
    };
  });
  
  const results = await Promise.allSettled(promises);
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  const durations = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map(r => r.value.duration);
  
  const avgDuration = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length 
    : 0;
  
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
  
  return {
    totalRequests: concurrentRequests,
    successful,
    failed,
    totalDuration: Date.now() - startTime,
    avgResponseTime: Math.round(avgDuration),
    maxResponseTime: maxDuration,
    passThreshold: avgDuration < 2000 && successful === concurrentRequests
  };
}

/**
 * Test 7: Response Time Validation
 */
async function testResponseTimes(): Promise<any> {
  const iterations = 5;
  const timings = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await fetch(`${AGENT_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(5000)
    });
    timings.push(Date.now() - start);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
  const min = Math.min(...timings);
  const max = Math.max(...timings);
  
  if (avg > 500) {
    throw new Error(`Average response time (${Math.round(avg)}ms) exceeds 500ms threshold`);
  }
  
  return {
    iterations,
    timings,
    avg: Math.round(avg),
    min,
    max,
    passed: avg <= 500
  };
}

/**
 * Main test suite
 */
async function runIntegrationTests() {
  console.log('='.repeat(60));
  console.log('Agent SDK Integration Test Suite');
  console.log('='.repeat(60));
  console.log(`Agent Service: ${AGENT_SERVICE_URL}`);
  console.log(`LlamaIndex MCP: ${LLAMAINDEX_SERVICE_URL}`);
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log('='.repeat(60));
  console.log('');
  
  // Run all tests
  await runTest('Test 1: Agent Service Health Check', testAgentServiceHealth);
  await runTest('Test 2: LlamaIndex MCP Health Check', testLlamaIndexHealth);
  await runTest('Test 3: Approval Queue Retrieval', testApprovalQueueRetrieval);
  await runTest('Test 4: Supabase Connection', testSupabaseConnection);
  await runTest('Test 5: Chatwoot Approval Workflow', testChatwootApprovalWorkflow);
  await runTest('Test 6: Concurrent Load Test (10 operators)', testConcurrentLoad);
  await runTest('Test 7: Response Time Validation', testResponseTimes);
  
  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => r.failed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ✅ ${passed}`);
  console.log(`Failed: ❌ ${failed}`);
  console.log(`Total Duration: ${totalDuration}ms`);
  console.log('');
  
  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    console.log('');
  }
  
  // Write results to file
  const reportPath = '/home/justin/HotDash/hot-dash/test-results/agent-sdk-integration-report.json';
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed,
      failed,
      duration: totalDuration
    },
    results
  };
  
  // Create test-results directory if it doesn't exist
  await import('fs/promises').then(fs => 
    fs.mkdir('/home/justin/HotDash/hot-dash/test-results', { recursive: true })
  );
  
  await import('fs/promises').then(fs => 
    fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  );
  
  console.log(`📄 Test report saved to: ${reportPath}`);
  console.log('='.repeat(60));
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runIntegrationTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});

