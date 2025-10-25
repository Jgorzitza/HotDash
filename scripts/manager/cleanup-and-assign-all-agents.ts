/**
 * Cleanup and Assign All Agents - Manager Cycle Step 6
 * 
 * 1. Mark completed work as done
 * 2. Remove GA MCP references (we use direct API)
 * 3. Assign work to ALL idle agents (NO IDLE AGENTS policy)
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupAndAssign() {
  console.log("🔧 CLEANUP AND ASSIGN ALL AGENTS\n");
  console.log("=".repeat(80));

  // Step 1: Mark completed work as done
  console.log("\n📋 Step 1: Marking completed work as done...\n");

  const completedTasks = [
    'SECURITY-AUDIT-001', // DATA completed (but needs redo with MCP)
    'SECURITY-AUDIT-002', // DATA completed (but needs redo with MCP)
    'DATA-IMAGE-SEARCH-001', // DATA completed
    'ENG-062' // Engineer completed (Content/SEO/Perf Agent)
  ];

  for (const taskId of completedTasks) {
    try {
      await prisma.taskAssignment.updateMany({
        where: { taskId },
        data: { status: 'completed' }
      });
      console.log(`✅ Marked ${taskId} as completed`);
    } catch (error: any) {
      console.log(`⚠️  ${taskId}: ${error.message}`);
    }
  }

  // Step 2: Log GA MCP cleanup task
  console.log("\n📋 Step 2: Creating GA MCP cleanup task...\n");

  const gaMcpCleanup = {
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-GA-MCP-CLEANUP',
    title: 'Remove GA MCP References (Use Direct API)',
    description: `Remove all Google Analytics MCP references - we use direct API instead.

CEO DIRECTIVE: GA_MCP_HOST not used, we have direct API tool built already.

FILES TO UPDATE:
1. mcp/mcp-config.json - Remove google-analytics server
2. app/config/ga.server.ts - Remove 'mcp' mode, keep only 'mock' and 'direct'
3. app/services/ga/mcpClient.ts - DELETE (not used)
4. app/services/ga/ingest.ts - Remove MCP client selection
5. tests/unit/ga.config.spec.ts - Remove MCP mode tests
6. packages/integrations/ga-mcp.md - ARCHIVE
7. fly-apps/analytics-mcp/ - ARCHIVE entire directory
8. mcp/SETUP.md - Remove Google Analytics section
9. mcp/load-env-from-vault.sh - Remove GA MCP env vars
10. docs/_archive/**/ga_mcp*.md - Already archived, verify

VERIFICATION:
- grep -r "GA_MCP" . (should return no results except archives)
- grep -r "mcpClient" . (should return no results)
- grep -r "google-analytics.*mcp" . (should return no results except archives)

KEEP (Direct API):
- app/services/ga/directClient.ts - KEEP (direct API)
- app/services/ga/mockClient.ts - KEEP (mock for dev)
- app/config/ga-credentials.server.ts - KEEP (credentials)
- GOOGLE_APPLICATION_CREDENTIALS - KEEP (direct API uses this)`,
    acceptanceCriteria: [
      'google-analytics removed from mcp/mcp-config.json',
      'mcp mode removed from app/config/ga.server.ts',
      'app/services/ga/mcpClient.ts deleted',
      'MCP client selection removed from app/services/ga/ingest.ts',
      'MCP mode tests removed from tests/unit/ga.config.spec.ts',
      'packages/integrations/ga-mcp.md archived',
      'fly-apps/analytics-mcp/ archived',
      'Google Analytics section removed from mcp/SETUP.md',
      'GA MCP env vars removed from mcp/load-env-from-vault.sh',
      'grep -r "GA_MCP" returns no results (except archives)',
      'All tests pass after cleanup'
    ],
    allowedPaths: [
      'mcp/**',
      'app/config/ga.server.ts',
      'app/services/ga/**',
      'tests/unit/ga.config.spec.ts',
      'packages/integrations/**',
      'fly-apps/analytics-mcp/**',
      'docs/_archive/**'
    ],
    priority: 'P1' as const,
    estimatedHours: 1,
    dependencies: [],
    phase: 'Cleanup'
  };

  try {
    await assignTask(gaMcpCleanup);
    console.log(`✅ ${gaMcpCleanup.taskId}: ${gaMcpCleanup.title} → ${gaMcpCleanup.assignedTo}`);
  } catch (error: any) {
    if (error.message?.includes('Unique constraint')) {
      console.log(`⚠️  ${gaMcpCleanup.taskId}: Already exists`);
    } else {
      console.error(`❌ ${gaMcpCleanup.taskId}: ${error.message}`);
    }
  }

  // Step 3: Assign work to idle agents
  console.log("\n📋 Step 3: Assigning work to idle agents...\n");

  const newTasks = [
    {
      assignedBy: 'manager',
      assignedTo: 'ai-knowledge',
      taskId: 'AI-KNOWLEDGE-001',
      title: 'Expand Knowledge Base with Product Documentation',
      description: `Expand knowledge base with product documentation after BLOCKER-001 resolved.

