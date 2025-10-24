import prisma from '../../app/db.server.js';

async function checkTasks() {
  console.log('📋 Checking ai-knowledge tasks...\n');

  const tasks = await prisma.taskAssignment.findMany({
    where: { assignedTo: 'ai-knowledge' },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  console.log(`Found ${tasks.length} total tasks:\n`);

  for (const task of tasks) {
    console.log(`${task.status.toUpperCase()} - ${task.taskId}: ${task.title}`);
    console.log(`  Priority: ${task.priority}`);
    console.log(`  Updated: ${task.updatedAt}`);
    if (task.completedAt) {
      console.log(`  Completed: ${task.completedAt}`);
    }
    console.log('');
  }

  // Count by status
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Status Summary:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  process.exit(0);
}

checkTasks().catch(console.error);

