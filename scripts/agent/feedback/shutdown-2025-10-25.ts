#!/usr/bin/env tsx
/**
 * Agent Shutdown — Follows docs/runbooks/agent_shutdown_checklist.md
 * Logs KB search compliance and final status for active tasks today.
 *
 * Usage: npx tsx --env-file=.env scripts/agent/feedback/shutdown-2025-10-25.ts
 */

import 'dotenv/config';
import { logDecision } from '../../../app/services/decisions.server';

async function main() {
  const actor = 'data';

  // 0) KB search compliance (for tasks started today)
  const kbTasks = [
    { id: 'DATA-KB-INDEX-POPULATE', sources: ['docs/agents/FEEDBACK_QUICK_START.md', 'apps/llamaindex-mcp-server/README.md'] },
    { id: 'BLOCKER-LLAMAINDEX-INDEX-001', sources: ['apps/llamaindex-mcp-server/src/server.ts', 'docs/mcp/llamaindex-mcp-server-recommendations.md'] },
  ];

  for (const t of kbTasks) {
    await logDecision({
      scope: 'build',
      actor,
      action: 'kb_search_completed',
      rationale: 'KB search completed before task execution',
      taskId: t.id,
      payload: {
        searchResults: 'Found existing patterns and server handlers',
        recommendations: [
          'Verify CLI path resolution and timeouts',
          'Provide offline fallback for query',
        ],
        sources: t.sources,
      },
    });
  }

  // 2) Final Progress Report — shutdown entries
  const shutdowns = [
    {
      id: 'DATA-KB-INDEX-POPULATE',
      pct: 60,
      status: 'in_progress' as const,
      notes:
        'Ingestion script updated with DRY_RUN + offline artifacts fallback. Next: run full ingestion with envs in a network-enabled environment.',
      next: 'Provide/build llama-workflow CLI, run refresh, validate query results',
      evidence: 'artifacts/qa/dev-kb/summary.json',
      durHrs: 2.5,
    },
    {
      id: 'BLOCKER-LLAMAINDEX-INDEX-001',
      pct: 50,
      status: 'in_progress' as const,
      notes:
        'MCP handlers patched for CLI resolution + timeouts and offline query fallback. Remote refresh pending environment.',
      next: 'Trigger refresh_index with built CLI; validate tools/list and tools/call',
      evidence: 'apps/llamaindex-mcp-server/src/utils/cli.ts',
      durHrs: 1.0,
    },
    {
      id: 'BLOCKER-DASHBOARDFACT-001',
      pct: 35,
      status: 'in_progress' as const,
      notes:
        'Added DashboardFact model to Prisma schema; generation OK. Migration intentionally not run in this sandbox. Needs DB migration in appropriate environment.',
      next: 'Apply migration in staging; verify read paths; update services to use prisma.dashboardFact directly',
      evidence: 'prisma/schema.prisma',
      durHrs: 0.8,
    },
  ];

  for (const s of shutdowns) {
    await logDecision({
      scope: 'build',
      actor,
      taskId: s.id,
      status: s.status,
      progressPct: s.pct,
      action: 'shutdown',
      rationale: `Shutdown - ${s.id} ${s.status}, ${s.notes}`,
      evidenceUrl: s.evidence,
      durationActual: Math.round(s.durHrs * 10) / 10,
      nextAction: s.next,
    });
  }

  console.log('✅ Shutdown status logged for active tasks');
}

main().catch((err) => {
  console.error('❌ Error during shutdown logging', err);
  process.exit(1);
});

