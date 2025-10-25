/**
 * Assign QA Agent Work
 * 
 * QA agent status:
 * - 2 completed tasks
 * - 2 blocked tasks (QA-AGENT-HANDOFFS-001, QA-004)
 * - 1 assigned task (QA-GE-001)
 * 
 * Action: Start QA-GE-001 (not blocked)
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { logDecision } from "../../app/services/decisions.server";

const prisma = new PrismaClient();

async function assignQAWork() {
  console.log("📋 QA AGENT WORK ASSIGNMENT\n");
  console.log("=".repeat(80));

  // Check current status
  const qaTasks = await prisma.taskAssignment.findMany({
    where: { assignedTo: 'qa' },
    select: { taskId: true, title: true, status: true, priority: true, estimatedHours: true }
  });

  console.log("\nCurrent QA Agent Tasks:\n");
  for (const task of qaTasks) {
    console.log(`${task.status.toUpperCase()}: ${task.taskId} - ${task.title} (${task.priority}, ${task.estimatedHours}h)`);
  }

  // Update blocked tasks to show why they're blocked
  console.log("\n" + "=".repeat(80));
  console.log("BLOCKED TASKS ANALYSIS:\n");

  // QA-AGENT-HANDOFFS-001 blocked by BLOCKER-001 (KB not populated)
  const blocker001 = await prisma.taskAssignment.findUnique({
    where: { taskId: 'BLOCKER-001' },
    select: { status: true }
  });

  console.log("QA-AGENT-HANDOFFS-001: Test All Agent Handoffs");
  console.log(`  Blocked by: BLOCKER-001 (Populate KB)`);
  console.log(`  BLOCKER-001 status: ${blocker001?.status || 'NOT FOUND'}`);
  
  if (blocker001?.status === 'completed') {
    console.log("  ✅ BLOCKER-001 is complete - QA-AGENT-HANDOFFS-001 can be unblocked!");
    
    // Unblock the task
    await prisma.taskAssignment.update({
      where: { taskId: 'QA-AGENT-HANDOFFS-001' },
      data: { status: 'assigned' }
    });
    console.log("  ✅ QA-AGENT-HANDOFFS-001 unblocked");
  } else {
    console.log("  ⏳ BLOCKER-001 still in progress - QA-AGENT-HANDOFFS-001 remains blocked");
  }

  // QA-004 blocked by BLOCKER-004 (Playwright build)
  const blocker004 = await prisma.taskAssignment.findUnique({
    where: { taskId: 'BLOCKER-004' },
    select: { status: true }
  });

  console.log("\nQA-004: Performance Testing Suite");
  console.log(`  Blocked by: BLOCKER-004 (Playwright build)`);
  console.log(`  BLOCKER-004 status: ${blocker004?.status || 'NOT FOUND'}`);
  
  if (blocker004?.status === 'completed') {
    console.log("  ✅ BLOCKER-004 is complete - QA-004 can be unblocked!");
    
    // Unblock the task
    await prisma.taskAssignment.update({
      where: { taskId: 'QA-004' },
      data: { status: 'assigned' }
    });
    console.log("  ✅ QA-004 unblocked");
  } else {
    console.log("  ⏳ BLOCKER-004 still in progress - QA-004 remains blocked");
  }

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("QA AGENT DIRECTION:\n");

  const updatedTasks = await prisma.taskAssignment.findMany({
    where: { assignedTo: 'qa' },
    select: { taskId: true, title: true, status: true, priority: true }
  });

  const assigned = updatedTasks.filter(t => t.status === 'assigned');
  const blocked = updatedTasks.filter(t => t.status === 'blocked');

  if (assigned.length > 0) {
    console.log(`✅ QA agent can start: ${assigned.length} tasks available\n`);
    for (const task of assigned) {
      console.log(`   - ${task.taskId}: ${task.title} (${task.priority})`);
    }
  }

  if (blocked.length > 0) {
    console.log(`\n⏳ QA agent blocked: ${blocked.length} tasks waiting\n`);
    for (const task of blocked) {
      console.log(`   - ${task.taskId}: ${task.title} (${task.priority})`);
    }
  }

  // Log decision
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'qa_agent_work_assigned',
    rationale: `Reviewed QA agent status. ${blocker001?.status === 'completed' ? 'Unblocked QA-AGENT-HANDOFFS-001 (BLOCKER-001 complete).' : 'QA-AGENT-HANDOFFS-001 remains blocked (BLOCKER-001 in progress).'} ${blocker004?.status === 'completed' ? 'Unblocked QA-004 (BLOCKER-004 complete).' : 'QA-004 remains blocked (BLOCKER-004 in progress).'} QA agent has ${assigned.length} tasks available to start.`,
    evidenceUrl: 'scripts/manager/check-qa-agent-status.ts',
    payload: {
      agent: 'qa',
      tasksAssigned: assigned.length,
      tasksBlocked: blocked.length,
      blocker001Status: blocker001?.status,
      blocker004Status: blocker004?.status,
      availableTasks: assigned.map(t => t.taskId)
    }
  });

  console.log("\n✅ Decision logged\n");

  await prisma.$disconnect();
}

assignQAWork().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

