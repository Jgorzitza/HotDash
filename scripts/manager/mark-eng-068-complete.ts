/**
 * Mark ENG-068 Complete
 * 
 * CEO confirmed: ENG-068 Status: COMPLETE
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { logDecision } from "../../app/services/decisions.server";

const prisma = new PrismaClient();

async function markComplete() {
  console.log("✅ Marking ENG-068 as complete...\n");

  const result = await prisma.taskAssignment.updateMany({
    where: { 
      taskId: 'ENG-068',
      status: { not: 'completed' }
    },
    data: { 
      status: 'completed',
      completedAt: new Date()
    }
  });

  if (result.count > 0) {
    console.log("✅ ENG-068 marked as completed");
  } else {
    console.log("⚠️  ENG-068 already marked complete or not found");
  }

  // Check engineer's remaining tasks
  console.log("\n📋 Engineer remaining tasks:\n");

  const engineerTasks = await prisma.taskAssignment.findMany({
    where: {
      assignedTo: 'engineer',
      status: { in: ['assigned', 'in_progress'] }
    },
    select: { taskId: true, title: true, status: true, priority: true, estimatedHours: true },
    orderBy: { priority: 'asc' }
  });

  for (const task of engineerTasks) {
    console.log(`${task.status.toUpperCase()}: ${task.taskId} - ${task.title} (${task.priority}, ${task.estimatedHours}h)`);
  }

  const totalHours = engineerTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  console.log(`\nTotal remaining: ${engineerTasks.length} tasks, ${totalHours} hours`);

  // Log decision
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'eng_068_marked_complete',
    rationale: `CEO confirmed ENG-068 (Enhanced Inventory Modal) is complete. Marked in database. Engineer now has ${engineerTasks.length} remaining tasks (${totalHours} hours): ${engineerTasks.map(t => t.taskId).join(', ')}.`,
    evidenceUrl: 'scripts/manager/mark-eng-068-complete.ts',
    payload: {
      taskId: 'ENG-068',
      agent: 'engineer',
      remainingTasks: engineerTasks.length,
      remainingHours: totalHours,
      tasks: engineerTasks.map(t => ({ taskId: t.taskId, priority: t.priority, hours: t.estimatedHours }))
    }
  });

  console.log("\n✅ Decision logged\n");

  await prisma.$disconnect();
}

markComplete().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

