/**
 * Update CONTENT-KB-001 Task with CEO Approval Workflow
 * 
 * Changes task from "expand knowledge base" to "build CEO approval system"
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { logDecision } from "../../app/services/decisions.server";

const prisma = new PrismaClient();

async function updateTask() {
  console.log("📋 Updating CONTENT-KB-001 task with CEO approval workflow...\n");

  const newDescription = `Build knowledge base population system with CEO approval workflow.

CRITICAL: This is the BASE - must get it right the first time. NO data committed without CEO approval.

SCOPE (Customer Support Knowledge ONLY):
✅ Product information (descriptions, features, specs)
✅ Policies (shipping, returns, warranty, privacy, terms)
✅ Support procedures (tracking, returns, troubleshooting)
✅ FAQ (common questions, policy clarifications)
❌ Dev knowledge (separate system, project='dev_kb')

DATA SOURCES (3 sources):
1. hotrodan.com website scrape (policies, FAQ, products)
2. Chatwoot customer inquiries (after Chatwoot fixed, quality conversations only)
3. Manual curation (CEO-provided documents)

CEO APPROVAL WORKFLOW:
1. Scrape/extract data → staging (NO commits)
2. Generate preview document for CEO review
3. CEO marks each section: Approve / Reject / Edit
4. Commit ONLY CEO-approved content
5. All commits include CEO approval metadata

DELIVERABLES:
1. scripts/knowledge-base/scrape-hotrodan.ts (scrape to staging)
2. scripts/knowledge-base/generate-preview.ts (CEO review document)
3. scripts/knowledge-base/commit-approved.ts (commit approved only)
4. scripts/knowledge-base/extract-chatwoot.ts (quality conversations)
5. scripts/knowledge-base/generate-chatwoot-preview.ts (Q&A preview)
6. staging/ directory for preview files (gitignored)

QUALITY FILTERS (Chatwoot):
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
✅ CEO approval required for ALL content
✅ Audit trail (who approved, when, source)
✅ Rollback capability (versioning)
✅ Project isolation (occ vs dev_kb)

REFERENCE:
- Full plan: docs/specs/knowledge-base-population-plan.md
- CEO must approve plan before implementation begins`;

  const newAcceptanceCriteria = [
    'CEO approves knowledge-base-population-plan.md',
    'Staging system built (scrape to staging, NOT knowledge base)',
    'Preview generation working (CEO review documents)',
    'CEO approval workflow implemented (Approve/Reject/Edit)',
    'Commit script only commits approved content',
    'hotrodan.com scraper working (policies, FAQ, products)',
    'Chatwoot extractor working (quality conversations only)',
    'Quality filters implemented (HITL grades: tone ≥4.5, accuracy ≥4.7, policy ≥4.8)',
    'CEO preview generated for initial scrape',
    'CEO reviews and approves initial content',
    'Approved content committed to knowledge_base (project=occ)',
    'All commits include CEO approval metadata',
    'NO dev knowledge in customer KB (verified)',
    'Audit trail complete (who, when, source)',
    'Rollback tested (can revert if needed)',
    'Search tested with sample queries (relevance > 0.7)',
    'Documentation complete (how to use system)'
  ];

  // Update task
  await prisma.taskAssignment.update({
    where: { taskId: 'CONTENT-KB-001' },
    data: {
      title: 'Build Knowledge Base Population System with CEO Approval',
      description: newDescription,
      acceptanceCriteria: newAcceptanceCriteria,
      estimatedHours: 6, // Increased from 3h (more complex with approval workflow)
      allowedPaths: [
        'scripts/knowledge-base/**',
        'staging/**',
        'docs/specs/knowledge-base-population-plan.md',
        'app/services/knowledge/**',
        'tests/integration/knowledge-base/**'
      ]
    }
  });

  console.log("✅ Task updated in database");

  // Log decision
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'task_updated_ceo_approval',
    rationale: 'Updated CONTENT-KB-001 to include CEO approval workflow per CEO requirement. Knowledge base is the BASE - must get it right the first time. NO data committed without CEO approval. Staging-first approach with preview/approve/commit workflow.',
    evidenceUrl: 'docs/specs/knowledge-base-population-plan.md',
    payload: {
      taskId: 'CONTENT-KB-001',
      agent: 'content',
      oldTitle: 'Expand Knowledge Base Content',
      newTitle: 'Build Knowledge Base Population System with CEO Approval',
      estimatedHours: 6,
      criticalRequirement: 'CEO approval required before ANY data commit',
      dataSources: ['hotrodan.com scrape', 'Chatwoot quality conversations', 'Manual curation'],
      workflow: 'Scrape → Staging → Preview → CEO Approve → Commit',
      safetyMeasures: ['Staging-first', 'CEO approval', 'Audit trail', 'Rollback capability', 'Project isolation']
    }
  });

  console.log("✅ Decision logged");
  console.log("\n📋 Next Steps:");
  console.log("1. CEO reviews: docs/specs/knowledge-base-population-plan.md");
  console.log("2. CEO approves plan (or requests changes)");
  console.log("3. content agent: Query updated task from database");
  console.log("4. content agent: Build staging & preview system");
  console.log("5. content agent: Scrape hotrodan.com to staging");
  console.log("6. content agent: Generate CEO preview document");
  console.log("7. CEO: Review and approve preview");
  console.log("8. content agent: Commit ONLY approved content\n");

  await prisma.$disconnect();
}

updateTask().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

