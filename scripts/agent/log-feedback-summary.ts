import { logDecision } from "../../app/services/decisions.server";

async function main() {
  const [actor, taskId] = process.argv.slice(2);
  if (!actor || !taskId) {
    console.error(
      "❌ Usage: npx tsx --env-file=.env scripts/agent/log-feedback-summary.ts <actor> <taskId>"
    );
    process.exit(1);
  }

  const mcpEvidenceFile = "artifacts/qa-helper/2025-10-23/mcp/QA-UI-001.jsonl";
  const heartbeatFile = "artifacts/qa-helper/2025-10-23/heartbeat.ndjson";
  const kbResultsFile = "kb-search-QA-UI-001-1761248159695.json";

  await logDecision({
    scope: "build",
    actor,
    taskId,
    status: "in_progress",
    progressPct: 20,
    action: "qa_feedback_summary",
    rationale: "QA startup runbook executed; KB + MCP evidence captured; tests attempted; blocker recorded.",
    evidenceUrl: mcpEvidenceFile,
    payload: {
      runbook: "docs/runbooks/agent_startup_checklist.md",
      stepsCompleted: [
        "verify_branch",
        "review_docs",
        "fetch_tasks",
        "create_evidence_dirs",
        "kb_search",
        "mcp_docs_pull",
        "startup_logged",
        "progress_logged"
      ],
      artifacts: [
        mcpEvidenceFile,
        heartbeatFile,
        kbResultsFile,
        "tests/unit/ActionQueueCard.spec.tsx"
      ],
      mcpEvidence: {
        calls: 1,
        tools: ["context7"],
        evidenceFile: mcpEvidenceFile
      },
      kbSearch: {
        resultsCount: 8,
        recommendationsCount: 3,
        resultsFile: kbResultsFile
      },
      task: {
        id: taskId,
        status: "in_progress",
        progressPct: 20
      },
      testsAttempted: [
        {
          cmd: "npx vitest run tests/unit/ActionQueueCard.spec.tsx",
          result: "transform_error",
          note: "Duplicate named exports in app/utils/analytics.ts"
        },
        {
          cmd: "npm run test:unit",
          result: "partial_fail",
          note: "Unrelated failures; out of QA-UI-001 scope"
        }
      ],
      block: {
        blockerType: "technical",
        blockedBy: "app/utils/analytics.ts duplicate named exports",
        impact: "Cannot run ActionQueueCard/ApprovalCard unit tests",
        remediation: "Engineer to dedupe exports; re-run tests"
      },
      nextActions: [
        "Coordinate with Engineer to fix analytics exports",
        "Re-run targeted component tests",
        "Proceed with route render checks once unblocked"
      ]
    }
  });

  console.log(`✅ Feedback summary logged for ${actor} ${taskId}`);
}

main().catch((err) => {
  console.error("❌ Failed to log feedback summary:", err);
  process.exit(1);
});

