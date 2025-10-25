import prisma from '../../app/db.server.js';

async function checkAllTasks() {
  console.log('📋 Checking ALL ai-knowledge tasks in database...\n');

  // Get all tasks regardless of status
  const allTasks = await prisma.taskAssignment.findMany({
    where: { assignedTo: 'ai-knowledge' },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total tasks found: ${allTasks.length}\n`);

  // Group by status
  const byStatus = allTasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, typeof allTasks>);

  // Show each status group
  for (const [status, tasks] of Object.entries(byStatus)) {
    console.log(`\n${status.toUpperCase()} (${tasks.length}):`);
    console.log('='.repeat(80));
    
    for (const task of tasks.slice(0, 5)) { // Show first 5 of each status
      console.log(`  ${task.taskId}: ${task.title}`);
      console.log(`    Priority: ${task.priority} | Estimated: ${task.estimatedHours}h`);
      console.log(`    Created: ${task.createdAt}`);
      if (task.dependencies && Array.isArray(task.dependencies) && task.dependencies.length > 0) {
        console.log(`    Dependencies: ${(task.dependencies as string[]).join(', ')}`);
      }
      console.log('');
    }
    
    if (tasks.length > 5) {
      console.log(`  ... and ${tasks.length - 5} more\n`);
    }
  }

  // Check for tasks created in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentTasks = allTasks.filter(t => new Date(t.createdAt) > oneHourAgo);
  
  if (recentTasks.length > 0) {
    console.log('\n🆕 RECENTLY CREATED (last hour):');
    console.log('='.repeat(80));
    for (const task of recentTasks) {
      console.log(`  ${task.status.toUpperCase()} - ${task.taskId}: ${task.title}`);
      console.log(`    Created: ${task.createdAt}`);
      console.log('');
    }
  }

  process.exit(0);
}

checkAllTasks().catch(console.error);

