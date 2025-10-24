import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getTaskDetails() {
  const task = await prisma.taskAssignment.findUnique({
    where: { taskId: 'ANA-018' }
  });
  console.log(JSON.stringify(task, null, 2));
  await prisma.$disconnect();
}

getTaskDetails();

