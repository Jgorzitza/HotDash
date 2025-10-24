/**
 * Review ALL Completed Work from decision_log
 * 
 * Thoroughly review decision_log to find all completed work
 * and update task statuses in database
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function reviewCompletedWork() {
  console.log("📋 REVIEWING ALL COMPLETED WORK FROM DECISION_LOG\n");
  console.log("=".repeat(80));

  // Get all decisions from today with status='completed' or action containing 'complete'
  const completedDecisions = await prisma.decision_log.findMany({
    where: {
      createdAt: {
        gte: new Date('2025-10-24T00:00:00Z')
      },
      OR: [
        { payload: { path: ['status'], equals: 'completed' } },
        { action: { contains: 'complete' } },
        { action: { contains: 'finished' } },
        { action: { contains: 'done' } },
        { rationale: { contains: 'COMPLETE' } },
        { rationale: { contains: 'complete' } }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`\n📊 Found ${completedDecisions.length} completion-related decisions\n`);

  // Group by agent
  const byAgent: Record<string, any[]> = {};
  for (const decision of completedDecisions) {
    if (!byAgent[decision.actor]) {
      byAgent[decision.actor] = [];
    }
    byAgent[decision.actor].push(decision);
  }

  // Display by agent
  for (const [agent, decisions] of Object.entries(byAgent)) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 ${agent.toUpperCase()} (${decisions.length} completions)`);
    console.log('='.repeat(80));

    for (const decision of decisions) {
      console.log(`\n⏰ ${decision.createdAt.toISOString()}`);
      console.log(`   Action: ${decision.action}`);
      console.log(`   Rationale: ${decision.rationale.substring(0, 200)}${decision.rationale.length > 200 ? '...' : ''}`);
      
      if (decision.payload) {
        const payload = decision.payload as any;
        if (payload.taskId) console.log(`   Task ID: ${payload.taskId}`);
        if (payload.status) console.log(`   Status: ${payload.status}`);
        if (payload.progressPct !== undefined) console.log(`   Progress: ${payload.progressPct}%`);
      }
      
      if (decision.evidenceUrl) {
        console.log(`   Evidence: ${decision.evidenceUrl}`);
      }
    }
  }

  // Now find tasks that should be marked complete
  console.log(`\n\n${'='.repeat(80)}`);
  console.log("🔍 IDENTIFYING TASKS TO MARK COMPLETE");
  console.log('='.repeat(80));

  const tasksToComplete: string[] = [];

  // Check each agent's decisions for completed work
  for (const [agent, decisions] of Object.entries(byAgent)) {
    for (const decision of decisions) {
      const payload = decision.payload as any;
      
      // Look for explicit task completion
      if (payload?.taskId && payload?.status === 'completed') {
        tasksToComplete.push(payload.taskId);
      }
      
      // Look for completion keywords in rationale
      if (decision.rationale.includes('COMPLETE') || decision.rationale.includes('complete')) {
        // Try to extract task ID from rationale or evidence
        const taskIdMatch = decision.rationale.match(/([A-Z]+-[A-Z0-9-]+)/);
        if (taskIdMatch && !tasksToComplete.includes(taskIdMatch[1])) {
          tasksToComplete.push(taskIdMatch[1]);
        }
      }
    }
  }

  console.log(`\n📋 Tasks identified for completion: ${tasksToComplete.length}`);
  for (const taskId of tasksToComplete) {
    console.log(`   - ${taskId}`);
  }

  // Get current status of these tasks
  console.log(`\n\n${'='.repeat(80)}`);
  console.log("📊 CURRENT TASK STATUS IN DATABASE");
  console.log('='.repeat(80));

  for (const taskId of tasksToComplete) {
    const task = await prisma.taskAssignment.findUnique({
      where: { taskId },
      select: { taskId: true, title: true, status: true, assignedTo: true }
    });

    if (task) {
      console.log(`\n${taskId}: ${task.title}`);
      console.log(`   Assigned to: ${task.assignedTo}`);
      console.log(`   Current status: ${task.status}`);
      console.log(`   ${task.status === 'completed' ? '✅ Already marked complete' : '⚠️  Needs update to completed'}`);
    } else {
      console.log(`\n${taskId}: NOT FOUND IN DATABASE`);
    }
  }

  // Update tasks that need it
  console.log(`\n\n${'='.repeat(80)}`);
  console.log("✅ UPDATING TASK STATUSES");
  console.log('='.repeat(80));

  let updateCount = 0;
  for (const taskId of tasksToComplete) {
    const task = await prisma.taskAssignment.findUnique({
      where: { taskId },
      select: { status: true }
    });

    if (task && task.status !== 'completed') {
      await prisma.taskAssignment.update({
        where: { taskId },
        data: { 
          status: 'completed',
          completedAt: new Date()
        }
      });
      console.log(`✅ ${taskId}: Updated to completed`);
      updateCount++;
    }
  }

  console.log(`\n📊 Summary: ${updateCount} tasks updated to completed`);

  await prisma.$disconnect();
}

reviewCompletedWork().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

