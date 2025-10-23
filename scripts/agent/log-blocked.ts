#!/usr/bin/env tsx
/**
 * Log Task Blocked Status to Database
 *
 * Usage: npx tsx --env-file=.env scripts/agent/log-blocked.ts <actor> <taskId> <blockedBy> <rationale> [evidenceUrl] [nextAction]
 *
 * Examples:
 *   npx tsx --env-file=.env scripts/agent/log-blocked.ts qa-helper QA-UI-002 "app/utils/analytics.ts duplicate exports" "Cannot run tests due to duplicate exports" "tests/unit/ActionQueueCard.spec.tsx" "Waiting for Engineer to fix analytics.ts"
 *   npx tsx --env-file=.env scripts/agent/log-blocked.ts engineer ENG-060 "Missing Supabase RLS policies" "Cannot implement security without RLS policies" "app/services/security.ts" "Waiting for Data agent to create RLS policies"
 */

import { logDecision } from "../../app/services/decisions.server";
import { updateTask } from "../../app/services/tasks.server";

async function main() {
  const [actor, taskId, blockedBy, rationale, evidenceUrl, nextAction] = process.argv.slice(2);

  if (!actor || !taskId || !blockedBy || !rationale) {
    console.error("❌ Usage: npx tsx --env-file=.env scripts/agent/log-blocked.ts <actor> <taskId> <blockedBy> <rationale> [evidenceUrl] [nextAction]");
    console.error("");
    console.error("Examples:");
    console.error('  npx tsx --env-file=.env scripts/agent/log-blocked.ts qa-helper QA-UI-002 "duplicate exports" "Cannot run tests" "tests/unit/Card.spec.tsx" "Waiting for fix"');
    console.error('  npx tsx --env-file=.env scripts/agent/log-blocked.ts engineer ENG-060 "Missing RLS policies" "Cannot implement security" "app/services/security.ts" "Waiting for Data"');
    process.exit(1);
  }

  // Update task status to blocked
  await updateTask(taskId, {
    status: "blocked",
    blockedBy,
  });

  console.log(`✅ Task ${taskId} marked as blocked`);

  // Log to decision log
  await logDecision({
    scope: "build",
    actor,
    taskId,
    status: "blocked",
    action: "task_blocked",
    rationale,
    evidenceUrl: evidenceUrl || `artifacts/${actor}/tasks/${taskId.toLowerCase()}.md`,
    blockedBy,
    nextAction: nextAction || "Waiting for blocker to be resolved",
  });

  console.log(`✅ Blocked status logged for ${actor} ${taskId}`);
  console.log(`   Blocked by: ${blockedBy}`);
  console.log(`   Rationale: ${rationale}`);
  console.log("");
  console.log("⚠️  Manager will see this blocker immediately in query-blocked-tasks.ts");
}

main().catch((err) => {
  console.error("❌ Failed to log blocked status:", err);
  process.exit(1);
});

