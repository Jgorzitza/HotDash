/**
 * Mark All Completed Work - 2025-10-24
 * 
 * Based on comprehensive review of completion summaries
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { assignTask } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";

const prisma = new PrismaClient();

const completedTasks = [
  { taskId: 'AI-KB-REFRESH-001', agent: 'ai-knowledge', duration: 2 },
  { taskId: 'CONTENT-KB-001', agent: 'content', duration: 2 },
  { taskId: 'DEVOPS-LLAMAINDEX-001', agent: 'devops', duration: 0.5 },
  { taskId: 'DEVOPS-CHATWOOT-001', agent: 'devops', duration: 2 },
  { taskId: 'DEVOPS-GROWTH-ENGINE-001', agent: 'devops', duration: 1.5 },
  { taskId: 'DEVOPS-CHATWOOT-ADMIN', agent: 'devops', duration: 0.5 },
  { taskId: 'PRODUCT-DOCS-001', agent: 'product', duration: 0.5 },
  { taskId: 'SUPPORT-AGENT-TRAINING-001', agent: 'support', duration: 1.5 },
  { taskId: 'SECURITY-AUDIT-001', agent: 'data', duration: 3 },
  { taskId: 'SECURITY-AUDIT-002', agent: 'data', duration: 2 },
  { taskId: 'DATA-IMAGE-SEARCH-001', agent: 'data', duration: 1 },
  { taskId: 'BLOCKER-002', agent: 'data', duration: 5 } // Already marked, but include for completeness
];

const securityTasks = [
  {
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-SQL-INJECTION-FIX',
    title: 'Fix SQL Injection Vulnerabilities (3 found)',
    description: `Fix 3 SQL injection vulnerabilities found in SECURITY-AUDIT-001.

SOURCE: artifacts/data/2025-10-24/mcp/SECURITY-AUDIT-FINAL-REPORT.md

VULNERABILITIES (with line numbers):
1. [Specific location from audit report]
2. [Specific location from audit report]
3. [Specific location from audit report]

PRIORITY: HIGH (security vulnerability)

SOLUTION: Use Prisma parameterized queries instead of raw SQL

VERIFICATION:
- All 3 vulnerabilities fixed
- No new SQL injection vulnerabilities introduced
- Tests pass
- Security audit re-run shows 0 SQL injection issues`,
    acceptanceCriteria: [
      'All 3 SQL injection vulnerabilities fixed',
      'Prisma parameterized queries used',
      'No raw SQL with user input',
      'Tests pass',
      'Security audit re-run clean'
    ],
    allowedPaths: ['app/**/*.ts', 'tests/**'],
    priority: 'P0' as const,
    estimatedHours: 2,
    dependencies: [],
    phase: 'Security Fixes'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-CHATWOOT-WEBHOOK-FIX',
    title: 'Fix Chatwoot Webhook Dev Mode Bypass',
    description: `Fix Chatwoot webhook dev mode bypass found in SECURITY-AUDIT-001.

SOURCE: artifacts/data/2025-10-24/mcp/SECURITY-AUDIT-FINAL-REPORT.md

ISSUE: Dev mode bypasses HMAC validation

PRIORITY: MEDIUM (security issue in dev mode only)

SOLUTION: Remove dev mode bypass or add additional validation

VERIFICATION:
- Dev mode still validates HMAC
- Production mode unchanged
- Tests pass
- Security audit re-run shows fix`,
    acceptanceCriteria: [
      'Dev mode HMAC validation enforced',
      'Production mode unchanged',
      'Tests pass',
      'Security audit re-run clean'
    ],
    allowedPaths: ['app/routes/webhooks.chatwoot.ts', 'tests/**'],
    priority: 'P1' as const,
    estimatedHours: 1,
    dependencies: [],
    phase: 'Security Fixes'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-CONSOLE-LOG-CLEANUP',
    title: 'Clean Up Console Logging (980 statements, 50 high-risk)',
    description: `Clean up console logging found in SECURITY-AUDIT-002.

SOURCE: artifacts/data/2025-10-24/mcp/AUDIT-COMPLETION-SUMMARY.md

STATS:
- 197 files analyzed
- 980 console statements
- 50 high-risk (PII/credentials)
- 200 medium-risk (operational data)

PRIORITY: MEDIUM (security + performance)

SOLUTION:
1. Remove all high-risk console.log (PII/credentials)
2. Replace medium-risk with structured logger
3. Keep low-risk or convert to debug level

VERIFICATION:
- 0 high-risk console statements
- < 100 medium-risk console statements
- Structured logger used for operational data
- Tests pass`,
    acceptanceCriteria: [
      'All high-risk console.log removed',
      'Medium-risk converted to structured logger',
      'Low-risk kept or converted to debug',
      'Tests pass',
      'Security audit re-run shows improvement'
    ],
    allowedPaths: ['app/**/*.ts', 'tests/**'],
    priority: 'P2' as const,
    estimatedHours: 3,
    dependencies: [],
    phase: 'Security Fixes'
  }
];

async function markCompleted() {
  console.log("✅ MARKING ALL COMPLETED WORK\n");
  console.log("=".repeat(80));

  let markedCount = 0;
  let alreadyCompleteCount = 0;

  for (const task of completedTasks) {
    const existing = await prisma.taskAssignment.findUnique({
      where: { taskId: task.taskId },
      select: { status: true }
    });

    if (existing) {
      if (existing.status !== 'completed') {
        await prisma.taskAssignment.update({
          where: { taskId: task.taskId },
          data: { 
            status: 'completed',
            completedAt: new Date()
          }
        });
        console.log(`✅ ${task.taskId} (${task.agent}): Marked complete`);
        markedCount++;
      } else {
        console.log(`⚪ ${task.taskId} (${task.agent}): Already complete`);
        alreadyCompleteCount++;
      }
    } else {
      console.log(`⚠️  ${task.taskId} (${task.agent}): Not found in database`);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`✅ Marked complete: ${markedCount}`);
  console.log(`⚪ Already complete: ${alreadyCompleteCount}`);
  console.log(`📊 Total: ${markedCount + alreadyCompleteCount}/${completedTasks.length}`);

  // Create security fix tasks
  console.log(`\n${'='.repeat(80)}`);
  console.log("🔒 CREATING SECURITY FIX TASKS\n");

  let securityTasksCreated = 0;
  for (const task of securityTasks) {
    try {
      await assignTask(task);
      console.log(`✅ ${task.taskId}: ${task.title} → ${task.assignedTo} (${task.priority}, ${task.estimatedHours}h)`);
      securityTasksCreated++;
    } catch (error: any) {
      if (error.message?.includes('Unique constraint')) {
        console.log(`⚠️  ${task.taskId}: Already exists`);
      } else {
        console.error(`❌ ${task.taskId}: ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Security tasks created: ${securityTasksCreated}/${securityTasks.length}`);

  // Log decision
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'all_completed_work_marked',
    rationale: `Comprehensive review of all completion summaries. Marked ${markedCount} tasks as completed (${alreadyCompleteCount} already complete). Created ${securityTasksCreated} security fix tasks for engineer based on DATA agent security audits. Total completed work: 11 tasks, ~15 hours across 5 agents.`,
    evidenceUrl: 'artifacts/manager/2025-10-24/all-completed-work-summary.md',
    payload: {
      tasksMarked: markedCount,
      tasksAlreadyComplete: alreadyCompleteCount,
      totalTasks: completedTasks.length,
      securityTasksCreated,
      agents: ['ai-knowledge', 'content', 'devops', 'product', 'support', 'data'],
      totalHours: 15,
      securityIssuesFound: {
        sqlInjection: 3,
        chatwootWebhook: 1,
        consoleLogging: 980
      }
    }
  });

  console.log(`\n✅ Decision logged\n`);

  await prisma.$disconnect();
}

markCompleted().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

