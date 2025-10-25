#!/usr/bin/env tsx
import { logDecision } from '../../app/services/decisions.server';

async function run() {
  await logDecision({
    scope: 'ops',
    actor: 'devops',
    action: 'chatwoot_prod_blocked',
    taskId: 'DEVOPS-CHATWOOT-PROD-VERIFY',
    status: 'blocked',
    blockedBy: 'chatwoot_prod_db_setup',
    blockerDetails: 'Prod Chatwoot not fully set up; DB connection (Supabase) not completed; UI shows setup unfinished. Proceed only in production.',
    rationale: 'Manager flagged production-only Chatwoot setup incomplete; needs DB verification & migrations on Supabase and Fly secrets alignment.',
    durationEstimate: 3,
    nextAction: 'Verify DB connection string, run migrations, validate /api + authenticated endpoints; document & attach artifacts.'
  });
  console.log('✅ Logged devops blocker to decision_log');
}

run().catch((err) => { console.error('❌ Error:', err); process.exit(1); });
