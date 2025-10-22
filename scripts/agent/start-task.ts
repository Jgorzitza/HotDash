import { updateTask, getTaskDetails } from '../../app/services/tasks.server';
import { logDecision } from '../../app/services/decisions.server';

const taskId = process.argv[2];

if (!taskId) {
  console.error('❌ Usage: npx tsx --env-file=.env scripts/agent/start-task.ts <TASK-ID>');
  process.exit(1);
}

console.log(`🚀 Starting task: ${taskId}\n`);

// Get task details
const task = await getTaskDetails(taskId);

if (!task) {
  console.error(`❌ Task ${taskId} not found`);
  process.exit(1);
}

if (task.status !== 'assigned') {
  console.error(`❌ Task ${taskId} is already ${task.status}`);
  process.exit(1);
}

// Update task status
await updateTask(taskId, {
  status: 'in_progress',
  startedAt: new Date()
});

console.log('✅ Task status updated to: in_progress');

// Log to decision log
await logDecision({
  scope: 'build',
  actor: task.assignedTo,
  taskId: taskId,
  status: 'in_progress',
  progressPct: 0,
  action: 'task_started',
  rationale: `Started ${task.title}`,
  evidenceUrl: `artifacts/${task.assignedTo}/tasks/${taskId.toLowerCase()}.md`,
  durationEstimate: task.estimatedHours || undefined
});

console.log('✅ Logged to decision_log');

console.log(`\n📋 Task: ${task.title}`);
console.log(`Priority: ${task.priority}`);
console.log(`Estimated: ${task.estimatedHours || 'N/A'}h`);
console.log(`\nAcceptance Criteria:`);
(task.acceptanceCriteria as string[]).forEach((c, i) => {
  console.log(`  ${i + 1}. ${c}`);
});
console.log(`\nAllowed Paths:`);
(task.allowedPaths as string[]).forEach(p => {
  console.log(`  - ${p}`);
});

console.log('\n🎯 You can now begin work!');

