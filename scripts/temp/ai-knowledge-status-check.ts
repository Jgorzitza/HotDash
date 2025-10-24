import { logDecision } from '../../app/services/decisions.server.js';
import prisma from '../../app/db.server.js';

async function checkStatus() {
  console.log('🔍 AI-Knowledge Status Check\n');
  console.log('='.repeat(80));

  // Check for any tasks
  const allTasks = await prisma.taskAssignment.findMany({
    where: { assignedTo: 'ai-knowledge' },
    orderBy: { createdAt: 'desc' },
  });

  const activeTasks = allTasks.filter(t => 
    ['assigned', 'in_progress', 'blocked'].includes(t.status)
  );

  const completedTasks = allTasks.filter(t => t.status === 'completed');
  const cancelledTasks = allTasks.filter(t => t.status === 'cancelled');

  console.log('\n📊 Task Summary:');
  console.log(`  Total tasks: ${allTasks.length}`);
  console.log(`  Active: ${activeTasks.length}`);
  console.log(`  Completed: ${completedTasks.length}`);
  console.log(`  Cancelled: ${cancelledTasks.length}`);

  // Check for tasks created in last 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const recentTasks = allTasks.filter(t => new Date(t.createdAt) > twoHoursAgo);

  console.log(`\n🆕 Tasks created in last 2 hours: ${recentTasks.length}`);
  if (recentTasks.length > 0) {
    for (const task of recentTasks) {
      console.log(`  - ${task.status.toUpperCase()} ${task.taskId}: ${task.title}`);
    }
  }

  // Log status to decision log
  await logDecision({
    scope: 'build',
    actor: 'ai-knowledge',
    action: 'status_check_complete',
    rationale: 'Checked database for updated direction and new task assignments. No new tasks found.',
    payload: {
      totalTasks: allTasks.length,
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      cancelledTasks: cancelledTasks.length,
      recentTasks: recentTasks.length,
      lastCompletedTask: completedTasks[0]?.taskId,
      lastCompletedAt: completedTasks[0]?.completedAt,
    }
  });

  console.log('\n✅ Status check complete and logged');
  
  if (activeTasks.length === 0) {
    console.log('\n⚪ No active tasks - agent is idle and awaiting new assignments');
  } else {
    console.log(`\n🎯 ${activeTasks.length} active task(s) found - ready to execute`);
  }

  process.exit(0);
}

checkStatus().catch(console.error);

