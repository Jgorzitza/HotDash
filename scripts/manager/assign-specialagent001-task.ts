/**
 * Assign LLM Gateway Infrastructure Task to specialagent001
 * 
 * Single comprehensive task to build production LLM infrastructure
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const task = {
  assignedBy: 'manager',
  assignedTo: 'specialagent001',
  taskId: 'SPECIALAGENT001-INFRA-001',
  title: 'Build LLM Gateway Infrastructure (LiteLLM + Langfuse + Fly Redis)',
  description: `Build single Fly.io app with multi-process architecture:
  - LiteLLM Gateway (OpenAI proxy with caching, quotas, observability)
  - Langfuse UI (traces, costs, performance monitoring)
  - Fly Redis (managed cache for exact + semantic caching)
  
  Production-ready infrastructure for ai-customer, ceo-insights, and background agents.
  DO NOT touch production agents - only build infrastructure.`,
  acceptanceCriteria: [
    'Fly app deployed: hotdash-llm-gateway',
    'LiteLLM gateway accessible: https://gateway.hotrodan.com',
    'Langfuse UI accessible: https://langfuse.hotrodan.com',
    'Fly Redis operational: hotdash-llm-cache',
    'Supabase langfuse schema created and migrations complete',
    'All secrets generated and stored in vault',
    'Smoke test passes (200 OK from gateway)',
    'Exact cache working (2nd request < 100ms)',
    'Semantic cache working (similar requests cached)',
    'Quotas enforced (429 on limit exceeded)',
    'Failover working (gpt-4o escalation on long inputs)',
    'Langfuse UI shows traces, costs, cache hit rate',
    'Deployment guide complete (fly/hotdash-llm-gateway/README.md)',
    'Cutover guide complete (docs/runbooks/llm-gateway-cutover.md)',
    'Monitoring guide complete (docs/runbooks/llm-gateway-monitoring.md)',
    'Vault updated with all secrets (vault/hotrodan/llm-gateway-secrets.json)',
    'NO production agents touched (ai-customer, ceo-insights, etc.)',
    'Infrastructure ready for cutover by regular dev team'
  ],
  allowedPaths: [
    'fly/hotdash-llm-gateway/**',
    'vault/hotrodan/llm-gateway-secrets.json',
    'docs/runbooks/llm-gateway-*.md',
    'docs/directions/specialagent001.md',
    'feedback/specialagent001/**',
    'app/agents/config/agents.json'
  ],
  priority: 'P0' as const,
  estimatedHours: 15,
  dependencies: [],
  phase: 'LLM Infrastructure'
};

async function assignSpecialAgent001Task() {
  console.log("🚀 SPECIALAGENT001 - LLM INFRASTRUCTURE TASK");
  console.log("=".repeat(80));
  
  try {
    await assignTask(task);
    console.log(`✅ ${task.taskId}: ${task.title}`);
    console.log(`   Assigned to: ${task.assignedTo}`);
    console.log(`   Priority: ${task.priority}`);
    console.log(`   Estimated: ${task.estimatedHours} hours`);
    console.log(`   Phase: ${task.phase}`);
  } catch (error: any) {
    if (error.message?.includes('Unique constraint') || error.code === 'P2002') {
      console.log(`⚠️  ${task.taskId}: Already exists`);
    } else {
      console.error(`❌ ${task.taskId}: ${error.message}`);
      throw error;
    }
  }

  // Log to decision log
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'specialagent001_assigned',
    rationale: `Assigned LLM Gateway infrastructure task to new agent specialagent001. This is production infrastructure for ai-customer, ceo-insights, and background agents. Single Fly app with LiteLLM + Langfuse + Fly Redis. OpenAI-only. Estimated 15 hours. DO NOT touch production agents until infrastructure is ready.`,
    evidenceUrl: 'docs/directions/specialagent001.md',
    payload: {
      agent: 'specialagent001',
      taskId: 'SPECIALAGENT001-INFRA-001',
      estimatedHours: 15,
      priority: 'P0',
      phase: 'LLM Infrastructure',
      components: ['LiteLLM Gateway', 'Langfuse UI', 'Fly Redis'],
      domains: ['gateway.hotrodan.com', 'langfuse.hotrodan.com'],
      database: 'Supabase (langfuse schema)',
      models: ['gpt-4o-mini', 'gpt-4o', 'text-embedding-3-large'],
      team_keys: ['prod_customer', 'prod_ceo', 'prod_background', 'admin']
    }
  });

  console.log("\n✅ Task assigned and logged to database");
  console.log("\nNext Steps:");
  console.log("1. specialagent001: Query task via get-my-tasks.ts");
  console.log("2. specialagent001: Log startup via logDecision()");
  console.log("3. specialagent001: Follow direction in docs/directions/specialagent001.md");
  console.log("4. specialagent001: Report progress every 2 hours");
  console.log("5. Manager: Monitor progress via decision_log table");
  console.log("\nProduction agents: DO NOT TOUCH until infrastructure ready");

  await prisma.$disconnect();
}

assignSpecialAgent001Task().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

