import "dotenv/config";
import { logDecision } from "../../app/services/decisions.server";

async function log() {
  await logDecision({
    scope: "ops",
    actor: "manager",
    action: "production_blockers_assigned",
    rationale:
      "Assigned 5 production blocker tasks to DATABASE (DB ONLY - no markdown). DATA: 2 tasks (LlamaIndex index, DashboardFact schema). MANAGER: 3 tasks (Langfuse decision, image search verification, MCP evidence verification). Removed staging blocker (pushing to dev app directly). All direction in database now.",
    taskId: "MANAGER-PRODUCTION-LAUNCH-001",
    status: "in_progress",
    progressPct: 75,
    evidenceUrl: "scripts/manager/assign-production-blockers.ts",
  });

  console.log("✅ Logged to database");
}

log();

