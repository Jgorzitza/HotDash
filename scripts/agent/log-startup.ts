import { logDecision } from "../../app/services/decisions.server";

const agent = process.argv[2] || "unknown";
const branch = process.argv[3] || "unknown";
const tasksFound = parseInt(process.argv[4] || "0", 10);
const nextTask = process.argv[5] || "N/A";

console.log(`📝 Logging startup for ${agent} agent\n`);

await logDecision({
  scope: "build",
  actor: agent,
  action: "startup_complete",
  rationale: `${agent} agent startup complete on branch ${branch}. Found ${tasksFound} active tasks via database query. Next unblocked task: ${nextTask}. Evidence directories created for Growth Engine compliance.`,
  evidenceUrl: "scripts/agent/get-my-tasks.ts",
  payload: {
    branch,
    tasksFound,
    nextTask,
    method: "database-driven",
    evidenceDirectories: [
      `artifacts/${agent}/2025-10-22/mcp`,
      `artifacts/${agent}/2025-10-22/screenshots`
    ]
  }
});

console.log("✅ Startup logged successfully to decision_log");
console.log(`\n🎯 Ready to start work on: ${nextTask}`);
