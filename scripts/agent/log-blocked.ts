import { logDecision } from "../../app/services/decisions.server";

async function main() {
  const [actor, taskId, rationaleArg, payloadArg] = process.argv.slice(2);

  if (!actor || !taskId || !rationaleArg) {
    console.error(
      "❌ Usage: npx tsx --env-file=.env scripts/agent/log-blocked.ts <actor> <taskId> <rationale> [payloadJson]"
    );
    process.exit(1);
  }

  let payload: any = undefined;
  if (payloadArg) {
    try {
      payload = JSON.parse(payloadArg);
    } catch (e) {
      console.error("❌ Invalid JSON for payload:", e);
      process.exit(1);
    }
  }

  await logDecision({
    scope: "build",
    actor,
    taskId,
    status: "blocked",
    progressPct: 20,
    action: "task_blocked",
    rationale: rationaleArg,
    evidenceUrl: "tests/unit/ActionQueueCard.spec.tsx",
    blockedBy: "app/utils/analytics.ts duplicate exports",
    nextAction: "Coordinate with Engineer to dedupe analytics utils exports; re-run unit tests",
    payload,
  });

  console.log(`✅ Blocked status logged for ${actor} ${taskId}`);
}

main().catch((err) => {
  console.error("❌ Failed to log blocked status:", err);
  process.exit(1);
});