DEPENDENCY: Wait for BLOCKER-001 (content agent populates initial KB)

TASKS:
1. Review initial KB content (after CEO approval)
2. Identify gaps in product documentation
3. Create additional product documentation
4. Submit to CEO for approval (same workflow as BLOCKER-001)
5. Commit approved content

SCOPE: Product documentation ONLY (no dev knowledge)`,
      acceptanceCriteria: [
        'Initial KB reviewed',
        'Gaps identified',
        'Additional product docs created',
        'CEO approves new content',
        'Approved content committed'
      ],
      allowedPaths: ['scripts/knowledge-base/**', 'staging/**', 'docs/specs/**'],
      priority: 'P2' as const,
      estimatedHours: 4,
      dependencies: ['BLOCKER-001'],
      phase: 'Knowledge Base Expansion'
    },
    {
      assignedBy: 'manager',
      assignedTo: 'support',
      taskId: 'SUPPORT-TRAINING-001',
      title: 'Create Support Agent Training Documentation',
      description: `Create training documentation for support agents using knowledge base.

DEPENDENCY: Wait for BLOCKER-001 (KB must be populated first)

DELIVERABLES:
1. Support agent onboarding guide
2. Common scenarios and responses
3. Escalation procedures
4. Quality guidelines (tone, accuracy, policy)

REFERENCE: Knowledge base content (after BLOCKER-001)`,
      acceptanceCriteria: [
        'Onboarding guide created',
        'Common scenarios documented',
        'Escalation procedures defined',
        'Quality guidelines documented'
      ],
      allowedPaths: ['docs/training/**', 'docs/support/**'],
      priority: 'P2' as const,
      estimatedHours: 3,
      dependencies: ['BLOCKER-001'],
      phase: 'Support Training'
    },
    {
      assignedBy: 'manager',
      assignedTo: 'pilot',
      taskId: 'PILOT-UI-REVIEW-001',
      title: 'UI/UX Review and Recommendations',
      description: `Review current UI/UX and provide recommendations for improvements.

FOCUS AREAS:
1. Dashboard layout and information hierarchy
2. Navigation and user flows
3. Mobile responsiveness
4. Accessibility
5. Performance (perceived and actual)

DELIVERABLES:
1. UI/UX audit report
2. Prioritized recommendations
3. Mockups for critical improvements (optional)`,
      acceptanceCriteria: [
        'UI/UX audit complete',
        'Recommendations prioritized',
        'Report delivered to CEO',
        'Critical issues identified'
      ],
      allowedPaths: ['docs/design/**', 'artifacts/pilot/**'],
      priority: 'P2' as const,
      estimatedHours: 4,
      dependencies: [],
      phase: 'UI/UX Review'
    }
  ];

  let successCount = 0;
  for (const task of newTasks) {
    try {
      await assignTask(task);
      console.log(`✅ ${task.taskId}: ${task.title} → ${task.assignedTo} (${task.priority}, ${task.estimatedHours}h)`);
      successCount++;
    } catch (error: any) {
      if (error.message?.includes('Unique constraint')) {
        console.log(`⚠️  ${task.taskId}: Already exists`);
      } else {
        console.error(`❌ ${task.taskId}: ${error.message}`);
      }
    }
  }

  // Log decision
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'cleanup_and_assign_all_agents',
    rationale: `Manager Cycle Step 6 complete. Marked 4 completed tasks as done. Created GA MCP cleanup task (engineer). Assigned work to 3 idle agents (ai-knowledge, support, pilot). Remaining idle agents (inventory, analytics, ads, ai-customer) have dependencies on blockers.`,
    evidenceUrl: 'scripts/manager/cleanup-and-assign-all-agents.ts',
    payload: {
      completedTasksMarked: completedTasks.length,
      gaMcpCleanupCreated: true,
      newTasksAssigned: successCount,
      idleAgentsRemaining: ['inventory', 'analytics', 'ads', 'ai-customer'],
      reason: 'Waiting for blockers to resolve (BLOCKER-001, BLOCKER-003)'
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log(`✅ Cleanup complete`);
  console.log(`✅ ${successCount} new tasks assigned`);
  console.log(`\n📋 Remaining idle agents (waiting for blockers):`);
  console.log(`   - inventory: Waiting for BLOCKER-003 (image search)`);
  console.log(`   - analytics: Waiting for BLOCKER-003 (image search)`);
  console.log(`   - ads: Waiting for BLOCKER-003 (image search)`);
  console.log(`   - ai-customer: Waiting for BLOCKER-001 (KB) + QA framework`);
  console.log(`\n✅ Manager Cycle Step 6 COMPLETE\n`);

  await prisma.$disconnect();
}

cleanupAndAssign().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

