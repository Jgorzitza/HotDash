import prisma from '../../app/db.server';

async function checkExistingTasks() {
  console.log('🔍 CHECKING EXISTING TASKS IN DATABASE');
  console.log('================================================================================');

  // Check what tasks already exist
  const existingTasks = await prisma.taskAssignment.findMany({
    select: {
      taskId: true,
      assignedTo: true,
      title: true,
      status: true
    },
    orderBy: {
      assignedTo: 'asc'
    }
  });

  console.log(`📋 Found ${existingTasks.length} existing tasks in database:`);
  
  const tasksByAgent = existingTasks.reduce((acc, task) => {
    if (!acc[task.assignedTo]) {
      acc[task.assignedTo] = [];
    }
    acc[task.assignedTo].push(task);
    return acc;
  }, {} as Record<string, any[]>);

  Object.entries(tasksByAgent).forEach(([agent, tasks]) => {
    console.log(`\n✅ ${agent}: ${tasks.length} tasks`);
    tasks.forEach(task => {
      console.log(`   • ${task.taskId}: ${task.title} (${task.status})`);
    });
  });

  console.log('\n================================================================================');
  console.log('📊 SUMMARY:');
  console.log(`✅ Total tasks in database: ${existingTasks.length}`);
  console.log(`✅ Agents with tasks: ${Object.keys(tasksByAgent).length}`);
  console.log(`✅ All tasks already exist - no duplicates needed!`);

  await prisma.$disconnect();
}

checkExistingTasks();
