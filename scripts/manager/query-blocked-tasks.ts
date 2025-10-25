#!/usr/bin/env tsx
/**
 * Query all blocked tasks across all agents
 *
 * Usage: npx tsx --env-file=.env scripts/manager/query-blocked-tasks.ts
 *
 * NOTE: Requires enhanced DecisionLog schema with status, taskId, blockerDetails fields
 */

import "dotenv/config";
import prisma from "../../app/db.server";

async function queryBlockedTasks() {
  console.log("🚨 Querying Blocked Tasks Across All Agents\n");
  console.log("=".repeat(80));

  // Query for blocked tasks (ONLY RECENT - last 48 hours)
  // Filter out historical entries from markdown import
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  
  const blocked = await prisma.decisionLog.findMany({
    where: {
      status: "blocked",
      taskId: { not: null },
      createdAt: { gte: fortyEightHoursAgo }, // CRITICAL: Only show recent blockers
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (blocked.length === 0) {
    console.log("\n✅ No blocked tasks! All agents working smoothly.\n");
    return;
  }

  console.log(`\nFound ${blocked.length} blocked tasks:\n`);

  blocked.forEach((task, i) => {
    console.log(`${i + 1}. 🚧 ${task.actor.toUpperCase()}`);
    console.log(`   Task: ${task.taskId || "Unknown"}`);
    console.log(`   Blocked By: ${task.blockedBy || "Not specified"}`);
    console.log(`   Details: ${task.blockerDetails || task.rationale}`);
    console.log(`   Progress: ${task.progressPct || 0}%`);
    console.log(`   Blocked Since: ${task.createdAt?.toISOString() || "Unknown"}`);
    console.log(`   Evidence: ${task.evidenceUrl || "N/A"}`);
    console.log("");
  });

  console.log("=".repeat(80));

  // Group blockers by what they're blocked on
  const blockerSummary: Record<string, number> = {};
  blocked.forEach((task) => {
    const blocker = task.blockedBy || "Unknown";
    blockerSummary[blocker] = (blockerSummary[blocker] || 0) + 1;
  });

  console.log("\n📊 Blocker Summary:");
  Object.entries(blockerSummary)
    .sort((a, b) => b[1] - a[1])
    .forEach(([blocker, count]) => {
      console.log(`   ${count}x agents blocked by: ${blocker}`);
    });

  console.log("\n💡 Action: Manager should unblock these dependencies ASAP");

  await prisma.$disconnect();
}

queryBlockedTasks().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
