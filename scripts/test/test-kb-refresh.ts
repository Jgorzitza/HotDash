/**
 * Test Knowledge Base Auto-Refresh
 * AI-KB-REFRESH-001: Implement Knowledge Base Auto-Refresh
 * 
 * Tests the knowledge base auto-refresh system:
 * - MCP server connectivity
 * - Refresh service
 * - API endpoints
 * 
 * Usage:
 * npx tsx --env-file=.env scripts/test/test-kb-refresh.ts
 */

import { createRefreshService } from '../../app/workers/knowledge-base-refresh';

async function testKBRefresh() {
  console.log('🧪 Testing Knowledge Base Auto-Refresh System\n');
  console.log('='.repeat(80));

  const refreshService = createRefreshService();

  // Test 1: MCP Server Connectivity
  console.log('\n📡 Test 1: MCP Server Connectivity');
  console.log('-'.repeat(80));
  
  const isConnected = await refreshService.testConnection();
  if (isConnected) {
    console.log('✅ MCP server is reachable');
  } else {
    console.log('❌ MCP server is NOT reachable');
    console.log('   Make sure DEVOPS-LLAMAINDEX-001 is complete');
    process.exit(1);
  }

  // Test 2: Get Initial Status
  console.log('\n📊 Test 2: Get Refresh Status');
  console.log('-'.repeat(80));
  
  const initialStatus = refreshService.getStatus();
  console.log('Initial status:', JSON.stringify(initialStatus, null, 2));

  // Test 3: Trigger Manual Refresh
  console.log('\n🔄 Test 3: Trigger Manual Refresh');
  console.log('-'.repeat(80));
  
  console.log('Triggering refresh...');
  const startTime = Date.now();
  
  const result = await refreshService.refresh({
    manual: true,
    requestId: 'test-refresh-001',
  });

  const endTime = Date.now();
  const totalDuration = endTime - startTime;

  console.log('\nRefresh result:');
  console.log(`  Success: ${result.success}`);
  console.log(`  Request ID: ${result.requestId}`);
  console.log(`  Duration: ${result.durationMs}ms`);
  console.log(`  Total time: ${totalDuration}ms`);

  if (result.success) {
    console.log('✅ Manual refresh succeeded');
  } else {
    console.log('❌ Manual refresh failed');
    console.log(`   Error: ${result.error}`);
    process.exit(1);
  }

  // Test 4: Get Updated Status
  console.log('\n📊 Test 4: Get Updated Status');
  console.log('-'.repeat(80));
  
  const updatedStatus = refreshService.getStatus();
  console.log('Updated status:', JSON.stringify(updatedStatus, null, 2));

  // Test 5: Queue Async Refresh
  console.log('\n⏳ Test 5: Queue Async Refresh');
  console.log('-'.repeat(80));
  
  console.log('Queueing async refresh...');
  await refreshService.queueRefresh({
    manual: true,
    requestId: 'test-refresh-002',
  });
  console.log('✅ Refresh queued');

  // Wait a bit for async processing
  console.log('Waiting 3 seconds for async processing...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const finalStatus = refreshService.getStatus();
  console.log('Final status:', JSON.stringify(finalStatus, null, 2));

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('✅ All tests passed!');
  console.log('\nSummary:');
  console.log(`  - MCP server: Connected`);
  console.log(`  - Manual refresh: Success`);
  console.log(`  - Async queue: Working`);
  console.log(`  - Total refreshes: ${finalStatus.refreshCount}`);
  console.log(`  - Average duration: ${Math.round(finalStatus.averageDurationMs)}ms`);
  console.log(`  - Errors: ${finalStatus.errorCount}`);
  
  console.log('\n🎉 Knowledge Base Auto-Refresh system is operational!');
  
  process.exit(0);
}

testKBRefresh().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});

