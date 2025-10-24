/**
 * CEO Approval - Knowledge Base Population Plan
 * 
 * Updates task with CEO approval and expedites timeline
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { logDecision } from "../../app/services/decisions.server";

const prisma = new PrismaClient();

async function approvePlan() {
  console.log("✅ CEO APPROVED - Knowledge Base Population Plan\n");

  const description = `Build knowledge base population system with CEO approval workflow.

✅ CEO APPROVED (2025-10-24) - Implementation authorized, work expedited

CRITICAL: This is the BASE - must get it right the first time. NO data committed without CEO approval.

SCOPE (Customer Support Knowledge ONLY):
✅ Product information (descriptions, features, specs)
✅ Policies (shipping, returns, warranty, privacy, terms)
✅ Support procedures (tracking, returns, troubleshooting)
✅ FAQ (common questions, policy clarifications)
❌ Dev knowledge (separate system, project='dev_kb')

DATA SOURCES (3 sources - CEO approved):
1. hotrodan.com website scrape (policies, FAQ, products)
2. Chatwoot customer inquiries (after Chatwoot fixed, quality conversations only)
3. Manual curation (CEO-provided documents)

CEO APPROVAL WORKFLOW (CEO approved):
1. Scrape/extract data → staging (NO commits)
2. Generate preview document for CEO review
3. CEO marks each section: Approve / Reject / Edit (CEO ONLY - no delegation)
4. Commit ONLY CEO-approved content
5. All commits include CEO approval metadata

IMPLEMENTATION ORDER (work in order, no time constraints):
1. Build staging & preview system
2. Scrape hotrodan.com → staging
3. Generate CEO preview document
4. CEO reviews and approves
5. Commit approved content
6. Test with sample queries
7. (Later) Chatwoot extraction after Chatwoot fixed

DELIVERABLES:
1. scripts/knowledge-base/scrape-hotrodan.ts (scrape to staging)
2. scripts/knowledge-base/generate-preview.ts (CEO review document)
3. scripts/knowledge-base/commit-approved.ts (commit approved only)
4. scripts/knowledge-base/extract-chatwoot.ts (quality conversations)
5. scripts/knowledge-base/generate-chatwoot-preview.ts (Q&A preview)
6. staging/ directory for preview files (gitignored)

QUALITY FILTERS (Chatwoot - CEO approved):
- Only resolved conversations
- HITL grades: tone ≥4.5, accuracy ≥4.7, policy ≥4.8
- Customer satisfaction confirmed

DATABASE:
- Table: knowledge_base
- Project: 'occ' (customer support, NOT 'dev_kb')
- Metadata: CEO approval tracking (approved_by, approved_at, source)
- Versioning: Enabled (can rollback if needed)

SAFETY MEASURES:
✅ Staging-first (no direct commits)
✅ CEO approval required for ALL content (CEO ONLY)
✅ Audit trail (who approved, when, source)
✅ Rollback capability (versioning)
✅ Project isolation (occ vs dev_kb)

REFERENCE:
- Full plan: docs/specs/knowledge-base-population-plan.md (CEO APPROVED)
- CEO approval date: 2025-10-24`;

  // Update task
  await prisma.taskAssignment.update({
    where: { taskId: 'CONTENT-KB-001' },
    data: {
      priority: 'P1', // Upgrade from P2 to P1 (CEO approved, expedited)
      description
    }
  });

  console.log("✅ Task updated with CEO approval");
  console.log("✅ Priority upgraded: P2 → P1 (expedited)\n");

  // Log decision
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'ceo_approved_kb_plan',
    rationale: 'CEO approved knowledge base population plan. All 6 questions answered affirmatively. Timeline expedited - work in order, no time constraints. CEO is ONLY reviewer (no delegation). Implementation authorized immediately.',
    evidenceUrl: 'docs/specs/knowledge-base-population-plan.md',
    payload: {
      taskId: 'CONTENT-KB-001',
      agent: 'content',
      priority: 'P1',
      ceoApprovalDate: '2025-10-24',
      ceoApprovals: {
        scope: 'approved',
        sources: 'approved (sufficient for now)',
        workflow: 'approved',
        qualityFilters: 'approved',
        timeline: 'expedited (work in order, no time outline)',
        responsibility: 'CEO only (no delegation)'
      },
      status: 'APPROVED - Implementation authorized',
      nextStep: 'content agent can start immediately'
    }
  });

  console.log("✅ Decision logged\n");
  console.log("📋 content agent: Start immediately");
  console.log("   1. Build staging & preview system");
  console.log("   2. Scrape hotrodan.com");
  console.log("   3. Generate CEO preview");
  console.log("   4. Wait for CEO approval");
  console.log("   5. Commit approved content\n");

  await prisma.$disconnect();
}

approvePlan().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

