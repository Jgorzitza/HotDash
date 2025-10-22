import { getMyTasks, getMyNextTask } from '../../app/services/tasks.server';

const agent = process.argv[2];

if (!agent) {
  console.error('❌ Usage: npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <agent-name>');
  process.exit(1);
}

console.log(`📋 Tasks for ${agent.toUpperCase()}\n`);
console.log('='.repeat(80));

// Get all active tasks
const tasks = await getMyTasks(agent);

console.log(`\nFound ${tasks.length} active tasks:\n`);

tasks.forEach((t, i) => {
  const statusIcon = t.status === 'in_progress' ? '🔵' : t.status === 'blocked' ? '🚧' : '📌';
  const deps = (t.dependencies as string[] || []);
  const depsStr = deps.length > 0 ? ` 🔗 Depends: ${deps.join(', ')}` : '';
  
  console.log(`${i + 1}. ${statusIcon} ${t.priority} ${t.taskId}: ${t.title}`);
  console.log(`   Status: ${t.status}${depsStr}`);
  console.log(`   Description: ${t.description.substring(0, 80)}${t.description.length > 80 ? '...' : ''}`);
  console.log(`   Estimated: ${t.estimatedHours || 'N/A'}h`);
  console.log(`   Acceptance: ${(t.acceptanceCriteria as string[]).length} criteria`);
  console.log(`   Allowed Paths: ${(t.allowedPaths as string[]).join(', ')}`);
  console.log('');
});

// Get next unblocked task
const next = await getMyNextTask(agent);

console.log('='.repeat(80));

if (next) {
  console.log(`\n🎯 NEXT TASK TO START: ${next.taskId}`);
  console.log(`   Title: ${next.title}`);
  console.log(`   Priority: ${next.priority}`);
  console.log(`   Estimated: ${next.estimatedHours || 'N/A'}h`);
  console.log(`\n   To start this task:`);
  console.log(`   npx tsx --env-file=.env scripts/agent/start-task.ts ${next.taskId}`);
} else {
  console.log('\n⚪ No unblocked tasks available');
  if (tasks.some(t => t.status === 'blocked')) {
    console.log('   All tasks are blocked by dependencies');
  }
}

