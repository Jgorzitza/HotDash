#!/usr/bin/env tsx
/**
 * Test rich payload metadata functionality
 */

import 'dotenv/config';
import { logDecision, calculateSelfGradeAverage } from '../../app/services/decisions.server';

async function testPayloadMetadata() {
  console.log('🧪 Testing Rich Payload Metadata\n');
  console.log('='.repeat(80));
  
  // Test 1: Task completion with full payload
  console.log('\n1️⃣  Test: Task Completion with Rich Payload');
  await logDecision({
    scope: 'build',
    actor: 'test-agent',
    taskId: 'TEST-001',
    status: 'completed',
    progressPct: 100,
    action: 'task_completed',
    rationale: 'Test task complete - 15/15 tests passing, 3 files, 450 lines',
    evidenceUrl: 'artifacts/test/2025-10-22/test-001.md',
    durationEstimate: 4.0,
    durationActual: 3.5,
    nextAction: 'Starting TEST-002',
    payload: {
      commits: ['abc123f', 'def456g', 'ghi789h'],
      files: [
        { path: 'app/components/TestComponent.tsx', lines: 245, type: 'created' },
        { path: 'app/components/TestComponent.test.tsx', lines: 180, type: 'created' },
        { path: 'app/lib/test-utils.ts', lines: 25, type: 'modified' }
      ],
      tests: {
        unit: { passing: 10, total: 10 },
        integration: { passing: 5, total: 5 },
        overall: '15/15 passing'
      },
      mcpEvidence: {
        calls: 4,
        tools: ['context7-react-router', 'shopify-dev-polaris', 'context7-prisma'],
        conversationIds: ['conv-abc-123', 'conv-def-456'],
        evidenceFile: 'artifacts/test/2025-10-22/mcp/test-001.jsonl'
      },
      linesChanged: { added: 450, deleted: 12 },
      technicalNotes: 'Used Polaris Card as base component with custom redaction logic'
    }
  });
  console.log('   ✅ Created completion entry with full payload');
  
  // Test 2: Blocked with context
  console.log('\n2️⃣  Test: Blocked Task with Context Payload');
  await logDecision({
    scope: 'build',
    actor: 'test-agent',
    taskId: 'TEST-002',
    status: 'blocked',
    progressPct: 30,
    blockerDetails: 'Waiting for TEST-001 review before proceeding',
    blockedBy: 'TEST-001',
    action: 'task_blocked',
    rationale: 'Cannot proceed without approval on architecture decision',
    evidenceUrl: 'feedback/test/2025-10-22.md',
    payload: {
      blockerType: 'dependency',
      attemptedSolutions: [
        'Tried to proceed without - architecture unclear',
        'Looked for similar examples - none found'
      ],
      impact: 'Blocks TEST-003 and TEST-004 downstream',
      urgency: 'high'
    }
  });
  console.log('   ✅ Created blocked entry with context payload');
  
  // Test 3: Question for manager
  console.log('\n3️⃣  Test: Question for Manager Decision');
  await logDecision({
    scope: 'build',
    actor: 'test-agent',
    taskId: 'TEST-003',
    status: 'blocked',
    progressPct: 20,
    blockerDetails: 'Need manager decision on technical approach',
    blockedBy: 'manager-decision',
    action: 'awaiting_decision',
    rationale: 'Choice needed: Use library X vs library Y for data validation',
    evidenceUrl: 'feedback/test/2025-10-22.md',
    payload: {
      questionType: 'technical',
      options: ['Library X (Zod)', 'Library Y (Yup)'],
      tradeoffs: 'Zod: better TypeScript integration, Yup: more mature ecosystem',
      impact: 'Affects all future form validation',
      recommendation: 'Zod (better TypeScript support)'
    }
  });
  console.log('   ✅ Created question entry with decision payload');
  
  // Test 4: Shutdown with self-grading
  console.log('\n4️⃣  Test: Shutdown with Self-Grading');
  const grades = {
    progress: 5,
    evidence: 4,
    alignment: 5,
    toolDiscipline: 5,
    communication: 4
  };
  
  await logDecision({
    scope: 'build',
    actor: 'test-agent',
    action: 'shutdown',
    status: 'in_progress',
    progressPct: 65,
    rationale: 'Daily shutdown - TEST-001 complete, TEST-002 blocked, TEST-003 awaiting decision',
    durationActual: 5.5,
    payload: {
      dailySummary: 'TEST-001 complete (15/15 tests), TEST-002 blocked on review, TEST-003 needs decision',
      selfGrade: {
        ...grades,
        average: calculateSelfGradeAverage(grades)
      },
      retrospective: {
        didWell: [
          'Used MCP tools before writing any code (4 calls)',
          'Comprehensive test coverage (15/15 passing)',
          'Clear evidence in payload metadata'
        ],
        toChange: [
          'Ask manager questions earlier (waited 2h before escalating TEST-003)',
          'Update progress more frequently (went 3h without update)'
        ],
        toStop: 'Assuming library behavior without checking official docs first'
      },
      tasksCompleted: ['TEST-001'],
      hoursWorked: 5.5
    }
  });
  console.log('   ✅ Created shutdown entry with self-grade payload');
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ All 4 payload metadata tests passed!');
  console.log('\n📊 Now testing queries with payload data...\n');
}

testPayloadMetadata()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  });

