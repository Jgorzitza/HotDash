#!/usr/bin/env tsx
import { updateTask } from '../../app/services/tasks.server';

const taskId = process.env.TASK_ID;
const reason = process.env.REASON || 'Replaced with code-focused production task';

if (!taskId) {
  console.error('TASK_ID is required');
  process.exit(1);
}

async function run() {
  await updateTask(taskId, {
    taskId,
    status: 'cancelled',
    cancelledAt: new Date(),
    cancellationReason: reason,
  });
  console.log(`✅ Cancelled ${taskId}: ${reason}`);
}

run().catch((e) => { console.error(e); process.exit(1); });

