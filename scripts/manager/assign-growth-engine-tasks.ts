/**
 * Assign Growth Engine Integration Tasks
 * 
 * Assigns 6 tasks to complete Growth Engine sub-agent integration
 * Based on findings in GROWTH_ENGINE_SUB_AGENTS_STATUS_2025-10-24.md
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tasks = [
  {
    assignedBy: 'manager',
    assignedTo: 'integrations',
    taskId: 'INTEGRATIONS-GE-001',
    title: 'Wire Accounts Sub-Agent to Agent SDK',
    description: 'Integrate existing AccountsSubAgent service into Agent SDK. Create Agent SDK agent that uses the service, add to handoff chain from Triage, configure OAuth and ABAC enforcement.',
    acceptanceCriteria: [
      'Agent SDK agent created using AccountsSubAgent service',
      'Added to handoff chain from Triage agent',
      'OAuth token handling configured',
      'ABAC enforcement enabled',
      'End-to-end test passing (Triage → Accounts flow)',
      'Customer Accounts MCP integration working',
      'PII redaction verified'
    ],
    allowedPaths: [
      'apps/agent-service/src/agents/**',
      'apps/agent-service/src/tools/**',
      'app/services/ai-customer/accounts-sub-agent.service.ts',
      'tests/integration/**'
    ],
    priority: 'P0' as const,
    estimatedHours: 5,
    dependencies: [],
    phase: 'Growth Engine Integration'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'integrations',
    taskId: 'INTEGRATIONS-GE-002',
    title: 'Wire Storefront Sub-Agent to Agent SDK',
    description: 'Integrate existing StorefrontSubAgent service into Agent SDK. Create Agent SDK agent that uses the service, add to handoff chain from Triage, configure Storefront MCP integration.',
    acceptanceCriteria: [
      'Agent SDK agent created using StorefrontSubAgent service',
      'Added to handoff chain from Triage agent',
      'Storefront MCP integration configured',
      'Product search working',
      'Availability checks working',
      'Policy queries working',
      'End-to-end test passing (Triage → Storefront flow)'
    ],
    allowedPaths: [
      'apps/agent-service/src/agents/**',
      'apps/agent-service/src/tools/**',
      'app/services/ai-customer/storefront-sub-agent.service.ts',
      'tests/integration/**'
    ],
    priority: 'P0' as const,
    estimatedHours: 5,
    dependencies: [],
    phase: 'Growth Engine Integration'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'devops',
    taskId: 'DEVOPS-GE-001',
    title: 'Deploy Background Specialist Agents',
    description: 'Deploy and schedule the 4 background specialist agents (Analytics, Inventory, Content/SEO/Perf, Risk). Create cron jobs, wire to Action Queue, enable monitoring.',
    acceptanceCriteria: [
      'Cron jobs created for all 4 agents',
      'Analytics agent runs daily',
      'Inventory agent runs hourly',
      'Content/SEO/Perf agent runs daily',
      'Risk agent runs continuously',
      'All agents emit to Action Queue',
      'Monitoring and logging enabled',
      'Health checks passing'
    ],
    allowedPaths: [
      'app/lib/growth-engine/**',
      'app/workers/**',
      'app/routes/api.growth-engine.**',
      'deploy/**',
      'fly.toml'
    ],
    priority: 'P0' as const,
    estimatedHours: 7,
    dependencies: [],
    phase: 'Growth Engine Deployment'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENGINEER-GE-001',
    title: 'Action Queue API Routes',
    description: 'Create API routes for Action Queue. Implement CRUD operations, filtering, sorting, pagination. Enable HITL approval workflow.',
    acceptanceCriteria: [
      'GET /api/action-queue - List actions',
      'GET /api/action-queue/:id - Get action details',
      'POST /api/action-queue/:id/approve - Approve action',
      'POST /api/action-queue/:id/reject - Reject action',
      'POST /api/action-queue/:id/edit - Edit action',
      'Filtering by priority, category, agent',
      'Sorting by expected impact, confidence',
      'Pagination working',
      'HITL approval workflow implemented'
    ],
    allowedPaths: [
      'app/routes/api.action-queue.**',
      'app/services/action-queue.**',
      'tests/integration/**'
    ],
    priority: 'P1' as const,
    estimatedHours: 5,
    dependencies: ['DEVOPS-GE-001'],
    phase: 'Growth Engine API'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'designer',
    taskId: 'DESIGNER-GE-002',
    title: 'Action Queue Dashboard UI',
    description: 'Design and implement Action Queue dashboard UI. Show top 10 actions ranked by impact, enable HITL approval workflow, follow Polaris design system.',
    acceptanceCriteria: [
      'Action Queue dashboard page created',
      'Top 10 actions displayed',
      'Ranked by Expected Revenue × Confidence × Ease',
      'Approve/Edit/Dismiss buttons working',
      'Action details modal implemented',
      'Evidence and rollback plans shown',
      'Freshness labels displayed',
      'Polaris design system followed'
    ],
    allowedPaths: [
      'app/routes/admin.action-queue.**',
      'app/components/action-queue/**',
      'tests/integration/**'
    ],
    priority: 'P1' as const,
    estimatedHours: 7,
    dependencies: ['ENGINEER-GE-001'],
    phase: 'Growth Engine UI'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'qa',
    taskId: 'QA-GE-001',
    title: 'Growth Engine End-to-End Testing',
    description: 'Test all Growth Engine flows end-to-end. Verify handoffs, background agents, Action Queue, and HITL workflow.',
    acceptanceCriteria: [
      'Triage → Accounts Sub-Agent flow tested',
      'Triage → Storefront Sub-Agent flow tested',
      'Analytics agent → Action Queue tested',
      'Inventory agent → Action Queue tested',
      'Content/SEO/Perf agent → Action Queue tested',
      'Risk agent → Action Queue tested',
      'HITL approval workflow tested',
      'Action execution tested',
      'All tests documented with evidence'
    ],
    allowedPaths: [
      'tests/integration/**',
      'tests/e2e/**',
      'docs/qa/**'
    ],
    priority: 'P2' as const,
    estimatedHours: 5,
    dependencies: ['INTEGRATIONS-GE-001', 'INTEGRATIONS-GE-002', 'DEVOPS-GE-001', 'ENGINEER-GE-001', 'DESIGNER-GE-002'],
    phase: 'Growth Engine Testing'
  }
];

async function assignGrowthEngineTasks() {
  console.log("🚀 GROWTH ENGINE INTEGRATION TASKS");
  console.log("=".repeat(80));
  console.log(`\n📋 Total tasks to assign: ${tasks.length}\n`);

  let successCount = 0;
  let existsCount = 0;
  let errorCount = 0;

  for (const task of tasks) {
    try {
      await assignTask(task);
      console.log(`✅ ${task.taskId}: ${task.title} → ${task.assignedTo} (${task.priority}, ${task.estimatedHours}h)`);
      successCount++;
    } catch (error: any) {
      if (error.message?.includes('Unique constraint') || error.code === 'P2002') {
        console.log(`⚠️  ${task.taskId}: Already exists`);
        existsCount++;
      } else {
        console.error(`❌ ${task.taskId}: ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log(`✅ Successfully assigned: ${successCount}`);
  console.log(`⚠️  Already existed: ${existsCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total: ${successCount + existsCount + errorCount}/${tasks.length}`);

  // Log to decision log
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'growth_engine_tasks_assigned',
    rationale: `Assigned ${successCount} Growth Engine integration tasks after discovering sub-agents are already implemented but not integrated. Total effort: 34 hours across 5 agents.`,
    evidenceUrl: 'docs/manager/GROWTH_ENGINE_SUB_AGENTS_STATUS_2025-10-24.md',
    payload: {
      tasksAssigned: successCount,
      tasksExisted: existsCount,
      tasksErrored: errorCount,
      totalTasks: tasks.length,
      totalHours: 34,
      agents: ['integrations', 'devops', 'engineer', 'designer', 'qa'],
      finding: 'Growth Engine sub-agents already implemented (8/8), need integration and deployment (6 tasks)'
    }
  });

  console.log("\n✅ Growth Engine tasks assigned and logged to database");

  await prisma.$disconnect();
}

assignGrowthEngineTasks().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

