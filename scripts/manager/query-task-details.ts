#!/usr/bin/env tsx
/**
 * Query detailed information about a specific task from payload metadata
 *
 * Usage: npx tsx --env-file=.env scripts/manager/query-task-details.ts <task-id>
 * Example: npx tsx --env-file=.env scripts/manager/query-task-details.ts ENG-029
 */

import "dotenv/config";
import prisma from "../../app/db.server";

async function queryTaskDetails(taskId: string) {
  console.log(`🔍 Querying Details for Task: ${taskId}\n`);
  console.log("=".repeat(80));

  const entries = await prisma.decisionLog.findMany({
    where: { taskId: taskId.toUpperCase() },
    orderBy: { createdAt: "asc" },
  });

  if (entries.length === 0) {
    console.log(`\n⚪ No entries found for task: ${taskId}\n`);
    return;
  }

  console.log(`\nFound ${entries.length} entries for ${taskId}:\n`);

  entries.forEach((entry, i) => {
    const date = entry.createdAt.toISOString();
    const statusIcon =
      entry.status === "completed"
        ? "✅"
        : entry.status === "in_progress"
          ? "🔵"
          : entry.status === "blocked"
            ? "🚧"
            : entry.status === "pending"
              ? "⏸️"
              : "❓";

    console.log(`${i + 1}. ${statusIcon} ${entry.action} - ${date}`);
    console.log(`   Status: ${entry.status || "N/A"}`);
    console.log(
      `   Progress: ${entry.progressPct !== null ? entry.progressPct + "%" : "N/A"}`,
    );
    console.log(`   Rationale: ${entry.rationale?.substring(0, 80)}...`);

    // Display payload metadata if present
    const payload = entry.payload as any;
    if (payload && Object.keys(payload).length > 0) {
      console.log(`   📦 Metadata:`);

      if (payload.commits) {
        console.log(`      Commits: ${payload.commits.join(", ")}`);
      }
      if (payload.files) {
        console.log(`      Files (${payload.files.length}):`);
        payload.files.slice(0, 5).forEach((f: any) => {
          console.log(`         - ${f.path} (${f.lines} lines)`);
        });
        if (payload.files.length > 5) {
          console.log(`         ... and ${payload.files.length - 5} more`);
        }
      }
      if (payload.tests) {
        if (payload.tests.overall) {
          console.log(`      Tests: ${payload.tests.overall}`);
        } else {
          const parts = [];
          if (payload.tests.unit)
            parts.push(
              `Unit: ${payload.tests.unit.passing}/${payload.tests.unit.total}`,
            );
          if (payload.tests.integration)
            parts.push(
              `Integration: ${payload.tests.integration.passing}/${payload.tests.integration.total}`,
            );
          if (parts.length > 0) console.log(`      Tests: ${parts.join(", ")}`);
        }
      }
      if (payload.mcpEvidence) {
        console.log(
          `      MCP: ${payload.mcpEvidence.calls} calls (${payload.mcpEvidence.tools?.join(", ")})`,
        );
      }
      if (payload.linesChanged) {
        console.log(
          `      Lines: +${payload.linesChanged.added}, -${payload.linesChanged.deleted}`,
        );
      }
      if (payload.blockerType) {
        console.log(`      Blocker Type: ${payload.blockerType}`);
      }
      if (payload.urgency) {
        console.log(`      Urgency: ${payload.urgency}`);
      }
    }

    if (entry.durationActual) {
      console.log(`   ⏱️  Duration: ${entry.durationActual}h`);
    }
    if (entry.nextAction) {
      console.log(`   ➡️  Next: ${entry.nextAction}`);
    }
    if (entry.blockerDetails) {
      console.log(`   🚨 Blocker: ${entry.blockerDetails}`);
    }

    console.log("");
  });

  console.log("=".repeat(80));

  // Summary
  const completed = entries.filter((e) => e.status === "completed");
  const totalDuration = entries.reduce(
    (sum, e) => sum + (Number(e.durationActual) || 0),
    0,
  );

  console.log("\n📊 Task Summary:");
  console.log(`   Total Entries: ${entries.length}`);
  console.log(
    `   Status: ${completed.length > 0 ? "✅ COMPLETED" : "🔵 IN PROGRESS"}`,
  );
  console.log(`   Total Time: ${totalDuration.toFixed(1)}h`);

  const lastEntry = entries[entries.length - 1];
  console.log(`   Current Progress: ${lastEntry.progressPct || 0}%`);
  console.log(`   Current Status: ${lastEntry.status || "unknown"}`);

  await prisma.$disconnect();
}

const taskId = process.argv[2];

if (!taskId) {
  console.error("❌ Usage: query-task-details.ts <task-id>");
  console.error("\nExample:");
  console.error(
    "  npx tsx --env-file=.env scripts/manager/query-task-details.ts ENG-029",
  );
  process.exit(1);
}

queryTaskDetails(taskId).catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
