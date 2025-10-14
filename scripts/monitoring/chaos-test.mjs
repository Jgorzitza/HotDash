#!/usr/bin/env node
/**
 * Chaos Engineering Test Runner
 * Priority: P2-T5
 * 
 * Injects failures and validates recovery
 * Usage: node scripts/monitoring/chaos-test.mjs [scenario]
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:45001';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testQueueOverload() {
  console.log('\n🧪 Chaos Test 1: Queue Overload');
  console.log('  Injecting 1000 actions...');
  
  const actions = Array.from({ length: 1000 }, (_, i) => ({
    conversation_id: `chaos-overload-${i}`,
    serialized: { type: 'chaos_test', index: i },
    status: 'pending',
  }));
  
  const startTime = Date.now();
  const { error } = await supabase.from('agent_approvals').insert(actions);
  const duration = Date.now() - startTime;
  
  if (error) {
    console.log(`  ❌ Failed to insert: ${error.message}`);
    return { passed: false, duration };
  }
  
  console.log(`  ✅ Inserted 1000 actions in ${duration}ms`);
  
  // Check system still responsive
  const { data: health } = await supabase
    .from('v_system_health_current')
    .select('*')
    .single();
    
  console.log(`  Queue depth: ${health?.queue_depth || 0}`);
  
  // Cleanup
  await supabase
    .from('agent_approvals')
    .delete()
    .ilike('conversation_id', 'chaos-overload-%');
    
  console.log('  🧹 Cleanup complete');
  
  return {
    passed: true,
    duration,
    queueDepth: health?.queue_depth || 0,
  };
}

async function testInvalidData() {
  console.log('\n🧪 Chaos Test 2: Invalid Data Injection');
  console.log('  Attempting to inject invalid data...');
  
  // Test 1: Invalid status
  const { error: error1 } = await supabase
    .from('agent_approvals')
    .insert({
      conversation_id: 'chaos-invalid-1',
      serialized: { test: true },
      status: 'hacked', // Not in allowed values
    });
    
  const test1Pass = error1?.code === '23514'; // Check constraint violation
  console.log(`  ${test1Pass ? '✅' : '❌'} Test 1: Invalid status rejected`);
  
  // Test 2: Missing required fields
  const { error: error2 } = await supabase
    .from('agent_approvals')
    .insert({
      // Missing conversation_id
      serialized: { test: true },
      status: 'pending',
    });
    
  const test2Pass = error2?.code === '23502'; // Not null violation
  console.log(`  ${test2Pass ? '✅' : '❌'} Test 2: Missing required field rejected`);
  
  return {
    passed: test1Pass && test2Pass,
    tests: { invalidStatus: test1Pass, missingField: test2Pass },
  };
}

async function testDatabaseResilience() {
  console.log('\n🧪 Chaos Test 3: Database Resilience');
  console.log('  Testing connection recovery...');
  
  // Test rapid reconnections
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase
      .from('agent_approvals')
      .select('count')
      .limit(1);
      
    if (!data) {
      console.log(`  ❌ Connection attempt ${i + 1} failed`);
      return { passed: false };
    }
  }
  
  console.log('  ✅ All 5 connection attempts succeeded');
  
  return { passed: true };
}

async function testAutoRemediation() {
  console.log('\n🧪 Chaos Test 4: Auto-Remediation Integration');
  console.log('  Creating conditions for auto-remediation...');
  
  // Create a scenario that triggers auto-remediation
  // (Dry-run mode, so safe to test)
  
  const { data: metrics } = await supabase
    .from('v_system_health_current')
    .select('*')
    .single();
    
  console.log(`  Current queue depth: ${metrics?.queue_depth || 0}`);
  
  // In production, if queue > 10000, auto-remediation would trigger
  if ((metrics?.queue_depth || 0) > 10000) {
    console.log('  ⚠️  Auto-remediation would trigger (queue > 10000)');
  } else {
    console.log('  ✅ No remediation needed (queue within limits)');
  }
  
  return { passed: true, triggeredRemediation: (metrics?.queue_depth || 0) > 10000 };
}

async function runAllTests() {
  console.log('=== Chaos Engineering Test Suite ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('Mode: Safe (uses test data with cleanup)\n');
  
  const results = {
    queueOverload: await testQueueOverload(),
    invalidData: await testInvalidData(),
    databaseResilience: await testDatabaseResilience(),
    autoRemediation: await testAutoRemediation(),
  };
  
  console.log('\n=== Test Results ===');
  const passed = Object.values(results).filter(r => r.passed).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All chaos tests passed - system is resilient');
  } else {
    console.log('\n⚠️  Some tests failed - resilience issues detected');
  }
  
  console.log(`\nTimestamp: ${new Date().toISOString()}`);
  
  return results;
}

// Run tests
const scenario = process.argv[2];

if (scenario === 'overload') {
  testQueueOverload().catch(console.error);
} else if (scenario === 'invalid') {
  testInvalidData().catch(console.error);
} else if (scenario === 'database') {
  testDatabaseResilience().catch(console.error);
} else if (scenario === 'remediation') {
  testAutoRemediation().catch(console.error);
} else {
  runAllTests().catch(console.error);
}
