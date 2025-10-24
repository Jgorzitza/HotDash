/**
 * Update specialagent001 Task Direction in Database
 * 
 * Move direction from markdown file to database (task.description)
 * All agents should get direction from DB, not markdown files
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { logDecision } from "../../app/services/decisions.server";

const prisma = new PrismaClient();

async function updateDirection() {
  console.log("📋 Updating specialagent001 task direction in database...\n");

  const direction = `Build single Fly.io app with multi-process architecture for production LLM infrastructure.

ARCHITECTURE:
- LiteLLM Gateway (OpenAI proxy) → https://gateway.hotrodan.com
- Langfuse UI (observability) → https://langfuse.hotrodan.com  
- Fly Redis (managed cache) → hotdash-llm-cache

CRITICAL RULES:
✅ Build infrastructure ONLY (DO NOT touch production agents)
✅ Regular dev team is building agents in parallel (this is expected and correct)
✅ Test with curl/admin_key (NOT production agent keys)
❌ DO NOT change OPENAI_BASE_URL for any agent
❌ DO NOT deploy agent changes

PHASES:
1. Setup (2-3h): Fly app, secrets, Supabase schema, Fly Redis
2. Build (4-5h): Dockerfile, scripts, LiteLLM config, fly.toml
3. Deploy (2-3h): Create app, set secrets, deploy, DNS/certs
4. Test (3-4h): Smoke, cache, quota, failover, Langfuse UI
5. Document (2-3h): Deployment, cutover, monitoring guides

MODELS (OpenAI-only):
- gpt-4o-mini (default, cheap)
- gpt-4o (fallback, expensive)
- text-embedding-3-large (semantic cache)

TEAM KEYS & QUOTAS:
- prod_customer_key: 100 rpm, 200K tpm, $50/day (ai-customer, support)
- prod_ceo_key: 60 rpm, 120K tpm, $25/day (ceo-insights, ai-knowledge)
- prod_background_key: 30 rpm, 60K tpm, $10/day (analytics, inventory, seo, ads, content)
- admin_key: 200 rpm, 500K tpm, $100/day (CEO testing, emergency)

DATABASE:
- Supabase same project, separate schema (langfuse.*)
- Direct connection (5432) for first boot (migrations)
- Pooled connection (6543) for runtime

CACHING:
- Exact cache: 1-day TTL (FREE, character-by-character)
- Semantic cache: 7-day TTL (~$0.00013/request, meaning-based)
- Expected hit rate: 30-50%
- Expected savings: $51/month

SECRETS (generate and store in vault):
- LITELLM_MASTER_KEY (32 chars)
- LANGFUSE_ENCRYPTION_KEY (base64, 32 bytes)
- LANGFUSE_NEXTAUTH_SECRET (base64, 32 bytes)
- Team keys (4 keys, 32 chars each)
- Langfuse admin: justin@hotrodan.com / HotRod@n2024!LLM

TESTING (all must pass):
1. Smoke test: 200 OK from gateway
2. Exact cache: 2nd request < 100ms
3. Semantic cache: Similar requests cached
4. Quota test: 429 on limit exceeded
5. Failover test: gpt-4o escalation on long inputs
6. Langfuse UI: Traces visible, costs shown

DOCUMENTATION (create):
1. fly/hotdash-llm-gateway/README.md (deployment guide)
2. docs/runbooks/llm-gateway-cutover.md (for regular dev team)
3. docs/runbooks/llm-gateway-monitoring.md (monitoring guide)
4. vault/hotrodan/llm-gateway-secrets.json (update with generated secrets)

REFERENCE DOCS:
- Full plan: docs/manager/LLM_GATEWAY_INFRASTRUCTURE_PLAN_2025-10-24.md
- Vault template: vault/hotrodan/llm-gateway-secrets.json
- Regular dev team instructions: docs/manager/REGULAR_DEV_TEAM_INSTRUCTIONS_2025-10-24.md

PROGRESS REPORTING:
- Log startup: logDecision() with action='startup_complete'
- Report progress every 2 hours: logDecision() with progressPct
- Log completion: logDecision() with status='completed'

HANDOFF:
- Infrastructure ready for Phase 2 cutover by regular dev team
- NO production agents touched
- Simple env var change (2 lines per agent group)`;

  // Update task in database
  await prisma.taskAssignment.update({
    where: { taskId: 'SPECIALAGENT001-INFRA-001' },
    data: { description: direction }
  });

  console.log("✅ Task description updated in database");

  // Log decision
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'task_direction_updated',
    rationale: 'Updated SPECIALAGENT001-INFRA-001 task with comprehensive direction in database. Removed reliance on markdown direction file. All direction now in task description per CEO requirement.',
    evidenceUrl: 'scripts/manager/update-specialagent001-direction.ts',
    payload: {
      taskId: 'SPECIALAGENT001-INFRA-001',
      agent: 'specialagent001',
      directionLocation: 'database (task.description)',
      markdownFile: 'docs/directions/specialagent001.md (deprecated, use DB instead)',
      directionLength: direction.length
    }
  });

  console.log("✅ Decision logged");
  console.log("\n📋 specialagent001 can now query task and get full direction from DB:");
  console.log("   npx tsx --env-file=.env scripts/agent/get-my-tasks.ts specialagent001\n");

  await prisma.$disconnect();
}

updateDirection().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

