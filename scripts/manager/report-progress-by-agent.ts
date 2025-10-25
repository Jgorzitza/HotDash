import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type AgentReport = {
  agent: string;
  totals: {
    total: number;
    assigned: number;
    in_progress: number;
    blocked: number;
    completed: number;
    cancelled: number;
  };
  percentComplete: number; // 0-100
  topTasks: {
    taskId: string;
    title: string;
    priority: string;
    status: string;
    dependencies: string[] | null;
  }[];
};

async function main() {
  const agents = await prisma.taskAssignment.findMany({
    select: { assignedTo: true },
    distinct: ["assignedTo"],
  });

  const reports: AgentReport[] = [];
  for (const a of agents) {
    const agent = a.assignedTo;
    const tasks = await prisma.taskAssignment.findMany({
      where: { assignedTo: agent },
    });
    const totals = {
      total: tasks.length,
      assigned: tasks.filter((t) => t.status === "assigned").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      cancelled: tasks.filter((t) => t.status === "cancelled").length,
    };
    const denom = Math.max(1, totals.total - totals.cancelled);
    const percentComplete = Math.round((totals.completed / denom) * 100);

    const top = await prisma.taskAssignment.findMany({
      where: {
        assignedTo: agent,
        status: { in: ["assigned", "in_progress", "blocked"] },
      },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      take: 10,
      select: {
        taskId: true,
        title: true,
        priority: true,
        status: true,
        dependencies: true,
      },
    });

    reports.push({
      agent,
      totals,
      percentComplete,
      topTasks: top.map((t) => ({
        taskId: t.taskId,
        title: t.title,
        priority: t.priority,
        status: t.status,
        dependencies: (t.dependencies as string[]) || null,
      })),
    });
  }

  console.log(JSON.stringify({ reports }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
