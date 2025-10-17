#!/usr/bin/env tsx
/**
 * Publer Adapter Proof Script
 *
 * Verifies schedule and status APIs using official Publer client.
 *
 * Required env vars:
 *   PUBLER_API_KEY
 *   PUBLER_WORKSPACE_ID
 */

import {
  getJobStatus,
  schedulePost,
} from "../../packages/integrations/publer.ts";

async function main() {
  const apiKey = process.env.PUBLER_API_KEY;
  const workspaceId = process.env.PUBLER_WORKSPACE_ID;

  if (!apiKey || !workspaceId) {
    console.error("PUBLER_API_KEY and PUBLER_WORKSPACE_ID must be set.");
    process.exit(1);
  }

  console.log("Scheduling test post via Publer...");
  const job = await schedulePost({
    text: "Proof-of-life post (scheduled far in future)",
    accountIds: ["account_id_placeholder"],
    scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
  });

  console.log(`Job created: ${job.job_id}`);

  const status = await getJobStatus(job.job_id);
  console.log("Current job status:", status);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
