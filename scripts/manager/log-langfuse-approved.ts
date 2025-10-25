#!/usr/bin/env tsx
import { logDecision } from '../../app/services/decisions.server';

async function run() {
  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'langfuse_self_host_approved',
    rationale: 'Approved Option C: Self-host Langfuse (ClickHouse + MinIO on Fly). Execution runbook published. Additive-only safeguards enforced.',
    evidenceUrl: 'docs/runbooks/langfuse_self_host_execution.md',
    payload: {
      option: 'self_host',
      safeguards: ['additive_migrations_only', 'no_schema_reset', 'no_deletions'],
      apps: ['hotdash-langfuse-clickhouse', 'hotdash-langfuse-minio', 'hotdash-llm-gateway']
    }
  });
  console.log('✅ Logged langfuse_self_host_approved');
}

run().catch((e) => { console.error(e); process.exit(1); });

