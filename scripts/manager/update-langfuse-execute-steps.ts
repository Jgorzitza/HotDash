#!/usr/bin/env tsx
import { updateTask } from '../../app/services/tasks.server';

async function run() {
  const taskId = 'SA1-LANGFUSE-EXECUTE';
  await updateTask(taskId, {
    taskId,
    status: 'assigned',
    nextAction: 'Initialize evidence session and begin Phase 1 — Provision ClickHouse',
    payload: {
      constraints: {
        destructiveOps: false,
        allowOnly: [
          'additive migrations',
          'service provisioning',
          'secret staging',
          'validation probes',
        ],
        forbidden: ['schema reset', 'drop', 'truncate', 'delete volumes/buckets'],
      },
      steps: [
        'Run: node scripts/ops/langfuse/new-session.mjs (creates artifacts/ops/langfuse/<session>/)',
        'Tee outputs to: 01-provision-clickhouse.log, 02-provision-minio.log, 03-gateway-deploy.log, 04-validation.log',
        'Maintain COMMANDS.md with the exact commands executed (no secrets)',
        'Update summary.json with apps, volumes, and validation results',
        'Follow docs/runbooks/langfuse_self_host_execution.md Phase 1–5 (additive-only)',
      ],
      evidenceDir: 'artifacts/ops/langfuse',
      runbook: 'docs/runbooks/langfuse_self_host_execution.md',
    },
  });
  console.log('✅ Updated SA1-LANGFUSE-EXECUTE with session scaffolding instruction');
}

run().catch((e) => { console.error(e); process.exit(1); });

