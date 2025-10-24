import prisma from './app/db.server';

async function queryDevOpsLogs() {
  const logs = await prisma.decisionLog.findMany({
    where: {
      actor: 'devops',
      createdAt: {
        gte: new Date('2025-10-24')
      }
    },
    orderBy: {
      createdAt: 'asc'
    },
    select: {
      taskId: true,
      action: true,
      status: true,
      progressPct: true,
      rationale: true,
      createdAt: true
    }
  });

  console.log('\n📊 DevOps Logs for 2025-10-24:\n');
  console.log(JSON.stringify(logs, null, 2));
  console.log(`\n✅ Total entries: ${logs.length}`);

  await prisma.$disconnect();
}

queryDevOpsLogs().catch(console.error);

