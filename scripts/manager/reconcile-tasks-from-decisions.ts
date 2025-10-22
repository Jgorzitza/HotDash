import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  let completed = 0;
  let blocked = 0;

  const completedLogs = await prisma.decisionLog.findMany({
    where: { status: "completed", taskId: { not: null } },
    select: { taskId: true },
    distinct: ["taskId"],
  });

  for (const row of completedLogs) {
    const taskId = row.taskId as string;
    try {
      await prisma.taskAssignment.update({
        where: { taskId },
        data: { status: "completed", completedAt: new Date() },
      });
      completed++;
    } catch {}
  }

  const blockedLogs = await prisma.decisionLog.findMany({
    where: { status: "blocked", taskId: { not: null } },
    select: { taskId: true },
    distinct: ["taskId"],
  });

  for (const row of blockedLogs) {
    const taskId = row.taskId as string;
    try {
      await prisma.taskAssignment.updateMany({
        where: { taskId, status: { in: ["assigned", "in_progress"] } },
        data: { status: "blocked" },
      });
      blocked++;
    } catch {}
  }

  console.log(JSON.stringify({ completed, blocked }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
