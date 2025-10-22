import { PrismaClient } from '@prisma/client';
import { assignTask } from '../../app/services/tasks.server';

const prisma = new PrismaClient();

type T = {
  assignedTo: string;
  taskId: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  allowedPaths: string[];
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  estimatedHours?: number;
  dependencies?: string[];
};

async function ensure(task: T) {
  try {
    await assignTask({ assignedBy: 'manager', ...task });
    console.log(`➕ ${task.taskId}`);
  } catch (e: any) {
    if (e?.code === 'P2002' || /Unique constraint/.test(String(e?.message))) {
      console.log(`↷ exists ${task.taskId}`);
      return;
    }
    console.error(`✖ ${task.taskId}:`, e?.message || e);
  }
}

async function main() {
  const tasks: T[] = [
    // ENGINEER — Phase 6 (from archive plan)
    { assignedTo: 'engineer', taskId: 'ENG-014', title: 'Drag & Drop Tile Reorder', description: '@dnd-kit integration for dashboard tiles', acceptanceCriteria: ['Tiles reorder via drag handle', 'Order persists'], allowedPaths: ['app/**'], priority: 'P1', estimatedHours: 3, dependencies: [] },
    { assignedTo: 'engineer', taskId: 'ENG-015', title: 'Tile Visibility Toggles', description: 'Settings to show/hide tiles', acceptanceCriteria: ['Visibility saved to DB', 'Dashboard respects settings'], allowedPaths: ['app/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'engineer', taskId: 'ENG-016', title: 'Theme Selector (Light/Dark/Auto)', description: 'Appearance settings and theme switch', acceptanceCriteria: ['Toggle applies theme', 'Persisted per user'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'engineer', taskId: 'ENG-017', title: 'Default View Persistence', description: 'Grid/List default view stored', acceptanceCriteria: ['Saved in DB', 'Applied on load'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 1 },
    { assignedTo: 'engineer', taskId: 'ENG-018', title: 'Settings Page — Dashboard Tab', description: 'Dashboard settings tab', acceptanceCriteria: ['Form submit saves settings'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 0.5 },
    { assignedTo: 'engineer', taskId: 'ENG-019', title: 'Settings Page — Appearance Tab', description: 'Appearance tab with theme toggle', acceptanceCriteria: ['Theme toggle wired'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 0.5 },
    { assignedTo: 'engineer', taskId: 'ENG-020', title: 'Settings Page — Notifications Tab', description: 'Notifications tab inputs', acceptanceCriteria: ['Prefs saved'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 0.5 },
    { assignedTo: 'engineer', taskId: 'ENG-021', title: 'Settings Page — Integrations Tab', description: 'Integrations status and keys UI', acceptanceCriteria: ['Status shown', 'Keys masked'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 0.5 },
    { assignedTo: 'engineer', taskId: 'ENG-022', title: 'Settings Route Shell (/settings)', description: 'Tabbed route and wiring', acceptanceCriteria: ['Tabs render and switch'], allowedPaths: ['app/routes/**', 'app/components/**'], priority: 'P2', estimatedHours: 1 },

    // DESIGNER
    { assignedTo: 'designer', taskId: 'DES-009', title: 'Settings Page Design Validation', description: 'Validate ENG-014..022 against design', acceptanceCriteria: ['Design deviations logged', 'Critical issues resolved'], allowedPaths: ['docs/design/**', 'app/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'designer', taskId: 'DES-010', title: 'Onboarding Flow Wireframes', description: '4-step tour + welcome modal', acceptanceCriteria: ['Wireframes completed'], allowedPaths: ['docs/design/**'], priority: 'P3', estimatedHours: 3 },
    { assignedTo: 'designer', taskId: 'DES-011', title: 'Mobile Optimization Review', description: 'Tiles and modals review on mobile', acceptanceCriteria: ['Findings documented'], allowedPaths: ['docs/design/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'designer', taskId: 'DES-012', title: 'Accessibility Audit (Phases 1–5)', description: 'WCAG 2.2 AA audit baseline', acceptanceCriteria: ['Report with issues and fixes'], allowedPaths: ['docs/design/**'], priority: 'P2', estimatedHours: 3 },

    // DATA
    { assignedTo: 'data', taskId: 'DATA-006', title: 'Index Optimization', description: 'Add indexes for tile performance', acceptanceCriteria: ['Indexes created', 'Query times improved'], allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'data', taskId: 'DATA-007', title: 'Query Performance Analysis', description: 'Identify slow queries', acceptanceCriteria: ['Top N queries listed', 'Action plan'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'data', taskId: 'DATA-008', title: 'Phase 7–13 Schema Planning', description: 'Growth tables planning', acceptanceCriteria: ['Schema draft'], allowedPaths: ['docs/**', 'supabase/migrations/**'], priority: 'P2', estimatedHours: 3 },
    { assignedTo: 'data', taskId: 'DATA-009', title: 'Backup & Recovery Testing', description: 'Verify Supabase backups', acceptanceCriteria: ['Restore test passes'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },

    // DEVOPS
    { assignedTo: 'devops', taskId: 'DEVOPS-002', title: 'Staging Deployment Automation', description: 'Auto-deploy on merge', acceptanceCriteria: ['CI config updated', 'Deploy verified'], allowedPaths: ['.github/workflows/**', 'docs/runbooks/**'], priority: 'P1', estimatedHours: 3 },
    { assignedTo: 'devops', taskId: 'DEVOPS-003', title: 'Performance Monitoring Setup', description: 'Tile P95 tracking', acceptanceCriteria: ['P95 metric visible'], allowedPaths: ['docs/runbooks/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'devops', taskId: 'DEVOPS-004', title: 'Database Migration Pipeline', description: 'Automated migration testing', acceptanceCriteria: ['Pipeline green'], allowedPaths: ['docs/runbooks/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'devops', taskId: 'DEVOPS-005', title: 'Rollback Procedures Documentation', description: 'Phase 6+ rollback plans', acceptanceCriteria: ['Runbook written'], allowedPaths: ['docs/runbooks/**'], priority: 'P1', estimatedHours: 2 },

    // INTEGRATIONS
    { assignedTo: 'integrations', taskId: 'INTEGRATIONS-001', title: 'Publer API Client', description: 'OAuth + scheduling client', acceptanceCriteria: ['Auth flow', 'Post scheduling'], allowedPaths: ['app/**'], priority: 'P1', estimatedHours: 3 },
    { assignedTo: 'integrations', taskId: 'INTEGRATIONS-002', title: 'Publer Adapter (HITL)', description: 'Integrate approval flow', acceptanceCriteria: ['Approve → Post path works'], allowedPaths: ['app/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'integrations', taskId: 'INTEGRATIONS-003', title: 'Social Post Queue', description: 'Draft → Approve → Post', acceptanceCriteria: ['Queue persists state'], allowedPaths: ['app/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'integrations', taskId: 'INTEGRATIONS-004', title: 'API Rate Limiting', description: 'Global rate limit strategy', acceptanceCriteria: ['Limits enforced'], allowedPaths: ['app/**'], priority: 'P1', estimatedHours: 2 },

    // INVENTORY
    { assignedTo: 'inventory', taskId: 'INVENTORY-006', title: 'API routes for modals', description: 'Product detail & chart data routes', acceptanceCriteria: ['Routes return expected JSON'], allowedPaths: ['app/routes/**', 'app/services/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'inventory', taskId: 'INVENTORY-007', title: 'Real-time tile data', description: 'Status buckets & top risks', acceptanceCriteria: ['Realtime updates visible'], allowedPaths: ['app/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'inventory', taskId: 'INVENTORY-008', title: 'Kits & bundles support', description: 'BUNDLE:TRUE parsing and display', acceptanceCriteria: ['Bundles render correctly'], allowedPaths: ['app/**'], priority: 'P1', estimatedHours: 2 },

    // ANALYTICS
    { assignedTo: 'analytics', taskId: 'ANALYTICS-006', title: 'Social Post Performance Tracking', description: 'Track Publer metrics', acceptanceCriteria: ['Metrics persisted and visible'], allowedPaths: ['app/**', 'docs/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'analytics', taskId: 'ANALYTICS-007', title: 'SEO Impact Analysis Service', description: 'Rank tracking + deltas', acceptanceCriteria: ['Service computes deltas'], allowedPaths: ['app/**', 'docs/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'analytics', taskId: 'ANALYTICS-008', title: 'Ads ROAS Calculator', description: 'Campaign performance ROAS', acceptanceCriteria: ['ROAS calculation verified'], allowedPaths: ['app/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'analytics', taskId: 'ANALYTICS-009', title: 'Growth Dashboard Metrics', description: 'CTR, impressions, conversions', acceptanceCriteria: ['Metrics chart visible'], allowedPaths: ['app/**'], priority: 'P1', estimatedHours: 2 },

    // SEO
    { assignedTo: 'seo', taskId: 'SEO-007', title: 'Automated SEO Audits', description: 'Daily crawl and anomaly report', acceptanceCriteria: ['Report generated daily'], allowedPaths: ['app/**', 'docs/**'], priority: 'P2', estimatedHours: 3 },
    { assignedTo: 'seo', taskId: 'SEO-008', title: 'Keyword Cannibalization Detection', description: 'Detect multi-page rank conflicts', acceptanceCriteria: ['Conflicts listed'], allowedPaths: ['app/**', 'docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'seo', taskId: 'SEO-009', title: 'Schema Markup Validator', description: 'JSON-LD validation tooling', acceptanceCriteria: ['Validator runs in CI'], allowedPaths: ['.github/**', 'app/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'seo', taskId: 'SEO-010', title: 'Search Console Integration Enhancement', description: 'More metrics in data layer', acceptanceCriteria: ['Additional metrics stored'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 2 },

    // ADS
    { assignedTo: 'ads', taskId: 'ADS-001', title: 'Google Ads API Integration', description: 'Fetch campaign data', acceptanceCriteria: ['Auth + data fetch'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 3 },
    { assignedTo: 'ads', taskId: 'ADS-002', title: 'Ad Performance Dashboard', description: 'ROAS, CTR, conversions UI', acceptanceCriteria: ['Charts show metrics'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'ads', taskId: 'ADS-003', title: 'Budget Alert System', description: 'Overspend warnings', acceptanceCriteria: ['Alerts fire at thresholds'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'ads', taskId: 'ADS-004', title: 'HITL Ad Copy Approval', description: 'Approve → Publish flow', acceptanceCriteria: ['Approval gating works'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 3 },

    // CONTENT
    { assignedTo: 'content', taskId: 'CONTENT-005', title: 'Social Post Templates', description: 'Brand voice templates', acceptanceCriteria: ['Templates in repo'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'content', taskId: 'CONTENT-006', title: 'SEO Content Guidelines', description: 'Keyword integration best practices', acceptanceCriteria: ['Guidelines doc created'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'content', taskId: 'CONTENT-007', title: 'Ad Copy Best Practices', description: 'Conversion-focused messaging', acceptanceCriteria: ['Guidelines doc created'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'content', taskId: 'CONTENT-008', title: 'Phase 6 Microcopy Review', description: 'Settings & onboarding microcopy', acceptanceCriteria: ['Copy reviewed and updated'], allowedPaths: ['docs/**', 'app/**'], priority: 'P2', estimatedHours: 2 },

    // PRODUCT
    { assignedTo: 'product', taskId: 'PRODUCT-005', title: 'Onboarding Flow Spec', description: 'Spec for welcome + 4-step tour', acceptanceCriteria: ['Spec written'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 3 },
    { assignedTo: 'product', taskId: 'PRODUCT-006', title: 'Advanced Features Prioritization', description: 'Phases 10–13 ranking', acceptanceCriteria: ['Prioritized list done'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'product', taskId: 'PRODUCT-007', title: 'A/B Campaign Design', description: 'Settings variations tests', acceptanceCriteria: ['Campaign design doc'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'product', taskId: 'PRODUCT-008', title: 'User Feedback Analysis', description: 'Review CEO feedback patterns', acceptanceCriteria: ['Findings documented'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },

    // QA
    { assignedTo: 'qa', taskId: 'QA-002', title: 'Phase 6 Test Plan', description: 'Settings page test scenarios', acceptanceCriteria: ['Plan written and approved'], allowedPaths: ['docs/**', 'tests/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'qa', taskId: 'QA-003', title: 'Accessibility Testing Suite', description: 'WCAG 2.2 AA automation', acceptanceCriteria: ['Suite runs in CI'], allowedPaths: ['.github/**', 'tests/**'], priority: 'P1', estimatedHours: 3 },
    { assignedTo: 'qa', taskId: 'QA-004', title: 'Performance Regression Tests', description: 'Tile load benchmarks', acceptanceCriteria: ['Baseline + thresholds'], allowedPaths: ['tests/**'], priority: 'P1', estimatedHours: 2 },
    { assignedTo: 'qa', taskId: 'QA-005', title: 'E2E Settings Flow', description: 'Playwright tests for drag/drop', acceptanceCriteria: ['E2E passes locally and CI'], allowedPaths: ['tests/**'], priority: 'P1', estimatedHours: 2 },

    // PILOT
    { assignedTo: 'pilot', taskId: 'PILOT-004', title: 'Settings Smoke Tests', description: 'Phase 6 settings smoke tests', acceptanceCriteria: ['Checklist executed'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'pilot', taskId: 'PILOT-005', title: 'Mobile Testing Safari/Chrome', description: 'iOS/Android compatibility', acceptanceCriteria: ['Issues filed'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'pilot', taskId: 'PILOT-006', title: 'Edge Case Testing', description: 'Reorder + theme switch edge cases', acceptanceCriteria: ['Edge cases documented'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'pilot', taskId: 'PILOT-007', title: 'Production Readiness Checklist', description: 'Go/No-Go for Phase 6', acceptanceCriteria: ['Checklist completed'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },

    // AI-CUSTOMER
    { assignedTo: 'ai-customer', taskId: 'AI-CUSTOMER-001', title: 'Grading Analytics', description: 'Tone/accuracy/policy trends', acceptanceCriteria: ['Trends visible'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'ai-customer', taskId: 'AI-CUSTOMER-002', title: 'Template Optimization', description: 'Improve templates from grades', acceptanceCriteria: ['Templates updated'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'ai-customer', taskId: 'AI-CUSTOMER-003', title: 'Escalation Triggers', description: 'Auto-escalate complex cases', acceptanceCriteria: ['Triggers fire correctly'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'ai-customer', taskId: 'AI-CUSTOMER-004', title: 'Response Time Tracking', description: 'SLA monitoring', acceptanceCriteria: ['SLA metrics computed'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 2 },

    // AI-KNOWLEDGE
    { assignedTo: 'ai-knowledge', taskId: 'AI-KNOWLEDGE-001', title: 'Knowledge Base Schema', description: 'Embeddings + search schema', acceptanceCriteria: ['Schema drafted'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 3 },
    { assignedTo: 'ai-knowledge', taskId: 'AI-KNOWLEDGE-002', title: 'CEO Agent Backend', description: 'OpenAI SDK integration', acceptanceCriteria: ['Backend scaffolded'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 3 },
    { assignedTo: 'ai-knowledge', taskId: 'AI-KNOWLEDGE-003', title: 'Business Summary Service', description: 'Daily briefings generator', acceptanceCriteria: ['Service outputs summary'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'ai-knowledge', taskId: 'AI-KNOWLEDGE-004', title: 'Insight Generation', description: 'Pattern detection from data', acceptanceCriteria: ['Insights produced with evidence'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 2 },

    // SUPPORT
    { assignedTo: 'support', taskId: 'SUPPORT-002', title: 'Multi-Channel Testing', description: 'Email, live chat, SMS', acceptanceCriteria: ['All channels tested'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'support', taskId: 'SUPPORT-003', title: 'Conversation Routing Rules', description: 'Auto-assignment logic', acceptanceCriteria: ['Rules documented'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'support', taskId: 'SUPPORT-004', title: 'CX Metrics Dashboard', description: 'FRT, SLA, resolution time', acceptanceCriteria: ['Metrics visible'], allowedPaths: ['app/**'], priority: 'P2', estimatedHours: 2 },
    { assignedTo: 'support', taskId: 'SUPPORT-005', title: 'Help Documentation', description: 'Internal runbooks for CX team', acceptanceCriteria: ['Docs created'], allowedPaths: ['docs/**'], priority: 'P2', estimatedHours: 3 },
  ];

  for (const t of tasks) {
    // eslint-disable-next-line no-await-in-loop
    await ensure(t);
  }

  const total = await prisma.taskAssignment.count();
  console.log(`\n✔ Archive tasks assignment complete. Total tasks: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


