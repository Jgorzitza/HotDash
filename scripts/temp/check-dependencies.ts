import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDependencies() {
  console.log('Checking dependency status...\n');
  
  const deps = await prisma.taskAssignment.findMany({
    where: {
      taskId: {
        in: ['DEVOPS-LLAMAINDEX-001', 'ENG-IMAGE-SEARCH-003']
      }
    },
    select: {
      taskId: true,
      title: true,
      status: true,
      assignedTo: true,
      completedAt: true
    }
  });
  
  console.log('Dependency Status:');
  console.log('='.repeat(80));
  
  deps.forEach(dep => {
    console.log(`\nTask: ${dep.taskId}`);
    console.log(`Title: ${dep.title}`);
    console.log(`Assigned To: ${dep.assignedTo}`);
    console.log(`Status: ${dep.status}`);
    console.log(`Completed: ${dep.completedAt ? dep.completedAt.toISOString() : 'Not completed'}`);
  });
  
  console.log('\n' + '='.repeat(80));
  
  const allCompleted = deps.every(d => d.status === 'completed');
  
  if (allCompleted) {
    console.log('\n✅ All dependencies completed! Analytics tasks can proceed.');
  } else {
    console.log('\n⚪ Dependencies not yet completed. Analytics tasks remain blocked.');
    const incomplete = deps.filter(d => d.status !== 'completed');
    console.log('\nWaiting on:');
    incomplete.forEach(d => {
      console.log(`  - ${d.taskId} (${d.assignedTo}): ${d.status}`);
    });
  }
  
  await prisma.$disconnect();
}

checkDependencies();

