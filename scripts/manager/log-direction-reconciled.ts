#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { logDecision } from '../../app/services/decisions.server';

async function run() {
  const date = new Date().toISOString().slice(0,10);
  const file = path.join('artifacts','manager',date,'reconcile-summary.json');
  let payload: any = undefined;
  if (fs.existsSync(file)) {
    try { payload = JSON.parse(fs.readFileSync(file,'utf8')); } catch {}
  }

  await logDecision({
    scope: 'build',
    actor: 'manager',
    action: 'direction_reconciled',
    rationale: 'Synchronized direction task statuses with DecisionLog completions before new assignments.',
    evidenceUrl: fs.existsSync(file) ? file : undefined,
    payload,
  });
  console.log('✅ Logged direction_reconciled');
}

run().catch((err) => { console.error('❌ Error:', err); process.exit(1); });

