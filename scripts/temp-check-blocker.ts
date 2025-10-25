#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const task = await prisma.taskAssignment.findUnique({
    where: { taskId: 'BLOCKER-001' }
  });
  
  console.log(JSON.stringify(task, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);

