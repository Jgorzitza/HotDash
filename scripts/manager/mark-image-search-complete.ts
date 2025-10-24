/**
 * Mark Image Search Tasks Complete
 * 
 * Engineer completed BLOCKER-003 and all 3 ENG-IMAGE-SEARCH tasks
 * Evidence: decision_log shows completions at 17:49:54 and 17:54:57 UTC
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { logDecision } from "../../app/services/decisions.server";

const prisma = new PrismaClient();

async function markImageSearchComplete() {
  console.log("✅ Marking Image Search Tasks Complete\n");
  console.log("=".repeat(80));

  const imageSearchTasks = [
    'ENG-IMAGE-SEARCH-001',
    'ENG-IMAGE-SEARCH-002',
    'ENG-IMAGE-SEARCH-003'
  ];

  let markedCount = 0;
  for (const taskId of imageSearchTasks) {
    const result = await prisma.taskAssignment.updateMany({
      where: { 
        taskId,
        status: { not: 'completed' }
      },
      data: { 
        status: 'completed',
        completedAt: new Date('2025-10-24T17:54:57.029Z') // From decision_log
      }
    });

    if (result.count > 0) {
      console.log(`✅ ${taskId} marked complete`);
      markedCount++;
    } else {
      console.log(`⚠️  ${taskId} already complete or not found`);
    }
  }

  console.log(`\n✅ Marked ${markedCount} image search tasks as complete`);

  // Check engineer's remaining P0 tasks
  console.log("\n" + "=".repeat(80));
  console.log("Engineer Remaining P0 Tasks:\n");

  const p0Tasks = await prisma.taskAssignment.findMany({
    where: {
      assignedTo: 'engineer',
      priority: 'P0',
      status: { in: ['assigned', 'in_progress'] }
    },
    select: { taskId: true, title: true, status: true, estimatedHours: true }
  });

  if (p0Tasks.length > 0) {
    for (const task of p0Tasks) {
      console.log(`${task.taskId}: ${task.title} (${task.estimatedHours}h)`);
    }
    console.log(`\nTotal P0 remaining: ${p0Tasks.length} tasks, ${p0Tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)} hours`);
  } else {
    console.log("✅ NO P0 TASKS REMAINING - All critical work complete!");
  }

  // Log decision
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'image_search_tasks_marked_complete',
    rationale: `Marked ${markedCount} image search tasks as complete based on decision_log evidence. Engineer completed BLOCKER-003 at 17:49:54 UTC and ENG-IMAGE-SEARCH-003 at 17:54:57 UTC. All 3 ENG-IMAGE-SEARCH tasks now marked complete. Engineer has ${p0Tasks.length} P0 tasks remaining.`,
    evidenceUrl: 'decision_log (engineer, 2025-10-24 17:00-18:00 UTC)',
    payload: {
      tasksMarked: markedCount,
      tasks: imageSearchTasks,
      completedAt: '2025-10-24T17:54:57.029Z',
      remainingP0: p0Tasks.length,
      remainingP0Tasks: p0Tasks.map(t => t.taskId)
    }
  });

  console.log("\n✅ Decision logged\n");

  await prisma.$disconnect();
}

markImageSearchComplete().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

