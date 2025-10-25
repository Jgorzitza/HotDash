#!/usr/bin/env tsx
/**
 * Print a compact workboard of all active tasks (assigned/in_progress/blocked)
 * and save a one-pager markdown under artifacts/manager/<DATE>/workboard.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import { getAllAgentTasks } from '../../app/services/tasks.server';

function pad(str: string, len: number) {
  return (str || '').toString().padEnd(len);
}

async function run() {
  const tasks = await getAllAgentTasks();
  // Sort: priority P0→P3, then agent, then assignedAt
  const priOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 } as const;
  tasks.sort((a: any, b: any) => {
    const pa = priOrder[a.priority as string] ?? 9;
    const pb = priOrder[b.priority as string] ?? 9;
    if (pa !== pb) return pa - pb;
    if (a.assignedTo !== b.assignedTo) return (a.assignedTo || '').localeCompare(b.assignedTo || '');
    return new Date(a.assignedAt || 0).getTime() - new Date(b.assignedAt || 0).getTime();
  });

  const rows = tasks.map((t: any) => ({
    agent: t.assignedTo,
    task: t.taskId,
    priority: t.priority,
    status: t.status,
    next: (t.payload as any)?.nextAction || (t as any)?.nextAction || '',
    title: t.title ?? '',
  }));

  // Console one-pager
  const cAgent = 14, cTask = 26, cPri = 3, cStat = 12, cNext = 40;
  console.log('\nALL-AGENTS WORKBOARD (compact)\n');
  console.log(
    pad('AGENT', cAgent) + '  ' +
    pad('TASK', cTask) + '  ' +
    pad('P', cPri) + '  ' +
    pad('STATUS', cStat) + '  ' +
    pad('NEXT', cNext)
  );
  console.log('-'.repeat(cAgent + cTask + cPri + cStat + cNext + 10));
  for (const r of rows) {
    console.log(
      pad(r.agent, cAgent) + '  ' +
      pad(r.task, cTask) + '  ' +
      pad((r.priority || ''), cPri) + '  ' +
      pad((r.status || ''), cStat) + '  ' +
      pad((r.next || ''), cNext)
    );
  }

  // Markdown one-pager
  const date = new Date().toISOString().slice(0, 10);
  const dir = path.join('artifacts', 'manager', date);
  fs.mkdirSync(dir, { recursive: true });
  const md = [
    `# All-Agents Workboard — ${date}`,
    '',
    '| Agent | Task | Priority | Status | Next | Title |',
    '|---|---|:---:|---|---|---|',
    ...rows.map((r) => `| ${r.agent} | ${r.task} | ${r.priority || ''} | ${r.status || ''} | ${(r.next || '').replace(/\|/g, '\\|')} | ${(r.title || '').replace(/\|/g, '\\|')} |`),
    '',
    '_Source: taskAssignment table (database)._',
  ].join('\n');
  const file = path.join(dir, 'workboard.md');
  fs.writeFileSync(file, md);
  console.log(`\n✅ Saved: ${file}`);
}

run().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

