import * as fs from "fs";
import * as path from "path";
import { assignTask } from "../app/services/tasks.server";

interface ParsedTask {
  taskId: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  allowedPaths: string[];
  priority: "P0" | "P1" | "P2" | "P3";
  phase?: string;
  estimatedHours?: number;
  dependencies?: string[];
  status: "assigned" | "completed" | "blocked";
  completionNotes?: string;
}

function parseDirectionFile(filePath: string, agentName: string): ParsedTask[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const tasks: ParsedTask[] = [];

  // Match task sections like:
  // ### ENG-029: PII Card Component (3h, P1)
  // or
  // ## ✅ PHASE 9: PII Card Component (3 hours) — COMPLETE

  const taskRegex =
    /###?\s+(?:✅\s+)?([A-Z]{2,}-\d{3,}|PHASE\s+\d+):\s+(.+?)(?:\((\d+(?:\.\d+)?)\s*h?,?\s*(P\d)\)|$)/gim;

  let match;
  while ((match = taskRegex.exec(content)) !== null) {
    const taskId = match[1];
    const title = match[2].trim();
    const estimatedHours = match[3] ? parseFloat(match[3]) : undefined;
    const priority = (match[4] as "P0" | "P1" | "P2" | "P3") || "P2";

    // Extract section content
    const startIdx = match.index;
    let endIdx = content.indexOf("\n##", startIdx + 1);
    if (endIdx === -1) endIdx = content.length;

    const sectionContent = content.substring(startIdx, endIdx);

    // Determine status
    let status: "assigned" | "completed" | "blocked" = "assigned";
    let completionNotes: string | undefined;

    if (
      sectionContent.includes("✅ COMPLETE") ||
      sectionContent.includes("COMPLETE ✅")
    ) {
      status = "completed";
      // Extract completion notes
      const notesMatch =
        /\*\*Completion\*\*:\s*(.+?)(?:\n\n|\n###|\n##|$)/s.exec(
          sectionContent,
        );
      completionNotes = notesMatch ? notesMatch[1].trim() : undefined;
    } else if (
      sectionContent.includes("BLOCKED") ||
      sectionContent.includes("⏭️ DEFERRED")
    ) {
      status = "blocked";
    }

    // Extract description
    const descMatch = /\*\*Objective\*\*:\s*(.+?)(?:\n\n|\*\*)/s.exec(
      sectionContent,
    );
    const description = descMatch ? descMatch[1].trim() : title;

    // Extract acceptance criteria
    const criteriaMatch = /\*\*Acceptance Criteria\*\*:\s*((?:- .+?\n)+)/s.exec(
      sectionContent,
    );
    const acceptanceCriteria: string[] = [];
    if (criteriaMatch) {
      const lines = criteriaMatch[1].split("\n");
      lines.forEach((line) => {
        const cleaned = line
          .replace(/^- \[.\]\s*/, "")
          .replace(/^-\s*/, "")
          .trim();
        if (cleaned) acceptanceCriteria.push(cleaned);
      });
    }

    // Extract allowed paths
    const pathsMatch = /\*\*Allowed Paths\*\*:\s*((?:- `.+?`\n)+)/s.exec(
      sectionContent,
    );
    const allowedPaths: string[] = [];
    if (pathsMatch) {
      const lines = pathsMatch[1].split("\n");
      lines.forEach((line) => {
        const pathMatch = /`(.+?)`/.exec(line);
        if (pathMatch) allowedPaths.push(pathMatch[1]);
      });
    }

    // Extract dependencies
    const depsMatch = /\*\*Dependencies\*\*:\s*(.+?)(?:\n\n|\*\*)/s.exec(
      sectionContent,
    );
    const dependencies: string[] = [];
    if (depsMatch && !depsMatch[1].includes("None")) {
      const depIds = depsMatch[1].match(/[A-Z]{2,}-\d{3,}/g);
      if (depIds) dependencies.push(...depIds);
    }

    // Extract phase
    const phaseMatch = /(?:PHASE|Phase)\s+(\d+)/i.exec(sectionContent);
    const phase = phaseMatch ? `Phase ${phaseMatch[1]}` : undefined;

    // Only add if we have minimal required fields
    if (
      acceptanceCriteria.length > 0 ||
      allowedPaths.length > 0 ||
      description.length > title.length
    ) {
      tasks.push({
        taskId: taskId.toUpperCase(),
        title,
        description,
        acceptanceCriteria:
          acceptanceCriteria.length > 0
            ? acceptanceCriteria
            : ["Complete task as described"],
        allowedPaths: allowedPaths.length > 0 ? allowedPaths : ["**"],
        priority,
        phase,
        estimatedHours,
        dependencies: dependencies.length > 0 ? dependencies : undefined,
        status,
        completionNotes,
      });
    }
  }

  return tasks;
}

