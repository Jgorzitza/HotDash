import { PrismaClient } from '@prisma/client';
import { assignTask } from '../../app/services/tasks.server';

const prisma = new PrismaClient();

type NewTask = {
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

async function ensureTask(task: NewTask) {
  try {
    await assignTask({ assignedBy: 'manager', ...task });
    console.log(`➕ Assigned ${task.taskId} → ${task.assignedTo}`);
  } catch (err: any) {
    // Unique constraint on taskId; if it exists, skip silently
    if (err?.code === 'P2002' || /Unique constraint/.test(String(err?.message))) {
      console.log(`↷ Skipped (exists) ${task.taskId}`);
      return;
    }
    console.error(`✖ Failed ${task.taskId}:`, err?.message || err);
  }
}

async function main() {
  console.log('Assigning vision gap tasks from COMPLETE_VISION_OVERVIEW / PROJECT_PLAN ...');

  const tasks: NewTask[] = [
    // Phase 1: Core HITL (P0)
    {
      assignedTo: 'engineer',
      taskId: 'ENG-001',
      title: 'Approval Queue Route (/approvals)',
      description:
        'Create /approvals route listing pending actions with auto-refresh (spec: HANDOFF-approval-queue-ui.md).',
      acceptanceCriteria: [
        'Route app/routes/approvals.tsx renders list with empty state',
        'Auto-refresh every 5 seconds',
        'Nav badge shows pending count',
      ],
      allowedPaths: ['app/routes/**', 'app/components/**', 'app/services/**', 'docs/design/**'],
      priority: 'P0',
      estimatedHours: 2,
      dependencies: ['DATA-100'],
    },
    {
      assignedTo: 'engineer',
      taskId: 'ENG-002',
      title: 'ApprovalCard Component',
      description:
        'Implement ApprovalCard with risk badges, approve/reject actions, loading/error states (spec: approvalcard-component-spec.md).',
      acceptanceCriteria: [
        'Component renders agent/tool/args and risk badge',
        'Approve/Reject wired to POST endpoints',
        'Success toast and error banner behaviors',
      ],
      allowedPaths: ['app/components/**', 'app/routes/**', 'app/services/**', 'docs/design/**'],
      priority: 'P0',
      estimatedHours: 1,
      dependencies: ['ENG-001'],
    },
    {
      assignedTo: 'engineer',
      taskId: 'ENG-003',
      title: 'Approval Actions Endpoints',
      description:
        'Add POST /approvals/:id/:idx/approve and /reject routes. Log decision, refresh queue, toast feedback.',
      acceptanceCriteria: [
        'Approve endpoint executes action and logs to decision_log',
        'Reject endpoint stores reason and logs to decision_log',
        'Both return UI signals for toast + refresh',
      ],
      allowedPaths: ['app/routes/**', 'app/services/**'],
      priority: 'P0',
      estimatedHours: 0.5,
      dependencies: ['ENG-001', 'ENG-002'],
    },

    // Phase 3: Missing Tiles (P1)
    {
      assignedTo: 'engineer',
      taskId: 'ENG-008',
      title: 'Idea Pool Tile',
      description:
        'Create IdeaPoolTile showing 5/5 capacity, wildcard badge, counts, and CTA to /ideas (spec: dashboard-tiles.md 528-670).',
      acceptanceCriteria: [
        'Tile renders capacity/status and wildcard',
        'Pending/accepted/rejected counts visible',
        'CTA navigates to /ideas',
      ],
      allowedPaths: ['app/components/tiles/**', 'app/routes/**', 'app/services/**', 'docs/design/**'],
      priority: 'P1',
      estimatedHours: 1,
      dependencies: [],
    },
    {
      assignedTo: 'engineer',
      taskId: 'ENG-009',
      title: 'Approvals Queue Tile',
      description:
        'Create ApprovalsQueueTile showing pending count, oldest pending time, CTA to /approvals.',
      acceptanceCriteria: [
        'Tile renders pending count and oldest time',
        'CTA navigates to /approvals',
      ],
      allowedPaths: ['app/components/tiles/**', 'app/routes/**', 'app/services/**', 'docs/design/**'],
      priority: 'P1',
      estimatedHours: 0.5,
      dependencies: ['ENG-001'],
    },
    {
      assignedTo: 'engineer',
      taskId: 'ENG-010',
      title: 'Dashboard Integration for Tiles',
      description:
        'Register IdeaPoolTile and ApprovalsQueueTile in app/routes/app._index.tsx and tiles index.',
      acceptanceCriteria: [
        'Tiles appear on dashboard grid',
        'Loader/LoaderData updated accordingly',
      ],
      allowedPaths: ['app/routes/**', 'app/components/**'],
      priority: 'P1',
      estimatedHours: 0.5,
      dependencies: ['ENG-008', 'ENG-009'],
    },

    // Phase 2: Enhanced Modals (P1)
    {
      assignedTo: 'engineer',
      taskId: 'ENG-011',
      title: 'Enhanced CX Escalation Modal',
      description:
        'Add conversation preview, AI reply, internal notes, grading sliders, multi-action buttons (spec: modal-refresh-handoff.md).',
      acceptanceCriteria: [
        'Grading sliders store values (tone/accuracy/policy)',
        'Approve/Edit/Escalate/Resolve actions wired with toasts',
      ],
      allowedPaths: ['app/components/**', 'app/routes/**', 'app/services/**'],
      priority: 'P1',
      estimatedHours: 2.5,
      dependencies: [],
    },
    {
      assignedTo: 'engineer',
      taskId: 'ENG-012',
      title: 'Sales Pulse Modal (Variance Review)',
      description:
        'Implement variance review UI with action dropdown, notes audit trail, dynamic CTA.',
      acceptanceCriteria: [
        'WoW variance display + actions logged',
        'Notes stored with audit trail',
      ],
      allowedPaths: ['app/components/**', 'app/routes/**', 'app/services/**'],
      priority: 'P1',
      estimatedHours: 1,
      dependencies: [],
    },
    {
      assignedTo: 'engineer',
      taskId: 'ENG-013',
      title: 'Inventory Modal (Velocity + Reorder)',
      description:
        'Add 14-day velocity analysis, reorder flow, vendor selection, approve reorder action.',
      acceptanceCriteria: [
        'Velocity metrics render',
        'Approve reorder stores record and toasts success',
      ],
      allowedPaths: ['app/components/**', 'app/routes/**', 'app/services/**'],
      priority: 'P1',
      estimatedHours: 1.5,
      dependencies: [],
    },

    // Phase 4: Notification System (P1)
    {
      assignedTo: 'engineer',
      taskId: 'ENG-014',
      title: 'Toast Infrastructure (App Bridge)',
      description:
        'Integrate Shopify App Bridge toast for success/error/info across approval flows.',
      acceptanceCriteria: ['Global toast utility implemented', 'Approval actions show toasts'],
      allowedPaths: ['app/**'],
      priority: 'P1',
      estimatedHours: 1,
      dependencies: ['ENG-003'],
    },
    {
      assignedTo: 'engineer',
      taskId: 'ENG-015',
      title: 'Banner Alerts (Queue/Performance/Health)',
      description:
        'Add banners for queue backlog, performance degradation, system health changes.',
      acceptanceCriteria: ['Banners render and dismiss properly'],
      allowedPaths: ['app/components/**', 'app/routes/**'],
      priority: 'P1',
      estimatedHours: 0.75,
      dependencies: [],
    },
    {
      assignedTo: 'engineer',
      taskId: 'ENG-016',
      title: 'Desktop Notifications',
      description:
        'Request browser permission and send notifications for new approvals with sound option.',
      acceptanceCriteria: ['Permission flow implemented', 'Notification fires on new approval'],
      allowedPaths: ['app/**'],
      priority: 'P1',
      estimatedHours: 1,
      dependencies: [],
    },

    // Phase 5: Personalization (P1)
    {
      assignedTo: 'engineer',
      taskId: 'ENG-017',
      title: 'Drag & Drop Tile Reordering',
      description:
        'Use @dnd-kit/core to reorder tiles; persist order to user_preferences.',
      acceptanceCriteria: ['Drag handles work', 'Order persists across sessions'],
      allowedPaths: ['app/**'],
      priority: 'P1',
      estimatedHours: 2,
      dependencies: ['DATA-104'],
    },
    {
      assignedTo: 'engineer',
      taskId: 'ENG-018',
      title: 'Tile Visibility Toggles',
      description:
        'Settings to show/hide tiles; saved to user_preferences and reflected on dashboard.',
      acceptanceCriteria: ['Visibility toggles persist', 'Dashboard respects settings'],
      allowedPaths: ['app/**'],
      priority: 'P1',
      estimatedHours: 1,
      dependencies: ['DATA-104'],
    },

    // Phase 6: Settings Page (P2)
    {
      assignedTo: 'engineer',
      taskId: 'ENG-019',
      title: 'Settings Route (/settings)',
      description: 'Tabbed settings for Dashboard, Appearance, Notifications, Integrations.',
      acceptanceCriteria: ['Tabbed layout works', 'Form saves to user_preferences'],
      allowedPaths: ['app/routes/**', 'app/components/**', 'app/services/**'],
      priority: 'P2',
      estimatedHours: 2,
      dependencies: ['DATA-104', 'DATA-105'],
    },

    // Phase 7: Real-Time Indicators (P2)
    {
      assignedTo: 'engineer',
      taskId: 'ENG-020',
      title: 'Live Update Indicators + SSE',
      description:
        'Add pulse animation, updated timestamp, and SSE for approvals/tile refresh.',
      acceptanceCriteria: ['SSE connection stable', 'Tiles show updated timestamp'],
      allowedPaths: ['app/**', 'server/**'],
      priority: 'P2',
      estimatedHours: 2,
      dependencies: [],
    },

    // Phase 8: Data Visualization (P2)
    {
      assignedTo: 'engineer',
      taskId: 'ENG-021',
      title: 'Polaris Viz Integration + Charts',
      description: 'Integrate @shopify/polaris-viz and add sparklines, bar/line/donut charts.',
      acceptanceCriteria: ['Charts render on Sales/Inventory tiles/modals'],
      allowedPaths: ['app/components/**'],
      priority: 'P2',
      estimatedHours: 2,
      dependencies: [],
    },

    // Phase 9: Onboarding (P3)
    {
      assignedTo: 'designer',
      taskId: 'DES-020',
      title: 'Welcome Modal + Tooltip Tour',
      description: 'Design and implement welcome modal and 4-step tooltip tour.',
      acceptanceCriteria: ['Welcome modal first-visit only', 'Tour navigates 4 steps'],
      allowedPaths: ['app/components/**', 'app/routes/**', 'docs/design/**'],
      priority: 'P3',
      estimatedHours: 2.5,
      dependencies: [],
    },

    // Phase 10: Approval History & Audit (P2)
    {
      assignedTo: 'engineer',
      taskId: 'ENG-022',
      title: 'Approval History Route (/approvals/history)',
      description: 'Filterable table with search and CSV export; timeline view.',
      acceptanceCriteria: ['Filters work', 'CSV export works', 'Timeline view renders'],
      allowedPaths: ['app/routes/**', 'app/components/**'],
      priority: 'P2',
      estimatedHours: 2.5,
      dependencies: [],
    },

    // Phase 11: Polish & Refinements (P2)
    {
      assignedTo: 'designer',
      taskId: 'DES-021',
      title: 'Design System Completion + Dark Mode',
      description: 'Complete tokens, docs, and implement dark mode palette with toggle.',
      acceptanceCriteria: ['Tokens finalized', 'Dark mode passes WCAG AA'],
      allowedPaths: ['app/**', 'docs/design/**'],
      priority: 'P2',
      estimatedHours: 2.5,
      dependencies: [],
    },
    {
      assignedTo: 'qa',
      taskId: 'QA-102',
      title: 'Accessibility Audit (WCAG 2.2 AA)',
      description: 'Run accessibility audit and log findings; verify keyboard and SR support.',
      acceptanceCriteria: ['Report produced', 'Critical issues resolved or tracked'],
      allowedPaths: ['docs/**', 'tests/**'],
      priority: 'P2',
      estimatedHours: 1,
      dependencies: ['DES-021'],
    },

    // Data layer tasks for missing tables
    {
      assignedTo: 'data',
      taskId: 'DATA-104',
      title: 'Create user_preferences table + RLS',
      description: 'Add Supabase table for personalization (tile order, visibility, theme, notification_prefs).',
      acceptanceCriteria: ['SQL migration created and applied', 'RLS policies in place'],
      allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma', 'app/services/**'],
      priority: 'P1',
      estimatedHours: 1,
      dependencies: ['DATA-100'],
    },
    {
      assignedTo: 'data',
      taskId: 'DATA-105',
      title: 'Create notifications table + RLS',
      description: 'Add notifications table with read/unread and priority levels.',
      acceptanceCriteria: ['SQL migration applied', 'RLS policies in place'],
      allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma', 'app/services/**'],
      priority: 'P1',
      estimatedHours: 1,
      dependencies: ['DATA-100'],
    },
    {
      assignedTo: 'data',
      taskId: 'DATA-106',
      title: 'Create approval_queue table + Realtime',
      description: 'Add approval_queue table and enable Supabase Realtime for queue updates.',
      acceptanceCriteria: ['Table created', 'Realtime channel configured'],
      allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma'],
      priority: 'P1',
      estimatedHours: 1,
      dependencies: ['DATA-100'],
    },
    {
      assignedTo: 'data',
      taskId: 'DATA-107',
      title: 'Create sales_pulse_actions table',
      description: 'Persist Sales Pulse modal actions and notes with audit trail.',
      acceptanceCriteria: ['Table created', 'Basic service layer available'],
      allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma', 'app/services/**'],
      priority: 'P2',
      estimatedHours: 1,
      dependencies: ['DATA-100'],
    },
    {
      assignedTo: 'data',
      taskId: 'DATA-108',
      title: 'Create inventory_actions table',
      description: 'Persist Inventory modal reorder approvals and vendor selections.',
      acceptanceCriteria: ['Table created', 'Basic service layer available'],
      allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma', 'app/services/**'],
      priority: 'P2',
      estimatedHours: 1,
      dependencies: ['DATA-100'],
    },
  ];

  for (const t of tasks) {
    // eslint-disable-next-line no-await-in-loop
    await ensureTask(t);
  }

  const total = await prisma.taskAssignment.count();
  console.log(`\n✔ Done. TaskAssignment total count: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


