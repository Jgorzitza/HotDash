import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unblockTask() {
  const task = await prisma.taskAssignment.update({
    where: { taskId: 'AI-CUSTOMER-HANDOFF-001' },
    data: { 
      status: 'in_progress',
      startedAt: new Date()
    }
  });
  console.log('✅ Task unblocked and started:', task.taskId);
  await prisma.$disconnect();
}

unblockTask();

