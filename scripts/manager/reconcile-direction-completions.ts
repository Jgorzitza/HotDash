#!/usr/bin/env tsx
/**
 * Reconcile direction with decision_log completions.
 * For each DecisionLog entry with status=completed and a taskId (last 48h),
 * if a matching taskAssignment exists and is not completed, mark it completed
 * and attach completion notes + evidence.
 */

import fs from 'node:fs';
import path from 'node:path';
import kbPrisma from '../../app/kb-db.server';
import { updateTask } from '../../app/services/tasks.server';

async function run() {
  const days = Number(process.env.DAYS || '2');
  const take = Number(process.env.TAKE || '5000');
  const targetTaskId = process.env.TASK_ID;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const where: any = { status: 'completed', taskId: { not: null } };
  if (targetTaskId) {
    where.taskId = targetTaskId;
  } else {
    where.createdAt = { gte: since };
  }

  const decisions = await kbPrisma.decisionLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
  });

  let checked = 0;
  let updated = 0;
  const updatedTaskIds: string[] = [];
  for (const d of decisions) {
    const taskId = d.taskId as string | null;
    if (!taskId) continue;

    checked++;
    const t = await kbPrisma.taskAssignment.findUnique({ where: { taskId } });
    if (!t) continue; // not a DB-directed task
    if (t.status === 'completed') continue;

    await updateTask(taskId, {
      taskId,
      status: 'completed',
      completedAt: d.createdAt ?? new Date(),
      completionNotes: `${d.rationale || 'Completed'}${d.evidenceUrl ? `\nEvidence: ${d.evidenceUrl}` : ''}`.trim(),
    });
    updated++;
    updatedTaskIds.push(taskId);
    console.log(`✔ Marked completed: ${taskId}`);
  }

  console.log(`\nChecked ${checked} completed decision(s); updated ${updated} direction task(s).`);

  // Write artifact summary
  const date = new Date().toISOString().slice(0,10);
  const dir = path.join('artifacts','manager', date);
  fs.mkdirSync(dir, { recursive: true });
  const summary = {
    days,
    take,
    taskId: targetTaskId || null,
    since: since.toISOString(),
    checked,
    updated,
    updatedTaskIds,
    timestamp: new Date().toISOString(),
  };
  const file = path.join(dir, 'reconcile-summary.json');
  fs.writeFileSync(file, JSON.stringify(summary, null, 2));
  console.log(`Saved reconciliation summary: ${file}`);
}

run().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
