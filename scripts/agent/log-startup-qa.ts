import { logDecision } from "../../app/services/decisions.server";
import { getMyTasks, getMyNextTask } from "../../app/services/tasks.server";

async function main() {
  try {
    const agent = process.argv[2] || process.env.AGENT_NAME || "qa-helper";

    const tasks = await getMyTasks(agent);
    const next = await getMyNextTask(agent);

    await logDecision({
      scope: "build",
      actor: agent,
      action: "startup_complete",
      rationale: `Agent startup complete, found ${tasks.length} active tasks, starting ${next?.taskId ?? "N/A"}`,
      evidenceUrl: "scripts/agent/get-my-tasks.ts",
      nextAction: next ? `Start ${next.taskId} - ${next.title}` : undefined,
    });

    console.log(`✅ Startup logged for agent: ${agent}`);
  } catch (error) {
    console.error("❌ Failed to log startup:", error);
    process.exit(1);
  }
}

main();

