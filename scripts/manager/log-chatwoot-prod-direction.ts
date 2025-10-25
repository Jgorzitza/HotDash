#!/usr/bin/env tsx
import { logDecision } from '../../app/services/decisions.server';

async function run() {
  await logDecision({
    scope: 'ops',
    actor: 'manager',
    action: 'direction_update',
    taskId: 'DEVOPS-CHATWOOT-PROD-VERIFY',
    status: 'assigned',
    progressPct: 0,
    rationale: 'DevOps to verify production Chatwoot installation against Supabase with strict safety constraints. Only additive operations permitted; absolutely no destructive DB actions.',
    nextAction: 'Follow safety checklist for prod Chatwoot verification (no destructive commands).',
    payload: {
      constraints: {
        destructiveOps: false,
        allowOnly: [
          'read-only checks',
          'additive migrations (rails db:migrate)',
          'secret verification (no changes)',
          'service health probes'
        ],
        forbidden: [
          'schema:load',
          'db:reset',
          'drop table',
          'delete from*',
          'truncate',
          'vacuum full'
        ]
      },
      steps: [
        'Operate in production only; do NOT modify staging',
        'Inspect Fly env/secrets for Chatwoot->Supabase connection (read-only)',
        'GET /api returns 200 JSON',
        'GET /api/v1/accounts/3/conversations?per_page=1 with api_access_token returns 200',
        'rails db:migrate:status to view pending migrations',
        'If pending, run rails db:migrate only (additive)',
        'Never run schema:load/reset or destructive operations',
        'Save artifacts under artifacts/ops/chatwoot-health and link in the task'
      ]
    }
  });
  console.log('✅ Direction logged to decision_log');
}

run().catch((err) => { console.error('❌ Error:', err); process.exit(1); });
