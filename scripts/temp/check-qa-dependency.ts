import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDependency() {
  const task = await prisma.taskAssignment.findUnique({
    where: { taskId: 'QA-AGENT-HANDOFFS-001' }
  });
  console.log('QA-AGENT-HANDOFFS-001 Status:');
  console.log(JSON.stringify(task, null, 2));
  await prisma.$disconnect();
}

checkDependency();

