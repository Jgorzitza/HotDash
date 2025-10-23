import { logDecision } from "../../app/services/decisions.server";

async function main() {
  const [actor, taskId, progressPctStr, rationale, evidenceUrl, nextAction] = process.argv.slice(2);

  if (!actor || !taskId) {
    console.error("❌ Usage: npx tsx --env-file=.env scripts/agent/log-progress.ts <actor> <taskId> [progressPct] [rationale] [evidenceUrl] [nextAction]");
    process.exit(1);
  }

  const progressPct = progressPctStr ? Number(progressPctStr) : 0;

  await logDecision({
    scope: "build",
    actor,
    taskId,
    status: "in_progress",
    progressPct,
    action: "task_progress",
    rationale,
    evidenceUrl,
    nextAction,
  });

  console.log(`✅ Progress logged for ${actor} ${taskId} (${progressPct}%)`);
}

main().catch((err) => {
  console.error("❌ Failed to log progress:", err);
  process.exit(1);
});

