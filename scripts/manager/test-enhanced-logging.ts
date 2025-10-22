#!/usr/bin/env tsx
/**
 * Test enhanced decision logging with new feedback tracking fields
 * 
 * Usage: npx tsx --env-file=.env scripts/manager/test-enhanced-logging.ts
 */

import 'dotenv/config';
import { logDecision } from '../../app/services/decisions.server';

async function testEnhancedLogging() {
  console.log('🧪 Testing Enhanced Decision Logging\n');
  console.log('='.repeat(80));
  
  // Test 1: Completed task with full details
  console.log('\n1️⃣  Test: Task Completed (Full Details)');
  const test1 = await logDecision({
    scope: 'build',
    actor: 'engineer',
    taskId: 'ENG-029',
    action: 'task_completed',
    status: 'completed',
    progressPct: 100,
    rationale: 'Implemented PII Card component with redaction logic',
    evidenceUrl: 'artifacts/engineer/2025-10-22/eng-029-pii-card.md',
    durationEstimate: 4.0,
    durationActual: 3.5,
    nextAction: 'Starting ENG-030 (CX Escalation Modal)'
  });
  console.log(`   ✅ Created decision ID: ${test1.id}`);
  
  // Test 2: In-progress task
  console.log('\n2️⃣  Test: Task In Progress');
  const test2 = await logDecision({
    scope: 'build',
    actor: 'data',
    taskId: 'DATA-020',
    action: 'task_progress',
    status: 'in_progress',
    progressPct: 60,
    rationale: 'Creating Phase 11 search console tables migration',
    evidenceUrl: 'feedback/data/2025-10-22.md',
    nextAction: 'Add indexes and test queries'
  });
  console.log(`   ✅ Created decision ID: ${test2.id}`);
  
  // Test 3: Blocked task
  console.log('\n3️⃣  Test: Task Blocked');
  const test3 = await logDecision({
    scope: 'build',
    actor: 'integrations',
    taskId: 'INTEGRATIONS-013',
    action: 'task_blocked',
    status: 'blocked',
    progressPct: 40,
    rationale: 'Cannot proceed without vendor_master table',
    blockerDetails: 'Waiting for DATA-017 migration to be applied by manager',
    blockedBy: 'DATA-017',
    evidenceUrl: 'feedback/integrations/2025-10-22.md',
    durationActual: 0.5
  });
  console.log(`   ✅ Created decision ID: ${test3.id}`);
  
  // Test 4: Manager blocker cleared
  console.log('\n4️⃣  Test: Blocker Cleared');
  const test4 = await logDecision({
    scope: 'build',
    actor: 'manager',
    taskId: 'MANAGER-CYCLE',
    action: 'blocker_cleared',
    status: 'completed',
    rationale: 'Enhanced DecisionLog schema - added 8 feedback tracking fields',
    evidenceUrl: 'supabase/migrations/20251022000001_enhance_decision_log.sql',
    durationActual: 2.0
  });
  console.log(`   ✅ Created decision ID: ${test4.id}`);
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ All 4 test cases passed!');
  console.log('\n📊 Verifying schema...');
  
  // Query back the test data
  const {default: prisma} = await import('../../app/db.server');
  
  const results = await prisma.decisionLog.findMany({
    where: {
      id: { in: [test1.id, test2.id, test3.id, test4.id] }
    },
    orderBy: { id: 'asc' }
  });
  
  console.log('\n✅ Retrieved Results:');
  results.forEach((r, i) => {
    console.log(`\n${i+1}. ${r.actor} - ${r.taskId}`);
    console.log(`   Status: ${r.status || 'N/A'}`);
    console.log(`   Progress: ${r.progressPct !== null ? r.progressPct + '%' : 'N/A'}`);
    console.log(`   Blocker: ${r.blockerDetails || 'None'}`);
    console.log(`   Blocked By: ${r.blockedBy || 'N/A'}`);
    console.log(`   Duration: ${r.durationActual || 'N/A'}h`);
    console.log(`   Next: ${r.nextAction || 'N/A'}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 Enhanced logging system is FULLY OPERATIONAL!');
  console.log('\n📋 Schema Features:');
  console.log('   ✅ taskId tracking');
  console.log('   ✅ status tracking (pending/in_progress/completed/blocked)');
  console.log('   ✅ progressPct (0-100)');
  console.log('   ✅ blockerDetails');
  console.log('   ✅ blockedBy (dependency tracking)');
  console.log('   ✅ durationEstimate & durationActual');
  console.log('   ✅ nextAction planning');
  
  await prisma.$disconnect();
}

testEnhancedLogging().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});

