#!/usr/bin/env tsx
/**
 * Submits manager-facing feedback for FEEDBACK_QUICK_START review
 * Usage: npx tsx --env-file=.env scripts/agent/feedback/submit-feedback-2025-10-25.ts
 */

import "dotenv/config";
import { logDecision } from "../../../app/services/decisions.server";

async function main() {
  const evidenceUrl =
    "artifacts/manager/feedback/FEEDBACK_QUICK_START-REVIEW-2025-10-25.md";

  const decision = await logDecision({
    scope: "build",
    actor: "data",
    action: "doc_review_feedback_submitted",
    rationale:
      "Reviewed FEEDBACK_QUICK_START for accuracy and completeness; submitted manager-facing report and recommendations.",
    taskId: "DOCS-FEEDBACK-QUICK-START",
    status: "completed",
    progressPct: 100,
    evidenceUrl,
    payload: {
      technicalNotes:
        "Verified template and manager scripts; confirmed decisions.server API fields; suggested additions for action naming, evidence, and CI usage.",
    },
  });

  console.log("✅ Feedback submitted to decision log");
  console.log(`   ID: ${decision.id}`);
  console.log(`   Created: ${decision.createdAt}`);
}

main().catch((err) => {
  console.error("❌ Error submitting feedback", err);
  process.exit(1);
});

