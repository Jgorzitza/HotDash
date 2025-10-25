#!/usr/bin/env tsx
import prisma from '../../app/db.server';

async function main() {
  const tasks = await prisma.task.findMany({
    where: {
      assigned_to: 'designer',
      status: { in: ['assigned', 'in_progress'] }
    },
    include: {
      dependencies: {
        include: {
          dependsOn: true
        }
      }
    },
    orderBy: { priority: 'asc' }
  });

  console.log('\n📋 All Designer Tasks:\n');
  for (const task of tasks) {
    console.log(`${task.task_id}: ${task.title}`);
    console.log(`  Status: ${task.status}`);
    console.log(`  Priority: ${task.priority}`);
    
    if (task.dependencies.length > 0) {
      console.log('  Dependencies:');
      for (const dep of task.dependencies) {
        console.log(`    - ${dep.dependsOn.task_id} (${dep.dependsOn.status})`);
      }
    }
    
    // Check if all dependencies are complete
    const allDepsComplete = task.dependencies.every(d => d.dependsOn.status === 'complete');
    const isBlocked = !allDepsComplete;
    console.log(`  Blocked: ${isBlocked}`);
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch(console.error);

