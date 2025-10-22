#!/usr/bin/env tsx
/**
 * Add payload examples to all agent direction files
 */

import fs from "fs";
import path from "path";

const AGENTS = [
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
  "qa",
  "pilot",
  "ai-customer",
  "ai-knowledge",
  "support",
  "manager",
];

const SHUTDOWN_SECTION = (agentName: string) => `
### Daily Shutdown (with Self-Grading)

**At end of day, log shutdown with self-assessment**:

\`\`\`typescript
import { calculateSelfGradeAverage } from '~/services/decisions.server';

const grades = {
  progress: 5,        // 1-5: Progress vs DoD
  evidence: 4,        // 1-5: Evidence quality
  alignment: 5,       // 1-5: Followed North Star/Rules
  toolDiscipline: 5,  // 1-5: MCP-first, no guessing
  communication: 4    // 1-5: Clear updates, timely blockers
};

await logDecision({
  scope: 'build',
  actor: '${agentName}',
  action: 'shutdown',
  status: 'in_progress',  // or 'completed' if all tasks done
  progressPct: 75,        // Overall daily progress
  rationale: 'Daily shutdown - {X} tasks completed, {Y} in progress',
  durationActual: 6.5,    // Total hours today
  payload: {
    dailySummary: '{TASK-A} complete, {TASK-B} at 75%',
    selfGrade: {
      ...grades,
      average: calculateSelfGradeAverage(grades)
    },
    retrospective: {
      didWell: ['Used MCP first', 'Good test coverage'],
      toChange: ['Ask questions earlier'],
      toStop: 'Making assumptions'
    },
    tasksCompleted: ['{TASK-ID-A}', '{TASK-ID-B}'],
    hoursWorked: 6.5
  }
});
\`\`\`

`;

function updateDirectionFile(agentName: string): boolean {
  const filePath = path.join("docs/directions", `${agentName}.md`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${agentName}: File not found`);
    return false;
  }

  let content = fs.readFileSync(filePath, "utf-8");

  // Check if already has shutdown section
  if (content.includes("Daily Shutdown (with Self-Grading)")) {
    console.log(`⏭️  ${agentName}: Already has shutdown section`);
    return true;
  }

  // Find insertion point (before "Markdown Backup")
  const insertPoint = content.indexOf("### Markdown Backup (Optional)");

  if (insertPoint === -1) {
    console.log(`⚠️  ${agentName}: Could not find insertion point`);
    return false;
  }

  const before = content.substring(0, insertPoint);
  const after = content.substring(insertPoint);
  const newContent = before + SHUTDOWN_SECTION(agentName) + after;

  fs.writeFileSync(filePath, newContent);
  console.log(`✅ ${agentName}: Added shutdown section`);
  return true;
}

console.log("🔄 Adding Shutdown + Self-Grading to All Agent Directions\n");
console.log("=".repeat(80));

let successCount = 0;
for (const agent of AGENTS) {
  if (updateDirectionFile(agent)) successCount++;
}

console.log("\n" + "=".repeat(80));
console.log(`\n✅ Updated: ${successCount}/${AGENTS.length} files`);
