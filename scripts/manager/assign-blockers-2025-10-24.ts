/**
 * Assign Blockers - 2025-10-24
 * 
 * CEO approved blocker assignments
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const blockers = [
  {
    assignedBy: 'manager',
    assignedTo: 'content',
    taskId: 'BLOCKER-001',
    title: 'Populate LlamaIndex Knowledge Base',
    description: `Populate LlamaIndex knowledge base to unblock QA testing.

CEO APPROVED: 2025-10-24

BLOCKER: QA-AGENT-HANDOFFS-001 cannot complete testing - MCP query_support returns 'No latest index found'

ROOT CAUSE: Content agent built CEO approval system but hasn't populated KB yet.

IMPLEMENTATION ORDER (CEO approved, expedited):
1. Build staging & preview system (2h)
   - scripts/knowledge-base/scrape-hotrodan.ts
   - scripts/knowledge-base/generate-preview.ts
   - scripts/knowledge-base/commit-approved.ts

2. Scrape hotrodan.com to staging (1h)
   - Extract policies, FAQ, products
   - NO commits yet

3. Generate CEO preview document (1h)
   - Format for CEO review
   - Save to staging/ceo-review-YYYY-MM-DD.md

4. Wait for CEO approval (30min)
   - CEO marks: Approve / Reject / Edit
   - CEO saves approved preview

5. Commit approved content (1h)
   - Commit ONLY approved sections
   - Include CEO approval metadata
   - Test with sample queries

UNBLOCKS: QA agent (QA-AGENT-HANDOFFS-001)

REFERENCE: docs/specs/knowledge-base-population-plan.md (CEO APPROVED)`,
    acceptanceCriteria: [
      'Staging & preview system built',
      'hotrodan.com scraped to staging',
      'CEO preview document generated',
      'CEO reviews and approves preview',
      'Approved content committed to knowledge_base',
      'MCP query_support returns results (no longer "No latest index found")',
      'QA agent unblocked (can resume testing)',
      'All commits include CEO approval metadata'
    ],
    allowedPaths: [
      'scripts/knowledge-base/**',
      'staging/**',
      'app/services/knowledge/**',
      'tests/integration/knowledge-base/**'
    ],
    priority: 'P0' as const,
    estimatedHours: 6,
    dependencies: [],
    phase: 'Blocker Resolution'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'BLOCKER-002',
    title: 'Redo Security Audits with MCP Tools',
    description: `Redo security audits using MCP tools (governance violation fix).

CEO APPROVED: 2025-10-24

BLOCKER: SECURITY-AUDIT-001 and SECURITY-AUDIT-002 blocked by MCP_ENFORCEMENT_VIOLATION

ROOT CAUSE: DATA agent completed audits using training data instead of MCP tools. Violated docs/runbooks/CRITICAL_MCP_ENFORCEMENT.md.

CRITICAL: Must use MCP tools, not training data. Recommendations may be outdated (6-12 month old training data).

TASKS TO REDO:
1. SECURITY-AUDIT-001 (2-3h)
   - Use Shopify Dev MCP to verify current security best practices
   - Use Context7 MCP to find security patterns in codebase
   - Create MCP Evidence JSONL file
   - Verify recommendations against current docs (not training data)

2. SECURITY-AUDIT-002 (2-3h)
   - Use Context7 MCP to verify structured logger patterns
   - Check React Router 7 logging best practices via MCP
   - Create MCP Evidence JSONL file
   - Verify recommendations against current patterns

MCP EVIDENCE REQUIRED:
- artifacts/data/YYYY-MM-DD/mcp/security-audit-001.jsonl
- artifacts/data/YYYY-MM-DD/mcp/security-audit-002.jsonl

UNBLOCKS: DATA agent (2 tasks)

REFERENCE: docs/runbooks/CRITICAL_MCP_ENFORCEMENT.md`,
    acceptanceCriteria: [
      'SECURITY-AUDIT-001 redone using Shopify Dev MCP + Context7 MCP',
      'SECURITY-AUDIT-002 redone using Context7 MCP',
      'MCP Evidence JSONL files created for both audits',
      'Recommendations verified against current best practices (not training data)',
      'All security patterns verified in codebase via Context7 MCP',
      'Logging patterns verified against React Router 7 current docs',
      'MCP enforcement violation cleared',
      'DATA agent unblocked'
    ],
    allowedPaths: [
      'artifacts/data/**',
      'docs/security/**',
      'docs/runbooks/**'
    ],
    priority: 'P0' as const,
    estimatedHours: 5,
    dependencies: [],
    phase: 'Blocker Resolution'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'BLOCKER-003',
    title: 'Implement Image Search Infrastructure',
    description: `Implement image search infrastructure to unblock 3 agents.

CEO APPROVED: 2025-10-24

BLOCKER: Blocks ADS-IMAGE-SEARCH-001, SEO-IMAGE-SEARCH-001, INVENTORY-IMAGE-SEARCH-001

ROOT CAUSE: Engineer completed ENG-062 but hasn't started image search tasks yet.

TASKS TO IMPLEMENT:
1. ENG-IMAGE-SEARCH-001: Image Description Service (3h)
   - OpenAI Vision API integration
   - Generate alt text and descriptions
   - Store in database

2. ENG-IMAGE-SEARCH-002: Upload API + Worker (3h)
   - Upload endpoint
   - Background worker for processing
   - Embedding generation

3. ENG-IMAGE-SEARCH-003: Search API (2h)
   - Vector similarity search
   - Filtering and ranking
   - API endpoints

UNBLOCKS: 3 agents (ads, seo, inventory)

REFERENCE: docs/specs/image-search-simplified-implementation.md`,
    acceptanceCriteria: [
      'Image Description Service implemented (ENG-IMAGE-SEARCH-001)',
      'Upload API + Worker implemented (ENG-IMAGE-SEARCH-002)',
      'Search API implemented (ENG-IMAGE-SEARCH-003)',
      'All 3 tasks complete and tested',
      'ads agent unblocked (ADS-IMAGE-SEARCH-001)',
      'seo agent unblocked (SEO-IMAGE-SEARCH-001)',
      'inventory agent unblocked (INVENTORY-IMAGE-SEARCH-001)'
    ],
    allowedPaths: [
      'app/services/image-search/**',
      'app/routes/api.image-search.**',
      'app/workers/**',
      'tests/integration/image-search/**'
    ],
    priority: 'P0' as const,
    estimatedHours: 8,
    dependencies: [],
    phase: 'Blocker Resolution'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'BLOCKER-004',
    title: 'Fix Playwright Build Failures',
    description: `Fix Playwright build failures to unblock QA testing.

CEO APPROVED: 2025-10-24

BLOCKER: Blocks QA-004 (2 entries) and QA-UI-001

ROOT CAUSE: 
1. Duplicate key 'dev-kb:query' in package.json
2. Duplicate named exports in app/utils/analytics.ts

FIXES REQUIRED:
1. Fix package.json duplicate key (15min)
   - Remove duplicate 'dev-kb:query' entry
   - Verify package.json is valid JSON

2. Fix app/utils/analytics.ts duplicate exports (15min)
   - Remove duplicate named exports
   - Ensure single export per name

3. Verify Playwright build succeeds (15min)
   - Run Playwright webServer build
   - Verify no errors
   - Test with sample test

UNBLOCKS: QA agent (2 tasks)

REFERENCE: playwright.config.ts, tests/unit/ActionQueueCard.spec.tsx`,
    acceptanceCriteria: [
      'package.json duplicate key removed',
      'app/utils/analytics.ts duplicate exports removed',
      'Playwright webServer build succeeds',
      'No build errors',
      'Sample test runs successfully',
      'QA agent unblocked (QA-004, QA-UI-001)'
    ],
    allowedPaths: [
      'package.json',
      'app/utils/analytics.ts',
      'playwright.config.ts',
      'tests/**'
    ],
    priority: 'P1' as const,
    estimatedHours: 1,
    dependencies: ['BLOCKER-003'],
    phase: 'Blocker Resolution'
  },
  {
    assignedBy: 'manager',
    assignedTo: 'devops',
    taskId: 'BLOCKER-005',
    title: 'Set KB Tool Environment Variables',
    description: `Set KB tool environment variables to unblock QA-HELPER.

CEO APPROVED: 2025-10-24

BLOCKER: Blocks QA-001 (QA-HELPER)

ROOT CAUSE: SUPABASE_DEV_KB_DIRECT_URL and OPENAI_API_KEY not set

FIXES REQUIRED:
1. Set SUPABASE_DEV_KB_DIRECT_URL from vault (5min)
   - Get from vault/occ/supabase/
   - Set in .env or environment

2. Set OPENAI_API_KEY from vault (5min)
   - Get from vault/occ/openai/
   - Set in .env or environment

3. Verify KB search works (5min)
   - Run scripts/dev-kb/query.ts
   - Verify no "env missing" errors

UNBLOCKS: QA-HELPER (QA-001)

REFERENCE: scripts/dev-kb/query.ts`,
    acceptanceCriteria: [
      'SUPABASE_DEV_KB_DIRECT_URL set from vault',
      'OPENAI_API_KEY set from vault',
      'scripts/dev-kb/query.ts runs without env errors',
      'KB search returns results',
      'QA-HELPER unblocked (QA-001)'
    ],
    allowedPaths: [
      '.env',
      '.env.local',
      'scripts/dev-kb/**'
    ],
    priority: 'P2' as const,
    estimatedHours: 0.25,
    dependencies: [],
    phase: 'Blocker Resolution'
  }
];

async function assignBlockers() {
  console.log("🚨 ASSIGNING BLOCKERS - CEO APPROVED\n");
  console.log("=".repeat(80));

  let successCount = 0;
  let existsCount = 0;
  let errorCount = 0;

  for (const blocker of blockers) {
    try {
      await assignTask(blocker);
      console.log(`✅ ${blocker.taskId}: ${blocker.title} → ${blocker.assignedTo} (${blocker.priority}, ${blocker.estimatedHours}h)`);
      successCount++;
    } catch (error: any) {
      if (error.message?.includes('Unique constraint') || error.code === 'P2002') {
        console.log(`⚠️  ${blocker.taskId}: Already exists`);
        existsCount++;
      } else {
        console.error(`❌ ${blocker.taskId}: ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log(`✅ Successfully assigned: ${successCount}`);
  console.log(`⚠️  Already existed: ${existsCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total: ${successCount + existsCount + errorCount}/${blockers.length}`);

  // Log to decision log
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'blockers_assigned_ceo_approved',
    rationale: `Assigned ${successCount} blockers per CEO approval. Total: 5 blockers, 14.25 hours, unblocks 8 agents and 11 tasks. Critical path: 8-10 hours (parallel execution).`,
    evidenceUrl: 'artifacts/manager/2025-10-24/blockers-for-ceo.md',
    payload: {
      blockersAssigned: successCount,
      blockersExisted: existsCount,
      blockersErrored: errorCount,
      totalBlockers: blockers.length,
      totalHours: 14.25,
      agentsUnblocked: 8,
      tasksUnblocked: 11,
      criticalPath: '8-10 hours (parallel)',
      assignments: {
        content: 'BLOCKER-001 (Populate KB, 6h, P0)',
        data: 'BLOCKER-002 (Redo audits with MCP, 5h, P0)',
        engineer: 'BLOCKER-003 + BLOCKER-004 (Image search + build fixes, 9h, P0+P1)',
        devops: 'BLOCKER-005 (Set env vars, 0.25h, P2)'
      }
    }
  });

  console.log("\n✅ Blockers assigned and logged to database");
  console.log("\n📋 Next Steps:");
  console.log("1. content: Query BLOCKER-001 and start immediately");
  console.log("2. data: Query BLOCKER-002 and start immediately");
  console.log("3. engineer: Query BLOCKER-003 and BLOCKER-004, start immediately");
  console.log("4. devops: Query BLOCKER-005 and start immediately");
  console.log("5. Manager: Proceed to Step 6 (assign remaining work to other agents - NO IDLE)\n");

  await prisma.$disconnect();
}

assignBlockers().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

