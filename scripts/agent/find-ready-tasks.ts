import prisma from '../../app/db.server';

async function findReadyTasks() {
  const tasks = await prisma.taskAssignment.findMany({
    where: {
      assignedTo: 'engineer',
      status: 'assigned'
    },
    select: {
      taskId: true,
      title: true,
      priority: true,
      dependencies: true,
      estimatedHours: true
    },
    orderBy: [
      { priority: 'asc' }
    ]
  });
  
  console.log('Tasks Ready to Start (no dependencies or dependencies completed):\n');
  
  for (const task of tasks) {
    let canStart = true;
    
    if (task.dependencies && Array.isArray(task.dependencies) && task.dependencies.length > 0) {
      for (const depId of task.dependencies) {
        const dep = await prisma.taskAssignment.findFirst({
          where: { taskId: depId as string },
          select: { status: true }
        });
        if (dep && dep.status !== 'completed') {
          canStart = false;
          break;
        }
      }
    }
    
    if (canStart) {
      console.log(`✅ ${task.priority} ${task.taskId}: ${task.title} (${task.estimatedHours}h)`);
    }
  }
  
  await prisma.$disconnect();
}

findReadyTasks();

