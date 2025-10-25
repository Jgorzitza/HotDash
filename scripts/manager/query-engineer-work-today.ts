/**
 * Query Engineer Work Today
 * 
 * Get all engineer decisions from decision_log for today
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function queryEngineerWork() {
  console.log("🔧 ENGINEER WORK TODAY\n");
  console.log("=".repeat(80));

  const startOfToday = new Date('2025-10-24T00:00:00Z');

  const engineerWork = await prisma.decisionLog.findMany({
    where: {
      actor: 'engineer',
      createdAt: { gte: startOfToday }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`\nFound ${engineerWork.length} engineer decisions today\n`);

  // Group by task
  const byTask: Record<string, any[]> = {};
  for (const work of engineerWork) {
    const taskId = work.taskId || 'Unknown';
    if (!byTask[taskId]) byTask[taskId] = [];
    byTask[taskId].push(work);
  }

  // Display by task
  for (const [taskId, decisions] of Object.entries(byTask)) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 ${taskId} (${decisions.length} decisions)`);
    console.log('='.repeat(80));

    for (const decision of decisions) {
      console.log(`\n⏰ ${decision.createdAt.toISOString()}`);
      console.log(`   Action: ${decision.action}`);
      console.log(`   Status: ${decision.status || 'N/A'}`);
      console.log(`   Rationale: ${decision.rationale.substring(0, 200)}${decision.rationale.length > 200 ? '...' : ''}`);
      
      if (decision.payload) {
        const payload = decision.payload as any;
        if (payload.progressPct !== undefined) console.log(`   Progress: ${payload.progressPct}%`);
        if (payload.durationActual) console.log(`   Duration: ${payload.durationActual}h`);
      }
      
      if (decision.evidenceUrl) {
        console.log(`   Evidence: ${decision.evidenceUrl}`);
      }
    }
  }

  // Find completed tasks
  console.log(`\n\n${'='.repeat(80)}`);
  console.log("✅ COMPLETED TASKS");
  console.log('='.repeat(80));

  const completedTasks = new Set<string>();
  for (const work of engineerWork) {
    if (work.status === 'completed' || work.action.includes('complete')) {
      completedTasks.add(work.taskId || 'Unknown');
    }
  }

  console.log(`\nCompleted tasks: ${completedTasks.size}`);
  for (const taskId of completedTasks) {
    console.log(`   - ${taskId}`);
  }

  await prisma.$disconnect();
}

queryEngineerWork().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

