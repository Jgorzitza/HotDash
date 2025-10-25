import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAllTasks() {
  console.log('Checking all analytics tasks in database...\n');
  
  const allTasks = await prisma.taskAssignment.findMany({
    where: {
      assignedTo: 'analytics'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  console.log(`Total tasks found: ${allTasks.length}\n`);
  console.log('='.repeat(80));
  
  const byStatus = {
    completed: allTasks.filter(t => t.status === 'completed'),
    in_progress: allTasks.filter(t => t.status === 'in_progress'),
    assigned: allTasks.filter(t => t.status === 'assigned'),
    cancelled: allTasks.filter(t => t.status === 'cancelled'),
  };
  
  console.log('\nSTATUS BREAKDOWN:');
  console.log(`  Completed:    ${byStatus.completed.length}`);
  console.log(`  In Progress:  ${byStatus.in_progress.length}`);
  console.log(`  Assigned:     ${byStatus.assigned.length}`);
  console.log(`  Cancelled:    ${byStatus.cancelled.length}`);
  console.log('');
  
  if (byStatus.completed.length > 0) {
    console.log('COMPLETED TASKS:');
    console.log('-'.repeat(80));
    byStatus.completed.forEach(task => {
      console.log(`✅ ${task.taskId}: ${task.title}`);
      console.log(`   Completed: ${task.completedAt?.toISOString()}`);
      console.log(`   Priority: ${task.priority}`);
      console.log('');
    });
  }
  
  if (byStatus.in_progress.length > 0) {
    console.log('IN PROGRESS TASKS:');
    console.log('-'.repeat(80));
    byStatus.in_progress.forEach(task => {
      console.log(`🔄 ${task.taskId}: ${task.title}`);
      console.log(`   Started: ${task.startedAt?.toISOString()}`);
      console.log('');
    });
  }
  
  if (byStatus.assigned.length > 0) {
    console.log('ASSIGNED (NOT STARTED) TASKS:');
    console.log('-'.repeat(80));
    byStatus.assigned.forEach(task => {
      console.log(`⚪ ${task.taskId}: ${task.title}`);
      console.log(`   Priority: ${task.priority}`);
      console.log(`   Dependencies: ${task.dependencies?.join(', ') || 'None'}`);
      console.log('');
    });
  }
  
  console.log('='.repeat(80));
  console.log(`\nSUMMARY: ${byStatus.completed.length}/${allTasks.length} tasks completed`);
  
  await prisma.$disconnect();
}

verifyAllTasks();

