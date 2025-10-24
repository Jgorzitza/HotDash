/**
 * Update All Agent Directions - 2025-10-24
 * 
 * Based on comprehensive decision_log review
 * Only inventory, qa-helper, specialagent001 currently working
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { assignTask } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";

const prisma = new PrismaClient();

// Agents with completed work today (from decision_log)
const completedAgents = {
  engineer: 13, // ENG-002, ENG-API-001, SECURITY-AUDIT-003/004, etc.
  devops: 5, // DEVOPS-LLAMAINDEX-001, DEVOPS-CHATWOOT-001, BLOCKER-005, etc.
  data: 3, // SECURITY-AUDIT-001/002, DATA-IMAGE-SEARCH-001
  integrations: 1, // INTEGRATIONS-019
  'ai-knowledge': 1, // AI-KB-REFRESH-001
  support: 1, // SUPPORT-AGENT-TRAINING-001
  analytics: 3, // ANA-018, ANALYTICS-LLAMAINDEX-001, ANALYTICS-IMAGE-SEARCH-001
  seo: 1, // SEO-IMAGE-SEARCH-001
  content: 1, // CONTENT-KB-001
  designer: 2, // DES-025, DESIGNER-IMAGE-SEARCH-001
  pilot: 1, // PILOT-UI-REVIEW-001
  'ai-customer': 1, // AI-CUSTOMER-HANDOFF-001 (startup)
  qa: 1, // QA-AGENT-HANDOFFS-001 (in progress)
  'qa-helper': 1, // QA-001
  ads: 1, // ADS-IMAGE-SEARCH-001 (in progress)
  inventory: 1 // INVENTORY-IMAGE-SEARCH-001 (completed)
};

// Currently working (per CEO)
const currentlyWorking = ['inventory', 'qa-helper', 'specialagent001'];

// New tasks for idle agents
const newTasks = [
  {
    assignedBy: 'manager',
    assignedTo: 'content',
    taskId: 'BLOCKER-001',
    title: 'Populate LlamaIndex Knowledge Base',
    description: `Populate LlamaIndex KB to unblock QA testing (CEO APPROVED).

BLOCKER: QA-AGENT-HANDOFFS-001 cannot complete - MCP query_support returns 'No latest index found'

IMPLEMENTATION ORDER (CEO approved, expedited):
1. Build staging & preview system (2h)
2. Scrape hotrodan.com to staging (1h)
3. Generate CEO preview document (1h)
4. Wait for CEO approval (30min)
5. Commit approved content (1h)

UNBLOCKS: QA agent

REFERENCE: docs/specs/knowledge-base-population-plan.md (CEO APPROVED)`,
    acceptanceCriteria: [
      'Staging & preview system built',
      'hotrodan.com scraped to staging',
      'CEO preview document generated',
      'CEO reviews and approves preview',
      'Approved content committed to knowledge_base',
      'MCP query_support returns results',
      'QA agent unblocked'
    ],
    allowedPaths: ['scripts/knowledge-base/**', 'staging/**', 'app/services/knowledge/**'],
    priority: 'P0' as const,
    estimatedHours: 6,
    dependencies: [],
    phase: 'Blocker Resolution'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'BLOCKER-004',
    title: 'Fix Playwright Build Failures',
    description: `Fix Playwright build failures to unblock QA testing.

BLOCKER: Blocks QA-004 (2 entries) and QA-UI-001

ROOT CAUSE:
1. Duplicate key 'dev-kb:query' in package.json
2. Duplicate named exports in app/utils/analytics.ts

FIXES REQUIRED:
1. Fix package.json duplicate key (15min)
2. Fix app/utils/analytics.ts duplicate exports (15min)
3. Verify Playwright build succeeds (15min)

UNBLOCKS: QA agent (2 tasks)`,
    acceptanceCriteria: [
      'package.json duplicate key removed',
      'app/utils/analytics.ts duplicate exports removed',
      'Playwright webServer build succeeds',
      'No build errors',
      'Sample test runs successfully',
      'QA agent unblocked'
    ],
    allowedPaths: ['package.json', 'app/utils/analytics.ts', 'playwright.config.ts', 'tests/**'],
    priority: 'P1' as const,
    estimatedHours: 1,
    dependencies: [],
    phase: 'Blocker Resolution'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-CHATWOOT-WEBHOOK-FIX',
    title: 'Fix Chatwoot Webhook Dev Mode Bypass',
    description: `Fix Chatwoot webhook dev mode bypass (from SECURITY-AUDIT-001).

ISSUE: Dev mode bypasses HMAC validation

PRIORITY: MEDIUM (security issue in dev mode only)

SOLUTION: Remove dev mode bypass or add additional validation`,
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
    description: `Clean up console logging (from SECURITY-AUDIT-002).

STATS: 980 console statements, 50 high-risk (PII/credentials)

SOLUTION:
1. Remove all high-risk console.log (PII/credentials)
2. Replace medium-risk with structured logger
3. Keep low-risk or convert to debug level`,
    acceptanceCriteria: [
      'All high-risk console.log removed',
      'Medium-risk converted to structured logger',
      'Low-risk kept or converted to debug',
      'Tests pass'
    ],
    allowedPaths: ['app/**/*.ts', 'tests/**'],
    priority: 'P2' as const,
    estimatedHours: 3,
    dependencies: [],
    phase: 'Security Fixes'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-GA-MCP-CLEANUP',
    title: 'Remove GA MCP References (Use Direct API)',
    description: `Remove all Google Analytics MCP references - we use direct API.

CEO DIRECTIVE: GA_MCP_HOST not used, direct API tool built already.

FILES TO UPDATE:
1. mcp/mcp-config.json - Remove google-analytics server
2. app/config/ga.server.ts - Remove 'mcp' mode
3. app/services/ga/mcpClient.ts - DELETE
4. app/services/ga/ingest.ts - Remove MCP client selection
5. tests/unit/ga.config.spec.ts - Remove MCP mode tests

KEEP: app/services/ga/directClient.ts (direct API)`,
    acceptanceCriteria: [
      'google-analytics removed from mcp-config.json',
      'mcp mode removed from ga.server.ts',
      'mcpClient.ts deleted',
      'grep -r "GA_MCP" returns no results (except archives)',
      'All tests pass'
    ],
    allowedPaths: ['mcp/**', 'app/config/ga.server.ts', 'app/services/ga/**', 'tests/**'],
    priority: 'P1' as const,
    estimatedHours: 1,
    dependencies: [],
    phase: 'Cleanup'
  }
];

async function updateDirections() {
  console.log("📋 UPDATING ALL AGENT DIRECTIONS\n");
  console.log("=".repeat(80));

  // Mark all completed tasks
  console.log("\n✅ Step 1: Marking completed tasks in database...\n");
  
  const completedTaskIds = [
    'ENG-002', 'ENG-API-001', 'SECURITY-AUDIT-003', 'SECURITY-AUDIT-004',
    'QUALITY-ASSURANCE-003', 'ENG-003', 'ENG-075', 'ENG-077', 'ENG-079',
    'ENG-060', 'ENG-063', 'ENG-061', 'ENG-062',
    'DEVOPS-LLAMAINDEX-001', 'DEVOPS-CHATWOOT-001', 'DEVOPS-GE-001',
    'CHATWOOT-ADMIN-SETUP', 'BLOCKER-005',
    'SECURITY-AUDIT-001', 'SECURITY-AUDIT-002', 'DATA-IMAGE-SEARCH-001',
    'INTEGRATIONS-019', 'AI-KB-REFRESH-001', 'SUPPORT-AGENT-TRAINING-001',
    'ANA-018', 'ANALYTICS-LLAMAINDEX-001', 'ANALYTICS-IMAGE-SEARCH-001',
    'SEO-IMAGE-SEARCH-001', 'CONTENT-KB-001', 'DESIGNER-IMAGE-SEARCH-001',
    'PILOT-UI-REVIEW-001', 'QA-001', 'INVENTORY-IMAGE-SEARCH-001',
    'BLOCKER-002', 'BLOCKER-003', 'ENG-SQL-INJECTION-FIX'
  ];

  let markedCount = 0;
  for (const taskId of completedTaskIds) {
    try {
      const result = await prisma.taskAssignment.updateMany({
        where: { taskId, status: { not: 'completed' } },
        data: { status: 'completed', completedAt: new Date() }
      });
      if (result.count > 0) {
        console.log(`✅ ${taskId} marked complete`);
        markedCount++;
      }
    } catch (error: any) {
      // Task may not exist in database
    }
  }

  console.log(`\n✅ Marked ${markedCount} tasks as completed`);

  // Assign new tasks
  console.log(`\n\n✅ Step 2: Assigning new tasks to idle agents...\n`);

  let assignedCount = 0;
  for (const task of newTasks) {
    try {
      await assignTask(task);
      console.log(`✅ ${task.taskId}: ${task.title} → ${task.assignedTo} (${task.priority}, ${task.estimatedHours}h)`);
      assignedCount++;
    } catch (error: any) {
      if (error.message?.includes('Unique constraint')) {
        console.log(`⚠️  ${task.taskId}: Already exists`);
      } else {
        console.error(`❌ ${task.taskId}: ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Assigned ${assignedCount} new tasks`);

  // Log decision
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'all_agent_directions_updated',
    rationale: `Updated all agent directions based on comprehensive decision_log review. Marked ${markedCount} completed tasks. Assigned ${assignedCount} new tasks to idle agents. Currently working: inventory, qa-helper, specialagent001. Total agents with completions today: 16/18. Total tasks completed: 39.`,
    evidenceUrl: 'artifacts/manager/2025-10-24/all-agent-completions.txt',
    payload: {
      completedTasksMarked: markedCount,
      newTasksAssigned: assignedCount,
      currentlyWorking: currentlyWorking,
      agentsWithCompletions: 16,
      totalTasksCompleted: 39,
      idleAgents: ['content', 'engineer', 'devops', 'data', 'integrations', 'ai-knowledge', 'support', 'analytics', 'seo', 'ads', 'designer', 'pilot', 'ai-customer', 'qa', 'product']
    }
  });

  console.log(`\n✅ Decision logged\n`);

  await prisma.$disconnect();
}

updateDirections().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

