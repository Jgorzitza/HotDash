#!/usr/bin/env tsx
/**
 * Mark a TaskAssignment as blocked.
 * Usage:
 *   TASK_ID=DEVOPS-CHATWOOT-PROD-VERIFY REASON="..." ENV=production DB=supabase \
 *   npx tsx --env-file=.env scripts/manager/mark-task-blocked.ts
 */

import { updateTask } from "../../app/services/tasks.server";

const taskId = process.env.TASK_ID || "";
if (!taskId) {
  console.error("TASK_ID env var is required");
  process.exit(1);
}

const reason =
  process.env.REASON ||
  "Task blocked by environment configuration; see details from manager.";

const environment = process.env.ENV || "production";
const db = process.env.DB || "supabase";

async function run() {
  await updateTask(taskId, {
    taskId,
    status: "blocked",
    payload: { reason, environment, db },
  });
  console.log(`✅ Task ${taskId} marked as blocked`);
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

