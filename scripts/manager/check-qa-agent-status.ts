/**
 * Check QA Agent Status
 * 
 * Verify QA agent (not qa-helper) status and tasks
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkQAStatus() {
  console.log("🔍 QA AGENT STATUS\n");
  console.log("=".repeat(80));

  // Get all QA agent tasks
  const qaTasks = await prisma.taskAssignment.findMany({
    where: { assignedTo: 'qa' },
    orderBy: { priority: 'asc' }
  });

  console.log(`\nTotal QA agent tasks: ${qaTasks.length}\n`);

  // Group by status
  const byStatus = {
    completed: qaTasks.filter(t => t.status === 'completed'),
    in_progress: qaTasks.filter(t => t.status === 'in_progress'),
    assigned: qaTasks.filter(t => t.status === 'assigned'),
    blocked: qaTasks.filter(t => t.status === 'blocked')
  };

  console.log('By Status:');
  console.log(`  Completed: ${byStatus.completed.length}`);
  console.log(`  In Progress: ${byStatus.in_progress.length}`);
  console.log(`  Assigned: ${byStatus.assigned.length}`);
  console.log(`  Blocked: ${byStatus.blocked.length}`);

  console.log('\n' + '='.repeat(80));
  console.log('IN PROGRESS TASKS:\n');
  for (const task of byStatus.in_progress) {
    console.log(`${task.taskId}: ${task.title}`);
    console.log(`  Priority: ${task.priority}`);
    console.log(`  Estimated: ${task.estimatedHours}h`);
    console.log('');
  }

  console.log('='.repeat(80));
  console.log('ASSIGNED (NOT STARTED) TASKS:\n');
  for (const task of byStatus.assigned) {
    console.log(`${task.taskId}: ${task.title}`);
    console.log(`  Priority: ${task.priority}`);
    console.log(`  Estimated: ${task.estimatedHours}h`);
    console.log('');
  }

  console.log('='.repeat(80));
  console.log('BLOCKED TASKS:\n');
  for (const task of byStatus.blocked) {
    console.log(`${task.taskId}: ${task.title}`);
    console.log(`  Priority: ${task.priority}`);
    console.log(`  Estimated: ${task.estimatedHours}h`);
    console.log('');
  }

  // Check decision_log for QA agent activity today
  console.log('='.repeat(80));
  console.log('QA AGENT ACTIVITY TODAY (decision_log):\n');

  const qaDecisions = await prisma.decisionLog.findMany({
    where: {
      actor: 'qa',
      createdAt: { gte: new Date('2025-10-24T00:00:00Z') }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(`Found ${qaDecisions.length} decisions today\n`);
  for (const d of qaDecisions) {
    console.log(`${d.createdAt.toISOString()}: ${d.action}`);
    console.log(`  Task: ${d.taskId || 'N/A'}`);
    console.log(`  Status: ${d.status || 'N/A'}`);
    console.log('');
  }

  // Summary
  console.log('='.repeat(80));
  console.log('SUMMARY:\n');
  
  if (byStatus.in_progress.length > 0) {
    console.log(`✅ QA agent is WORKING (${byStatus.in_progress.length} tasks in progress)`);
  } else if (byStatus.assigned.length > 0) {
    console.log(`⚠️  QA agent has ${byStatus.assigned.length} assigned tasks (not started)`);
  } else if (byStatus.blocked.length > 0) {
    console.log(`🚫 QA agent is BLOCKED (${byStatus.blocked.length} blocked tasks)`);
  } else {
    console.log(`⚪ QA agent is IDLE (no active tasks)`);
  }

  await prisma.$disconnect();
}

checkQAStatus().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

