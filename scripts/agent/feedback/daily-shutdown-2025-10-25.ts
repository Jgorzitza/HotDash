#!/usr/bin/env tsx
/**
 * Daily Shutdown Summary — 2025-10-25
 * Usage: npx tsx --env-file=.env scripts/agent/feedback/daily-shutdown-2025-10-25.ts
 */

import 'dotenv/config';
import { logDecision } from '../../../app/services/decisions.server';

async function main() {
  const decision = await logDecision({
    scope: 'ops',
    actor: 'data',
    action: 'daily_shutdown',
    rationale: 'Ended day with tasks in progress and offline artifacts prepared for QA.',
    payload: {
      tasksCompleted: [],
      hoursWorked: 4.3,
      retrospective: {
        didWell: [
          'Added MCP timeouts + offline fallback',
          'Created DRY_RUN ingestion with artifacts for QA',
        ],
        toChange: ['Provide built llama-workflow CLI earlier'],
      },
    },
  });

  console.log('✅ Daily shutdown logged');
  console.log(`   ID: ${decision.id}`);
}

main().catch((err) => {
  console.error('❌ Error logging daily shutdown', err);
  process.exit(1);
});