async function uploadAgentDirection(agentName: string) {
  console.log(`\n📁 Uploading direction for: ${agentName}`);

  const directionFile = path.join("docs/directions", `${agentName}.md`);

  if (!fs.existsSync(directionFile)) {
    console.log(`⚪ No direction file found for ${agentName}`);
    return { total: 0, uploaded: 0, errors: 0 };
  }

  const tasks = parseDirectionFile(directionFile, agentName);

  console.log(`   Found ${tasks.length} tasks`);

  let uploaded = 0;
  let errors = 0;

  for (const task of tasks) {
    try {
      await assignTask({
        assignedBy: "manager",
        assignedTo: agentName,
        taskId: task.taskId,
        title: task.title,
        description: task.description,
        acceptanceCriteria: task.acceptanceCriteria,
        allowedPaths: task.allowedPaths,
        priority: task.priority,
        phase: task.phase,
        estimatedHours: task.estimatedHours,
        dependencies: task.dependencies,
        payload: {
          source: "historical_direction_upload",
          originalFile: directionFile,
          completionNotes: task.completionNotes,
        },
      });

      // If task was completed, update status
      if (task.status === "completed") {
        await import("../app/services/tasks.server").then((m) =>
          m.updateTask(task.taskId, {
            status: "completed",
            completedAt: new Date(),
            completionNotes: task.completionNotes,
          }),
        );
      } else if (task.status === "blocked") {
        await import("../app/services/tasks.server").then((m) =>
          m.updateTask(task.taskId, { status: "blocked" }),
        );
      }

      uploaded++;
      console.log(`   ✅ ${task.taskId}: ${task.status}`);
    } catch (error) {
      console.error(
        `   ❌ ${task.taskId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      errors++;
    }
  }

  return { total: tasks.length, uploaded, errors };
}

// Main execution
const agents = process.argv[2]
  ? [process.argv[2]]
  : [
      "engineer",
      "designer",
      "data",
      "devops",
      "integrations",
      "analytics",
      "inventory",
      "seo",
      "ads",
      "content",
      "product",
      "pilot",
      "qa",
      "support",
      "ai-customer",
      "ai-knowledge",
      "manager",
    ];

console.log(
  "================================================================================",
);
console.log("UPLOADING DIRECTION FILES TO DATABASE");
console.log(
  "================================================================================",
);

let totalTasks = 0;
let totalUploaded = 0;
let totalErrors = 0;

for (const agent of agents) {
  const result = await uploadAgentDirection(agent);
  totalTasks += result.total;
  totalUploaded += result.uploaded;
  totalErrors += result.errors;
}

console.log("\n" + "=".repeat(80));
console.log("\n📊 Upload Complete:");
console.log(`   Agents: ${agents.length}`);
console.log(`   Total tasks: ${totalTasks}`);
console.log(`   Uploaded: ${totalUploaded}`);
console.log(`   Errors: ${totalErrors}`);
console.log(`\n✅ Direction files now in database!`);
console.log("\nVerify with:");
console.log("  npx tsx --env-file=.env scripts/manager/query-all-tasks.ts");
