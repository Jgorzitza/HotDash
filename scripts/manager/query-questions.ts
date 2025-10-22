#!/usr/bin/env tsx
/**
 * Query tasks blocked waiting for manager decisions/answers
 * 
 * Usage: npx tsx --env-file=.env scripts/manager/query-questions.ts
 */

import 'dotenv/config';
import prisma from '../../app/db.server';

async function queryQuestions() {
  console.log('❓ Querying Questions/Decisions Needed from Agents\n');
  console.log('='.repeat(80));
  
  const questions = await prisma.decisionLog.findMany({
    where: {
      status: 'blocked',
      blockedBy: 'manager-decision'
    },
    orderBy: { createdAt: 'desc' }
  });
  
  if (questions.length === 0) {
    console.log('\n✅ No pending questions for manager!\n');
    return;
  }
  
  console.log(`\nFound ${questions.length} questions/decisions needed:\n`);
  
  questions.forEach((q, i) => {
    console.log(`${i + 1}. 🚧 ${q.actor.toUpperCase()} - ${q.taskId || 'No task ID'}`);
    console.log(`   Question: ${q.blockerDetails || q.rationale}`);
    console.log(`   Asked: ${q.createdAt.toISOString()}`);
    
    const payload = q.payload as any;
    if (payload) {
      if (payload.questionType) {
        console.log(`   Type: ${payload.questionType}`);
      }
      if (payload.options) {
        console.log(`   Options:`);
        payload.options.forEach((opt: string) => console.log(`      - ${opt}`));
      }
      if (payload.tradeoffs) {
        console.log(`   Tradeoffs: ${payload.tradeoffs}`);
      }
      if (payload.impact) {
        console.log(`   Impact: ${payload.impact}`);
      }
      if (payload.recommendation) {
        console.log(`   Agent Recommends: ${payload.recommendation}`);
      }
    }
    
    console.log('');
  });
  
  console.log('='.repeat(80));
  console.log('\n💡 Action: Manager should answer these questions and log responses:');
  console.log('```typescript');
  console.log('await logDecision({');
  console.log('  scope: "build",');
  console.log('  actor: "manager",');
  console.log('  action: "decision_made",');
  console.log('  rationale: "Decision on {TASK-ID}: Use option X because...",');
  console.log('  evidenceUrl: "feedback/manager/2025-10-22.md"');
  console.log('});');
  console.log('```');
  
  await prisma.$disconnect();
}

queryQuestions().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

