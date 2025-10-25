/**
 * Assign tasks to resolve all blockers
 * Usage: npx tsx --env-file=.env scripts/manager/assign-blocker-resolutions.ts
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";

async function assignBlockerResolutions() {
  console.log("🚨 Assigning tasks to resolve all blockers...\n");

  const assignments = [
    // 1. ENGINEER - Fix build failures (ALREADY ASSIGNED - ENG-BUILD-FIX-001)
    // This will unblock: QA (2 tasks), QA-HELPER (1 task)
    
    // 2. DEVOPS - Fix staging 502 (NEEDS ASSIGNMENT)
    {
      assignedBy: "manager",
      assignedTo: "devops",
      taskId: "DEVOPS-STAGING-FIX-001",
      title: "Fix Staging Environment 502 Errors",
      description: `Fix staging environment returning 502 Bad Gateway errors.

BLOCKER: PILOT-USER-TESTING-001 cannot proceed
URL: https://hotdash-staging.fly.dev
ERROR: 502 Bad Gateway (27.3s response time)

Investigation Steps:
1. Check Fly.io logs: fly logs -a hotdash-staging
2. Check machine status: fly status -a hotdash-staging
3. Check health endpoint: curl https://hotdash-staging.fly.dev/health
4. Check resource usage: fly vm status -a hotdash-staging
5. Review recent deployments

Common Causes:
- Machine crashed or out of memory
- Health check failing
- Build/deployment issue
- Database connection issue
- Environment variables missing

MCP Requirements:
- Use Context7 MCP to verify Fly.io deployment patterns
- Create MCP Evidence JSONL: artifacts/devops/$(date +%Y-%m-%d)/mcp/DEVOPS-STAGING-FIX-001.jsonl

Unblocks: PILOT-USER-TESTING-001`,
      acceptanceCriteria: [
        "Staging environment returns 200 OK",
        "No 502 errors",
        "Response time < 3 seconds",
        "Health endpoint accessible",
        "PILOT unblocked for user testing",
        "Root cause documented",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: ["fly/**", "docs/devops/**", "artifacts/devops/**"],
      priority: "P0" as const,
      estimatedHours: 1
    },

    // 3. DEVOPS - Set KB environment variables
    {
      assignedBy: "manager",
      assignedTo: "devops",
      taskId: "DEVOPS-KB-ENV-001",
      title: "Set KB Tool Environment Variables",
      description: `Set missing environment variables for KB tool.

BLOCKER: QA-HELPER (QA-001) cannot use KB search
MISSING: SUPABASE_DEV_KB_DIRECT_URL and OPENAI_API_KEY

Steps:
1. Get SUPABASE_DEV_KB_DIRECT_URL from Supabase dashboard
2. Get OPENAI_API_KEY from OpenAI dashboard (or use existing)
3. Set in .env.local for local development
4. Set in Fly secrets for production: fly secrets set KEY=value
5. Verify KB search works: npx tsx scripts/dev-kb/query.ts "test query"

MCP Requirements:
- Use Context7 MCP to verify environment variable patterns
- Create MCP Evidence JSONL: artifacts/devops/$(date +%Y-%m-%d)/mcp/DEVOPS-KB-ENV-001.jsonl

Unblocks: QA-HELPER (QA-001)`,
      acceptanceCriteria: [
        "SUPABASE_DEV_KB_DIRECT_URL set in .env.local",
        "OPENAI_API_KEY set in .env.local",
        "Environment variables set in Fly secrets",
        "KB search test query succeeds",
        "QA-HELPER unblocked",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: [".env.local", "fly/**", "docs/devops/**", "artifacts/devops/**"],
      priority: "P0" as const,
      estimatedHours: 0.5
    },

    // 4. AI-KNOWLEDGE - Populate LlamaIndex KB index
    {
      assignedBy: "manager",
      assignedTo: "ai-knowledge",
      taskId: "AI-KB-POPULATE-INDEX-001",
      title: "Populate LlamaIndex Knowledge Base Index",
      description: `Populate LlamaIndex KB index to unblock QA testing.

BLOCKER: QA (QA-AGENT-HANDOFFS-001) cannot test
ERROR: MCP query_support tool returns 'No latest index found'

Steps:
1. Review existing KB content in docs/
2. Run KB indexing script (if exists) or create one
3. Verify index is created and accessible
4. Test MCP query_support tool returns results
5. Document indexing process

MCP Requirements:
- Use Context7 MCP to verify LlamaIndex indexing patterns
- Create MCP Evidence JSONL: artifacts/ai-knowledge/$(date +%Y-%m-%d)/mcp/AI-KB-POPULATE-INDEX-001.jsonl

Unblocks: QA (QA-AGENT-HANDOFFS-001), AI-CUSTOMER (AI-CUSTOMER-HANDOFF-001)`,
      acceptanceCriteria: [
        "LlamaIndex index populated with docs",
        "MCP query_support tool returns results",
        "Index accessible via MCP server",
        "QA and AI-CUSTOMER unblocked",
        "Indexing process documented",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: ["scripts/dev-kb/**", "app/services/knowledge/**", "artifacts/ai-knowledge/**", "docs/**"],
      priority: "P0" as const,
      estimatedHours: 2
    },

    // 5. ENGINEER - Image search infrastructure
    {
      assignedBy: "manager",
      assignedTo: "engineer",
      taskId: "ENG-IMAGE-SEARCH-003",
      title: "Implement Image Search Infrastructure",
      description: `Implement base image search infrastructure.

BLOCKERS: ADS, SEO, INVENTORY (3 tasks blocked)
SPEC: docs/specs/image-search-simplified-implementation.md

Requirements:
1. Image search API endpoint
2. Embedding service integration
3. Vector similarity search
4. Image upload and processing
5. Search results ranking

MCP Requirements:
- Use Context7 MCP to verify image search patterns
- Use Shopify Dev MCP for Shopify image handling
- Create MCP Evidence JSONL: artifacts/engineer/$(date +%Y-%m-%d)/mcp/ENG-IMAGE-SEARCH-003.jsonl

Unblocks: ADS-IMAGE-SEARCH-001, SEO-IMAGE-SEARCH-001, INVENTORY-IMAGE-SEARCH-001`,
      acceptanceCriteria: [
        "Image search API endpoint implemented",
        "Embedding service integrated",
        "Vector search working",
        "Image upload functional",
        "Search results ranked by relevance",
        "Tests pass",
        "ADS, SEO, INVENTORY unblocked",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: ["app/routes/api.image-search.**", "app/services/image-search/**", "tests/**", "artifacts/engineer/**"],
      priority: "P1" as const,
      estimatedHours: 4
    },

    // 6. ENGINEER - Fix AccountsSubAgent module-scope init
    {
      assignedBy: "manager",
      assignedTo: "engineer",
      taskId: "ENG-ACCOUNTS-INIT-FIX-001",
      title: "Fix AccountsSubAgent Module-Scope Supabase Init",
      description: `Fix module-scope Supabase initialization in accounts.ts.

BLOCKER: QA (QA-AGENT-HANDOFFS-001) testing blocked
ISSUE: Module-scope Supabase init at accounts.ts:16 blocks testing

Problem:
Module-scope initialization runs when file is imported, making it hard to mock/test.

Solution:
Move Supabase client initialization to function scope or use dependency injection.

MCP Requirements:
- Use Context7 MCP to verify Supabase initialization patterns
- Create MCP Evidence JSONL: artifacts/engineer/$(date +%Y-%m-%d)/mcp/ENG-ACCOUNTS-INIT-FIX-001.jsonl

Unblocks: QA (QA-AGENT-HANDOFFS-001)`,
      acceptanceCriteria: [
        "Supabase init moved from module scope",
        "Accounts service testable",
        "Existing functionality unchanged",
        "Tests pass",
        "QA unblocked",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: ["app/services/accounts.ts", "tests/**", "artifacts/engineer/**"],
      priority: "P1" as const,
      estimatedHours: 1
    },

    // 7. DEVOPS - Add tsx to devDependencies
    {
      assignedBy: "manager",
      assignedTo: "devops",
      taskId: "DEVOPS-TSX-DEPENDENCY-001",
      title: "Add tsx to devDependencies",
      description: `Add tsx to package.json devDependencies to fix offline usage.

BLOCKER: QA-HELPER (QA-001) cannot run tests offline
ERROR: npm EAI_AGAIN fetching 'tsx'

Solution:
Add tsx to devDependencies so it's installed with npm install.

Steps:
1. Add tsx to package.json devDependencies
2. Run npm install
3. Verify tsx available: npx tsx --version
4. Test offline usage

MCP Requirements:
- Use Context7 MCP to verify package.json patterns
- Create MCP Evidence JSONL: artifacts/devops/$(date +%Y-%m-%d)/mcp/DEVOPS-TSX-DEPENDENCY-001.jsonl

Unblocks: QA-HELPER (QA-001)`,
      acceptanceCriteria: [
        "tsx added to package.json devDependencies",
        "npm install completes successfully",
        "tsx available offline",
        "QA-HELPER unblocked",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: ["package.json", "artifacts/devops/**"],
      priority: "P1" as const,
      estimatedHours: 0.25
    },

    // 8. MANAGER - Coordinate INTEGRATIONS sub-agent wiring
    {
      assignedBy: "manager",
      assignedTo: "manager",
      taskId: "MANAGER-INTEGRATIONS-COORD-001",
      title: "Coordinate INTEGRATIONS Sub-Agent Wiring",
      description: `Provide guidance to INTEGRATIONS on sub-agent wiring.

BLOCKER: INTEGRATIONS (INTEGRATIONS-GE-001) needs coordination
ISSUE: Task complexity requires Manager guidance

Guidance Needed:
1. Priority order for P0 tasks (AccountsSubAgent vs StorefrontSubAgent)
2. Coordination with Engineer (who owns apps/agent-service)
3. Testing strategy for end-to-end flows
4. OAuth/ABAC configuration approach

Decision:
1. Priority: AccountsSubAgent first (P0), then StorefrontSubAgent (P1)
2. Coordination: INTEGRATIONS owns Agent SDK wrappers, ENGINEER owns base services
3. Testing: Use QA framework once QA-AGENT-HANDOFFS-001 completes
4. OAuth/ABAC: Follow existing patterns in apps/agent-service

Unblocks: INTEGRATIONS (INTEGRATIONS-GE-001)`,
      acceptanceCriteria: [
        "Priority order clarified",
        "Coordination plan documented",
        "Testing strategy defined",
        "OAuth/ABAC approach specified",
        "INTEGRATIONS unblocked"
      ],
      allowedPaths: ["docs/manager/**", "artifacts/manager/**"],
      priority: "P0" as const,
      estimatedHours: 0.5
    },

    // 9. MANAGER - Decide on Langfuse deployment path
    {
      assignedBy: "manager",
      assignedTo: "manager",
      taskId: "MANAGER-LANGFUSE-DECISION-001",
      title: "Decide Langfuse Deployment Path",
      description: `Make decision on Langfuse deployment approach.

BLOCKER: SPECIALAGENT001 (SPECIALAGENT001-INFRA-001) needs decision
ISSUE: Langfuse OSS requires ClickHouse + MinIO + Redis + Postgres

Options:
1. Full OSS deployment (ClickHouse + MinIO + Redis + Postgres on Fly)
2. Langfuse Cloud (managed service, simpler)
3. Defer LLM Gateway until post-launch

Decision Factors:
- Launch timeline (2-4 days to production)
- Infrastructure complexity
- Cost
- Maintenance burden

Recommendation: Option 3 - Defer until post-launch
- Focus on core features for launch
- LLM Gateway is nice-to-have, not critical
- Can deploy after launch with proper planning

Unblocks: SPECIALAGENT001 (SPECIALAGENT001-INFRA-001)`,
      acceptanceCriteria: [
        "Deployment path decided",
        "Decision documented with rationale",
        "SPECIALAGENT001 notified",
        "Timeline impact assessed"
      ],
      allowedPaths: ["docs/manager/**", "artifacts/manager/**"],
      priority: "P1" as const,
      estimatedHours: 0.5
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const assignment of assignments) {
    try {
      console.log(`\n📝 Assigning ${assignment.taskId} to ${assignment.assignedTo.toUpperCase()}...`);
      const task = await assignTask(assignment);
      console.log(`   ✅ Success! Task ID: ${task.id}, Status: ${task.status}`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      errorCount++;
    }
  }

  console.log(`\n\n📊 Blocker Resolution Assignment Summary:`);
  console.log(`   Total tasks: ${assignments.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  
  if (successCount === assignments.length) {
    console.log(`\n✅ ALL BLOCKER RESOLUTIONS ASSIGNED!\n`);
  } else {
    console.log(`\n⚠️  Some assignments failed. Review errors above.\n`);
  }
}

assignBlockerResolutions().catch(console.error);

