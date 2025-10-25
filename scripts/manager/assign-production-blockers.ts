/**
 * Assign production blocker tasks to agents
 * DATABASE ONLY - No markdown files
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";

async function assignBlockers() {
  console.log("📋 Assigning Production Blocker Tasks...\n");

  // BLOCKER 1: LlamaIndex Index Population
  console.log("1. Assigning LlamaIndex index population...");
  await assignTask({
    assignedBy: "manager",
    assignedTo: "data",
    taskId: "BLOCKER-LLAMAINDEX-INDEX-001",
    title: "Populate LlamaIndex Knowledge Base Index",
    description: `CRITICAL BLOCKER: LlamaIndex index not populated. MCP query_support returns "No latest index found".

IMPACT: QA and AI-CUSTOMER agents blocked from completing end-to-end testing.

REQUIREMENTS:
1. Populate LlamaIndex index with support documentation
2. Include: shipping policies, returns, FAQs, product info
3. Verify MCP query_support returns results
4. Test with sample queries

COORDINATE WITH: DEVOPS (may need server restart)`,
    acceptanceCriteria: [
      "LlamaIndex index populated with support docs",
      "MCP query_support returns results (not 'No latest index found')",
      "Sample queries return relevant results",
      "QA agent can run end-to-end tests",
    ],
    allowedPaths: [
      "docs/support/**",
      "docs/faq/**",
      "scripts/data/**",
      "artifacts/data/**",
    ],
    priority: "P0",
    estimatedHours: 2,
  });

  // BLOCKER 2: DashboardFact Schema
  console.log("2. Assigning DashboardFact schema fix...");
  await assignTask({
    assignedBy: "manager",
    assignedTo: "data",
    taskId: "BLOCKER-DASHBOARDFACT-001",
    title: "Add DashboardFact Model to Prisma Schema",
    description: `CRITICAL BLOCKER: DashboardFact model referenced throughout codebase but doesn't exist in Prisma schema.

IMPACT: ANALYTICS services have temporary workarounds, not production-ready.

REQUIREMENTS:
1. Add DashboardFact model to prisma/schema.prisma
2. Create migration file
3. Test migration locally
4. Update ANALYTICS services to use real model
5. Remove temporary workarounds

FIELDS NEEDED (based on codebase usage):
- id, shop_domain, metric_name, metric_value, timestamp, metadata`,
    acceptanceCriteria: [
      "DashboardFact model exists in prisma/schema.prisma",
      "Migration created and tested",
      "ANALYTICS services use real model (no workarounds)",
      "All existing analytics queries work",
    ],
    allowedPaths: [
      "prisma/schema.prisma",
      "prisma/migrations/**",
      "app/services/analytics.server.ts",
      "app/services/google-analytics.server.ts",
    ],
    priority: "P0",
    estimatedHours: 3,
  });

  // BLOCKER 3: Langfuse Decision (Manager)
  console.log("3. Creating Langfuse decision task...");
  await assignTask({
    assignedBy: "manager",
    assignedTo: "manager",
    taskId: "BLOCKER-LANGFUSE-001",
    title: "Decide on Langfuse Backend Approach",
    description: `DECISION NEEDED: Langfuse OSS requires ClickHouse + MinIO + Redis.

IMPACT: SPECIALAGENT001 blocked on LLM Gateway infrastructure.

OPTIONS:
1. Fly-native: Deploy ClickHouse + MinIO on Fly.io
   - Pros: Full control, no external dependencies
   - Cons: More infrastructure to manage
   
2. Langfuse Cloud: Use managed Langfuse service
   - Pros: Zero infrastructure, fast setup
   - Cons: Monthly cost, less control
   
3. Hybrid: Managed ClickHouse/MinIO + Fly Redis
   - Pros: Balance of control and convenience
   - Cons: Multiple vendors

RECOMMENDATION: Option 2 (Langfuse Cloud) for launch, can migrate to self-hosted later.`,
    acceptanceCriteria: [
      "Decision made on Langfuse approach",
      "SPECIALAGENT001 notified of decision",
      "Implementation plan created",
    ],
    allowedPaths: ["docs/decisions/**", "artifacts/manager/**"],
    priority: "P1",
    estimatedHours: 1,
  });

  // VERIFICATION TASK: Image Search
  console.log("4. Assigning image search verification...");
  await assignTask({
    assignedBy: "manager",
    assignedTo: "manager",
    taskId: "VERIFY-IMAGE-SEARCH-001",
    title: "Verify Image Search Completion and Unblock Agents",
    description: `VERIFICATION NEEDED: ENGINEER reports ENG-IMAGE-SEARCH-003 100% complete.

BLOCKED AGENTS (waiting on this):
- ADS (ADS-IMAGE-SEARCH-001)
- INVENTORY (INVENTORY-IMAGE-SEARCH-001)
- SEO (SEO-IMAGE-SEARCH-001)

VERIFICATION STEPS:
1. Review ENG-IMAGE-SEARCH-003 completion evidence
2. Check all acceptance criteria met
3. Test image search functionality
4. Verify API endpoints work
5. Unblock 3 waiting agents

IF COMPLETE: Update task statuses, notify agents
IF NOT COMPLETE: Identify gaps, assign back to ENGINEER`,
    acceptanceCriteria: [
      "ENG-IMAGE-SEARCH-003 verified complete",
      "All acceptance criteria met",
      "Image search functionality tested",
      "3 blocked agents notified and unblocked",
    ],
    allowedPaths: [
      "artifacts/engineer/**",
      "artifacts/manager/**",
      "scripts/manager/**",
    ],
    priority: "P0",
    estimatedHours: 1,
  });

  // VERIFICATION TASK: MCP Evidence
  console.log("5. Assigning MCP evidence verification...");
  await assignTask({
    assignedBy: "manager",
    assignedTo: "manager",
    taskId: "VERIFY-MCP-EVIDENCE-001",
    title: "Verify DATA Security Audit MCP Evidence",
    description: `VERIFICATION NEEDED: DATA completed security audit redo with MCP tools.

CLAIMS:
- Created 6 JSONL evidence files
- Used Shopify Dev MCP and Context7 MCP
- Verified against current official docs (not training data)

VERIFICATION STEPS:
1. Check artifacts/data/2025-10-24/mcp/*.jsonl files exist
2. Verify 6 JSONL files as claimed
3. Review MCP tool usage (Shopify Dev, Context7)
4. Confirm MCP-first compliance
5. Close MCP violation tickets

FILES TO CHECK:
- artifacts/data/2025-10-24/mcp/SECURITY-AUDIT-FINAL-REPORT.md
- artifacts/data/2025-10-24/mcp/*.jsonl (6 files)`,
    acceptanceCriteria: [
      "6 JSONL evidence files verified to exist",
      "MCP tool usage confirmed (Shopify Dev, Context7)",
      "MCP-first compliance verified",
      "MCP violation tickets closed",
    ],
    allowedPaths: ["artifacts/data/**", "artifacts/manager/**"],
    priority: "P1",
    estimatedHours: 0.5,
  });

  console.log("\n✅ All blocker tasks assigned to database!\n");
  console.log("Tasks assigned:");
  console.log("  - DATA: 2 tasks (LlamaIndex index, DashboardFact schema)");
  console.log("  - MANAGER: 3 tasks (Langfuse decision, 2 verifications)");
  console.log("\nNo markdown files - all in database ✅\n");
}

assignBlockers().catch(console.error);

