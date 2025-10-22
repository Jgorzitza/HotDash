#!/usr/bin/env tsx
/**
 * Batch update all 17 agent direction files with new database feedback section
 *
 * Usage: npx tsx scripts/manager/update-agent-directions-feedback.ts
 *
 * This script adds the "Progress Reporting (Database Feedback)" section to each agent direction file
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

const FEEDBACK_SECTION = (agentName: string) => `
## 📊 MANDATORY: Progress Reporting (Database Feedback)

**Report progress via \`logDecision()\` every 2 hours minimum OR at task milestones.**

### Basic Usage

\`\`\`typescript
import { logDecision } from '~/services/decisions.server';

// When starting a task
await logDecision({
  scope: 'build',
  actor: '${agentName}',
  taskId: '{TASK-ID}',              // Task ID from this direction file
  status: 'in_progress',            // pending | in_progress | completed | blocked | cancelled
  progressPct: 0,                   // 0-100 percentage
  action: 'task_started',
  rationale: 'Starting {task description}',
  evidenceUrl: 'docs/directions/${agentName}.md',
  durationEstimate: 4.0             // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: 'build',
  actor: '${agentName}',
  taskId: '{TASK-ID}',
  status: 'in_progress',
  progressPct: 50,                  // Update progress
  action: 'task_progress',
  rationale: 'Component implemented, writing tests',
  evidenceUrl: 'artifacts/${agentName}/2025-10-22/{task}.md',
  durationActual: 2.0,              // Hours spent so far
  nextAction: 'Complete integration tests'
});

// When completed
await logDecision({
  scope: 'build',
  actor: '${agentName}',
  taskId: '{TASK-ID}',
  status: 'completed',              // CRITICAL for manager queries
  progressPct: 100,
  action: 'task_completed',
  rationale: '{Task name} complete, {X}/{X} tests passing',
  evidenceUrl: 'artifacts/${agentName}/2025-10-22/{task}-complete.md',
  durationEstimate: 4.0,
  durationActual: 3.5,              // Compare estimate vs actual
  nextAction: 'Starting {NEXT-TASK-ID}'
});
\`\`\`

### When Blocked (CRITICAL)

**Manager queries blocked tasks FIRST during consolidation**:

\`\`\`typescript
await logDecision({
  scope: 'build',
  actor: '${agentName}',
  taskId: '{TASK-ID}',
  status: 'blocked',                // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: 'Waiting for {dependency} to complete',
  blockedBy: '{DEPENDENCY-TASK-ID}',  // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: 'task_blocked',
  rationale: 'Cannot proceed because {reason}',
  evidenceUrl: 'feedback/${agentName}/2025-10-22.md'
});
\`\`\`

### Manager Visibility

Manager runs these scripts to see your work instantly:
- \`query-blocked-tasks.ts\` - Shows if you're blocked and why
- \`query-agent-status.ts\` - Shows your current task and progress  
- \`query-completed-today.ts\` - Shows your completed work

**This is why structured logging is MANDATORY** - Manager can see status across all 17 agents in <10 seconds.

### Markdown Backup (Optional)

You can still write to \`feedback/${agentName}/2025-10-22.md\` for detailed notes, but database is the primary method.

---
`;

function updateDirectionFile(agentName: string): {
  success: boolean;
  message: string;
} {
  const filePath = path.join("docs/directions", `${agentName}.md`);

  if (!fs.existsSync(filePath)) {
    return { success: false, message: `File not found: ${filePath}` };
  }

  let content = fs.readFileSync(filePath, "utf-8");

  // Check if already has the database feedback section
  if (
    content.includes("📊 MANDATORY: Progress Reporting (Database Feedback)")
  ) {
    return {
      success: true,
      message: "Already has database feedback section (skipped)",
    };
  }

  // Find insertion point (before first "## 🎯" section or after git setup)
  const targetHeadings = [
    "## 🎯 ACTIVE TASKS",
    "## 🎯 ACTIVE RESPONSIBILITIES",
    "## 🚀 ACTIVE RESPONSIBILITIES",
    "## ACTIVE TASKS",
    "## 🔧 MANDATORY: DEV MEMORY",
  ];

  let insertIndex = -1;
  for (const heading of targetHeadings) {
    const idx = content.indexOf(heading);
    if (idx !== -1 && (insertIndex === -1 || idx < insertIndex)) {
      insertIndex = idx;
    }
  }

  if (insertIndex === -1) {
    // Fallback: Insert after first few lines
    const lines = content.split("\n");
    insertIndex = content.indexOf(lines[10] || ""); // After ~10 lines
  }

  if (insertIndex === -1) {
    return { success: false, message: "Could not find insertion point" };
  }

  // Insert the feedback section
  const before = content.substring(0, insertIndex);
  const after = content.substring(insertIndex);
  const newContent = before + FEEDBACK_SECTION(agentName) + after;

  fs.writeFileSync(filePath, newContent);

  return { success: true, message: "Added database feedback section" };
}

console.log("🔄 Updating All 17 Agent Direction Files\n");
console.log("=".repeat(80));

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

for (const agent of AGENTS) {
  const result = updateDirectionFile(agent);

  if (result.success) {
    if (result.message.includes("skipped")) {
      console.log(`⏭️  ${agent.padEnd(15)} - ${result.message}`);
      skipCount++;
    } else {
      console.log(`✅ ${agent.padEnd(15)} - ${result.message}`);
      successCount++;
    }
  } else {
    console.log(`❌ ${agent.padEnd(15)} - ${result.message}`);
    errorCount++;
  }
}

console.log("\n" + "=".repeat(80));
console.log(`\n📊 Update Summary:`);
console.log(`   Success: ${successCount} files updated`);
console.log(`   Skipped: ${skipCount} files (already updated)`);
console.log(`   Errors: ${errorCount} files`);
console.log(`   Total: ${AGENTS.length} agents`);

if (errorCount === 0) {
  console.log("\n✅ All agent direction files updated successfully!");
  console.log("\n📋 Next Steps:");
  console.log("   1. Review updates: git diff docs/directions/");
  console.log(
    '   2. Commit changes: git add docs/directions/ && git commit -m "feat: add database feedback to all agent directions"',
  );
  console.log(
    "   3. Announce to agents: All agents must use logDecision() every 2 hours",
  );
} else {
  console.log(
    "\n⚠️  Some files had errors. Please review and update manually.",
  );
}
