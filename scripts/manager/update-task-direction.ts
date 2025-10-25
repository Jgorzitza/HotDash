#!/usr/bin/env tsx
/**
 * Update task payload and/or status with safety constraints and step-by-step direction.
 * Usage:
 *   TASK_ID=DEVOPS-CHATWOOT-PROD-VERIFY npx tsx --env-file=.env scripts/manager/update-task-direction.ts
 */

import { updateTask } from "../../app/services/tasks.server";

const taskId = process.env.TASK_ID || "";
if (!taskId) {
  console.error("TASK_ID env var is required");
  process.exit(1);
}

async function run() {
  await updateTask(taskId, {
    taskId,
    status: "assigned",
    payload: {
      constraints: {
        destructiveOps: false,
        allowOnly: [
          "read-only checks",
          "additive migrations (rails db:migrate)",
          "secret verification (no changes)",
          "service health probes",
        ],
        forbidden: [
          "schema:load",
          "db:reset",
          "drop table",
          "delete from*",
          "truncate",
          "vacuum full",
        ],
      },
      steps: [
        "Do all work in production only; do NOT touch staging.",
        "Verify Chatwoot points to Supabase (inspect Fly env/secrets only; no writes).",
        "Check service health: GET /api should return 200 JSON.",
        "Auth probe with api_access_token against /api/v1/accounts/3/conversations?per_page=1 should return 200.",
        "Run db:migrate:status (read-only) to check pending migrations.",
        "If pending migrations exist, run rails db:migrate only (additive).",
        "Never run schema:load/reset or any destructive command.",
        "Save artifacts under artifacts/ops/chatwoot-health and link in DecisionLog.",
      ],
    },
  });

  console.log(`✅ Task ${taskId} updated with safety constraints and direction`);
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

