#!/usr/bin/env tsx
/**
 * Query current status of all agents
 * Shows what each agent is working on and their progress
 *
 * Usage: npx tsx --env-file=.env scripts/manager/query-agent-status.ts
 *
 * NOTE: Requires enhanced DecisionLog schema
 */

import "dotenv/config";
import prisma from "../../app/db.server";

const AGENTS = [
  "engineer",
  "designer",
  "data",
  "devops",
  "integrations",
  "analytics",
  "inventory",
  "seo",
  "ads",
  "content",
  "product",
  "qa",
  "pilot",
  "ai-customer",
  "ai-knowledge",
  "support",
  "manager",
];

async function queryAgentStatus() {
  console.log("👥 Agent Status Dashboard\n");
  console.log("=".repeat(80));

  for (const agent of AGENTS) {
    // Get agent's latest task update
    const latestTask = await prisma.decisionLog.findFirst({
      where: {
        actor: agent,
        // @ts-expect-error - Field will exist after migration
        taskId: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!latestTask) {
      console.log(`\n⚪ ${agent.toUpperCase()}: No recent activity`);
      continue;
    }

    // @ts-expect-error
    const status = latestTask.status || "unknown";
    const statusIcon =
      status === "completed"
        ? "✅"
        : status === "in_progress"
          ? "🔵"
          : status === "blocked"
            ? "🚧"
            : status === "pending"
              ? "⏸️"
              : "❓";

    console.log(`\n${statusIcon} ${agent.toUpperCase()}: ${status}`);
    // @ts-expect-error
    console.log(`   Task: ${latestTask.taskId || "Unknown"}`);
    // @ts-expect-error
    console.log(`   Progress: ${latestTask.progressPct || 0}%`);
    console.log(`   Rationale: ${latestTask.rationale?.substring(0, 60)}...`);

    // @ts-expect-error
    if (latestTask.nextAction) {
      // @ts-expect-error
      console.log(`   Next: ${latestTask.nextAction}`);
    }

    // @ts-expect-error
    if (latestTask.blockerDetails) {
      // @ts-expect-error
      console.log(`   🚨 BLOCKED: ${latestTask.blockerDetails}`);
    }

    const hoursAgo = Math.round(
      (Date.now() - latestTask.createdAt.getTime()) / 3600000,
    );
    console.log(`   Last Update: ${hoursAgo}h ago`);

    if (hoursAgo > 4) {
      console.log(
        `   ⚠️  WARNING: No update in ${hoursAgo} hours (>4h threshold)`,
      );
    }
  }

  console.log("\n" + "=".repeat(80));

  // Summary statistics
  const stats = await prisma.decisionLog.groupBy({
    by: ["actor"],
    where: {
      // @ts-expect-error
      status: { not: null },
      createdAt: { gte: new Date(Date.now() - 86400000) }, // Last 24h
    },
    _count: true,
  });

  console.log("\n📊 Activity Stats (Last 24h):");
  stats
    .sort((a, b) => b._count - a._count)
    .slice(0, 5)
    .forEach((stat) => {
      console.log(`   ${stat.actor}: ${stat._count} updates`);
    });

  await prisma.$disconnect();
}

queryAgentStatus().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
