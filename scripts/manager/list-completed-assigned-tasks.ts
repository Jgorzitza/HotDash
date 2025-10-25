#!/usr/bin/env tsx
/**
 * List completed assigned tasks from the taskAssignment table (KB DB) in the last 24h.
 * Saves a markdown summary to artifacts/manager/<DATE>/completed-assigned.md and prints a compact view.
 */

import fs from 'node:fs';
import path from 'node:path';
import { getCompletedTasks } from '../../app/services/tasks.server';

function groupBy<T, K extends string | number>(arr: T[], key: (t: T) => K) {
  return arr.reduce((acc, item) => {
    const k = key(item) as any;
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

async function run() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const done = await getCompletedTasks(since);

  const byAgent = groupBy(done, (t: any) => t.assignedTo || 'unknown');

  console.log('\nCOMPLETED ASSIGNED TASKS (last 24h)\n');
  const lines: string[] = [];
  const date = new Date().toISOString().slice(0, 10);
  const dir = path.join('artifacts', 'manager', date);
  fs.mkdirSync(dir, { recursive: true });

  const md: string[] = [
    `# Completed Assigned Tasks — ${date}`,
    '',
  ];

  for (const agent of Object.keys(byAgent).sort()) {
    const list = byAgent[agent];
    console.log(`${agent}: ${list.length}`);
    lines.push(`${agent}: ${list.length}`);
    md.push(`## ${agent} (${list.length})`);
    for (const t of list) {
      md.push(`- ${t.taskId} — ${t.title || ''}`);
    }
    md.push('');
  }

  const file = path.join(dir, 'completed-assigned.md');
  fs.writeFileSync(file, md.join('\n'));
  console.log(`\n✅ Saved: ${file}`);
}

run().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

