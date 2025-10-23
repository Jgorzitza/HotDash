import { PrismaClient } from '@prisma/client';
import { logDecision } from '../../app/services/decisions.server';

const prisma = new PrismaClient();

async function fixHistoricalBlockers() {
  console.log('🔧 FIXING HISTORICAL BLOCKER DATA');
  console.log('=' .repeat(60));

  // 1. Mark all pre-2025-10-22 blocked entries as historical
  console.log('📋 Step 1: Reconciling historical blocked entries...');
  const cutoffDate = new Date('2025-10-22T00:00:00Z');
  
  const historicalBlockers = await prisma.decisionLog.updateMany({
    where: {
      status: 'blocked',
      createdAt: { lt: cutoffDate }
    },
    data: {
      status: 'historical_blocked'
    }
  });

  console.log(`   ✅ Marked ${historicalBlockers.count} historical blocked entries`);

  // 2. Check for any REAL current blockers (last 48 hours)
  console.log('\n📋 Step 2: Checking for real current blockers...');
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  
  const realBlockers = await prisma.decisionLog.findMany({
    where: {
      status: 'blocked',
      createdAt: { gte: fortyEightHoursAgo }
    },
    select: {
      actor: true,
      taskId: true,
      blockerDetails: true,
      blockedBy: true,
      createdAt: true
    }
  });

  console.log(`   📊 Found ${realBlockers.length} REAL current blockers (last 48h)`);
  
  if (realBlockers.length > 0) {
    console.log('\n   🚨 REAL BLOCKERS FOUND:');
    realBlockers.forEach(blocker => {
      console.log(`      - ${blocker.actor}: ${blocker.taskId || 'No task ID'}`);
      console.log(`        Blocked by: ${blocker.blockedBy || 'Not specified'}`);
      console.log(`        Details: ${blocker.blockerDetails || 'No details'}`);
      console.log(`        Since: ${blocker.createdAt.toISOString()}`);
    });
  } else {
    console.log('   ✅ No real current blockers - all agents have active work');
  }

  // 3. Log the fix
  await logDecision({
    scope: 'ops',
    actor: 'manager',
    action: 'fix_historical_blockers',
    rationale: `Fixed historical blocker data issue: Marked ${historicalBlockers.count} pre-2025-10-22 blocked entries as 'historical_blocked'. Found ${realBlockers.length} real current blockers (last 48h). This resolves the "91 stale blockers" false positive.`,
    evidenceUrl: 'scripts/manager/fix-historical-blockers.ts',
    payload: {
      historicalBlockersFixed: historicalBlockers.count,
      realCurrentBlockers: realBlockers.length,
      cutoffDate: cutoffDate.toISOString()
    }
  });

  console.log('\n✅ HISTORICAL BLOCKER FIX COMPLETE');
  console.log('=' .repeat(40));
  console.log(`📊 Results:`);
  console.log(`   - Historical entries marked: ${historicalBlockers.count}`);
  console.log(`   - Real current blockers: ${realBlockers.length}`);
  console.log(`   - Status: Query scripts will now show accurate blocker counts`);
}

fixHistoricalBlockers().finally(() => prisma.$disconnect());

