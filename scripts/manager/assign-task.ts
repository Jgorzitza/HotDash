import { assignTask } from "../../app/services/tasks.server";

// Quick task assignment script for manager
// Usage: npx tsx --env-file=.env scripts/manager/assign-task.ts

const taskData = {
  assignedBy: "manager",
  assignedTo: process.env.AGENT || "engineer",
  taskId: process.env.TASK_ID || "ENG-NEW",
  title: process.env.TITLE || "New task",
  description: process.env.DESC || "Task description",
  acceptanceCriteria: process.env.CRITERIA
    ? process.env.CRITERIA.split("|")
    : ["Complete as described"],
  allowedPaths: process.env.PATHS ? process.env.PATHS.split("|") : ["app/**"],
  priority: (process.env.PRIORITY as "P0" | "P1" | "P2" | "P3") || "P2",
  phase: process.env.PHASE,
  estimatedHours: process.env.HOURS ? parseFloat(process.env.HOURS) : undefined,
  dependencies: process.env.DEPS ? process.env.DEPS.split(",") : undefined,
};

console.log("📝 Assigning task...\n");
console.log(`Agent: ${taskData.assignedTo}`);
console.log(`Task: ${taskData.taskId}`);
console.log(`Title: ${taskData.title}`);
console.log(`Priority: ${taskData.priority}`);

const task = await assignTask(taskData);

console.log(`\n✅ Task assigned successfully!`);
console.log(`   ID: ${task.id}`);
console.log(`   TaskId: ${task.taskId}`);
console.log(`   Status: ${task.status}`);
console.log(`   Assigned: ${task.assignedAt.toISOString()}`);

console.log("\nAgent can query with:");
console.log(
  `  npx tsx --env-file=.env scripts/agent/get-my-tasks.ts ${taskData.assignedTo}`,
);
