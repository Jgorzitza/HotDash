/**
 * Gather all agent feedback from last 24 hours
 * Shows completed tasks, blockers, and progress
 */

import "dotenv/config";
import kbPrisma from "../../app/kb-db.server";

async function gatherFeedback() {
  console.log("📊 Gathering Agent Feedback (Last 24 Hours)...\n");

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const feedback = await kbPrisma.decisionLog.findMany({
    where: {
      createdAt: { gte: yesterday },
    },
    orderBy: [{ actor: "asc" }, { createdAt: "desc" }],
  });

  // Group by agent
  const byAgent: Record<string, typeof feedback> = {};
  for (const f of feedback) {
    if (!byAgent[f.actor]) byAgent[f.actor] = [];
    byAgent[f.actor].push(f);
  }

  // Identify blockers and completed tasks
  const blockers: typeof feedback = [];
  const completed: typeof feedback = [];

  for (const entry of feedback) {
    if (entry.status === "blocked" || entry.blockerDetails) {
      blockers.push(entry);
    }
    if (entry.status === "completed" || entry.action.includes("completed")) {
      completed.push(entry);
    }
  }

  console.log("=".repeat(80));
  console.log("AGENT FEEDBACK SUMMARY");
  console.log("=".repeat(80));
  console.log();

  // Show blockers first
  if (blockers.length > 0) {
    console.log("🚨 BLOCKERS (PRIORITY)");
    console.log("-".repeat(80));
    blockers.forEach((b, idx) => {
      console.log(
        `${idx + 1}. ${b.actor.toUpperCase()}: ${b.rationale || b.action}`
      );
      if (b.taskId) console.log(`   Task: ${b.taskId}`);
      if (b.blockerDetails) console.log(`   Blocker: ${b.blockerDetails}`);
      if (b.blockedBy) console.log(`   Blocked by: ${b.blockedBy}`);
      console.log();
    });
  }

  // Show completed tasks
  if (completed.length > 0) {
    console.log("✅ COMPLETED TASKS");
    console.log("-".repeat(80));
    completed.forEach((c, idx) => {
      console.log(
        `${idx + 1}. ${c.actor.toUpperCase()}: ${c.rationale || c.action}`
      );
      if (c.taskId) console.log(`   Task: ${c.taskId}`);
      if (c.evidenceUrl) console.log(`   Evidence: ${c.evidenceUrl}`);
      console.log();
    });
  }

  // Show all feedback by agent
  console.log("📋 ALL FEEDBACK BY AGENT");
  console.log("-".repeat(80));
  console.log();

  for (const [agent, entries] of Object.entries(byAgent)) {
    console.log(`${agent.toUpperCase()} (${entries.length} entries)`);
    console.log("-".repeat(80));

    entries.forEach((entry, idx) => {
      console.log(`${idx + 1}. [${entry.action}] ${entry.rationale}`);
      if (entry.taskId) console.log(`   Task: ${entry.taskId}`);
      if (entry.status) console.log(`   Status: ${entry.status}`);
      if (entry.progressPct !== null)
        console.log(`   Progress: ${entry.progressPct}%`);
      if (entry.blockerDetails)
        console.log(`   🚨 BLOCKER: ${entry.blockerDetails}`);
      if (entry.blockedBy) console.log(`   Blocked by: ${entry.blockedBy}`);
      if (entry.nextAction) console.log(`   Next: ${entry.nextAction}`);
      console.log();
    });
  }

  console.log("=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total entries: ${feedback.length}`);
  console.log(`Agents reporting: ${Object.keys(byAgent).length}`);
  console.log(`Blockers: ${blockers.length}`);
  console.log(`Completed tasks: ${completed.length}`);
  console.log("=".repeat(80));

  await kbPrisma.$disconnect();
}

gatherFeedback().catch(console.error);

