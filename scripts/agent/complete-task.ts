import { updateTask, getTaskDetails } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";

const taskId = process.argv[2];
const completionNotes = process.argv.slice(3).join(" ");

if (!taskId) {
  console.error(
    "❌ Usage: npx tsx --env-file=.env scripts/agent/complete-task.ts <TASK-ID> <completion notes>",
  );
  process.exit(1);
}

if (!completionNotes) {
  console.error("❌ Completion notes required (preserves context)");
  console.error(
    '   Example: npx tsx scripts/agent/complete-task.ts ENG-029 "PII Card complete, 22/22 tests passing"',
  );
  process.exit(1);
}

console.log(`✅ Completing task: ${taskId}\n`);

// Get task details
const task = await getTaskDetails(taskId);

if (!task) {
  console.error(`❌ Task ${taskId} not found`);
  process.exit(1);
}

// Update task status with completion notes
await updateTask(taskId, {
  status: "completed",
  completedAt: new Date(),
  completionNotes: completionNotes, // PRESERVES CONTEXT
});

console.log("✅ Task marked complete with notes");

// Log to decision log
await logDecision({
  scope: "build",
  actor: task.assignedTo,
  taskId: taskId,
  status: "completed",
  progressPct: 100,
  action: "task_completed",
  rationale: completionNotes,
  evidenceUrl:
    task.evidenceUrl ||
    `artifacts/${task.assignedTo}/tasks/${taskId.toLowerCase()}.md`,
});

console.log("✅ Logged to decision_log");

console.log(`\n📋 Task: ${task.title}`);
console.log(`Completion Notes: ${completionNotes}`);
console.log(`Completed: ${new Date().toISOString()}`);

console.log(
  "\n🎉 Task complete! Manager will see this immediately in query-completed-today.ts",
);
