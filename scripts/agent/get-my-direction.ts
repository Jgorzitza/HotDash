/**
 * Get agent direction from database
 *
 * NOTE: Direction is now stored in TaskAssignment.description
 * This script shows all active tasks with their direction/description
 *
 * Usage: npx tsx --env-file=.env scripts/agent/get-my-direction.ts <agent>
 */

import "dotenv/config";
import prisma from "../../app/db.server";

async function main() {
  const agent = process.argv[2];

  if (!agent) {
    console.error("Usage: npx tsx --env-file=.env scripts/agent/get-my-direction.ts <agent>");
    process.exit(1);
  }

  const tasks = await prisma.taskAssignment.findMany({
    where: {
      assignedTo: agent,
      status: { in: ["assigned", "pending", "in_progress", "blocked"] }
    },
    orderBy: [
      { priority: "asc" },
      { createdAt: "desc" }
    ],
    select: {
      taskId: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      estimatedHours: true,
      acceptanceCriteria: true,
      allowedPaths: true,
      dependencies: true,
      createdAt: true,
      updatedAt: true
    }
  });

  console.log(`\n=== ${agent.toUpperCase()} DIRECTION (from TaskAssignment) ===\n`);

  if (tasks.length === 0) {
    console.log("❌ No active tasks found in database");
    console.log("\nThis means Manager has not yet assigned tasks to this agent.");
    console.log("\nTo assign tasks, Manager should use:");
    console.log(`   npx tsx --env-file=.env scripts/manager/assign-task.ts`);
  } else {
    console.log(`Found ${tasks.length} active task(s):\n`);
    console.log("=".repeat(80));

    tasks.forEach((task, i) => {
      const statusIcon =
        task.status === "in_progress" ? "🔵" :
        task.status === "blocked" ? "🚧" :
        "📌";

      console.log(`\n${i + 1}. ${statusIcon} ${task.priority} ${task.taskId}: ${task.title}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Estimated: ${task.estimatedHours || "N/A"}h`);
      console.log(`   Created: ${task.createdAt.toISOString()}`);
      console.log(`   Updated: ${task.updatedAt.toISOString()}`);

      if (task.dependencies && (task.dependencies as string[]).length > 0) {
        console.log(`   Dependencies: ${(task.dependencies as string[]).join(", ")}`);
      }

      console.log(`\n   DIRECTION (description):`);
      console.log(`   ${"-".repeat(76)}`);
      const lines = task.description.split("\n");
      lines.forEach(line => {
        console.log(`   ${line}`);
      });

      console.log(`\n   ACCEPTANCE CRITERIA:`);
      console.log(`   ${"-".repeat(76)}`);
      const criteria = task.acceptanceCriteria as string[];
      criteria.forEach((c, idx) => {
        console.log(`   ${idx + 1}. ${c}`);
      });

      console.log(`\n   ALLOWED PATHS:`);
      console.log(`   ${"-".repeat(76)}`);
      const paths = task.allowedPaths as string[];
      paths.forEach(p => {
        console.log(`   - ${p}`);
      });

      console.log("\n" + "=".repeat(80));
    });

    console.log(`\n💡 To start working on a task:`);
    console.log(`   npx tsx --env-file=.env scripts/agent/start-task.ts <TASK-ID>`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

