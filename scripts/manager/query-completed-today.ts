#!/usr/bin/env tsx
/**
 * Query all tasks completed today
 *
 * Usage: npx tsx --env-file=.env scripts/manager/query-completed-today.ts
 */

import "dotenv/config";
import prisma from "../../app/db.server";

async function queryCompletedToday() {
  console.log("✅ Querying Tasks Completed Today\n");
  console.log("=".repeat(80));

  // Get start of today (00:00:00)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const completed = await prisma.decisionLog.findMany({
    where: {
      status: "completed",
      createdAt: { gte: startOfToday },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (completed.length === 0) {
    console.log("\n⚪ No completed tasks today yet.\n");
    return;
  }

  console.log(`\nFound ${completed.length} completed tasks today:\n`);

  // Group by agent
  const byAgent: Record<string, typeof completed> = {};
  completed.forEach((task) => {
    if (!byAgent[task.actor]) {
      byAgent[task.actor] = [];
    }
    byAgent[task.actor].push(task);
  });

  Object.entries(byAgent).forEach(([agent, tasks]) => {
    console.log(`\n📌 ${agent.toUpperCase()} (${tasks.length} completed):`);
    tasks.forEach((task, i) => {
      console.log(`   ${i + 1}. ${task.taskId || "Unknown"}`);
      console.log(`      ${task.rationale?.substring(0, 60)}...`);
      if (task.durationActual) {
        console.log(`      Duration: ${task.durationActual}h`);
      }
      if (task.evidenceUrl) {
        console.log(`      Evidence: ${task.evidenceUrl}`);
      }
    });
  });

  console.log("\n" + "=".repeat(80));

  // Summary stats
  const totalHours = completed.reduce((sum, t) => {
    return sum + (Number(t.durationActual) || 0);
  }, 0);

  console.log("\n📊 Summary:");
  console.log(`   Total Tasks: ${completed.length}`);
  console.log(`   Total Hours: ${totalHours.toFixed(1)}h`);
  console.log(`   Agents Active: ${Object.keys(byAgent).length}`);

  if (totalHours > 0) {
    console.log(
      `   Avg Hours/Task: ${(totalHours / completed.length).toFixed(1)}h`,
    );
  }

  await prisma.$disconnect();
}

queryCompletedToday().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
