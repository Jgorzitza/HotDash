#!/usr/bin/env tsx
/**
 * Log Agent Startup to Database
 *
 * Usage: npx tsx --env-file=.env scripts/agent/log-startup.ts <agent-name> <task-count> [next-task-id]
 *
 * Examples:
 *   npx tsx --env-file=.env scripts/agent/log-startup.ts engineer 5 ENG-060
 *   npx tsx --env-file=.env scripts/agent/log-startup.ts qa-helper 2 QA-UI-002
 *   npx tsx --env-file=.env scripts/agent/log-startup.ts data 0
 */

import { logDecision } from '../../app/services/decisions.server.js';

const agent = process.argv[2];
const taskCount = process.argv[3];
const nextTaskId = process.argv[4];

if (!agent || !taskCount) {
  console.error('❌ Usage: npx tsx --env-file=.env scripts/agent/log-startup.ts <agent-name> <task-count> [next-task-id]');
  console.error('');
  console.error('Examples:');
  console.error('  npx tsx --env-file=.env scripts/agent/log-startup.ts engineer 5 ENG-060');
  console.error('  npx tsx --env-file=.env scripts/agent/log-startup.ts qa-helper 2 QA-UI-002');
  console.error('  npx tsx --env-file=.env scripts/agent/log-startup.ts data 0');
  process.exit(1);
}

async function logStartup() {
  try {
    const rationale = nextTaskId
      ? `Agent startup complete, found ${taskCount} active tasks, starting ${nextTaskId}`
      : `Agent startup complete, found ${taskCount} active tasks, ${taskCount === '0' ? 'awaiting direction' : 'ready to start'}`;

    await logDecision({
      scope: 'build',
      actor: agent,
      taskId: nextTaskId || undefined,
      action: 'startup_complete',
      rationale,
      evidenceUrl: 'scripts/agent/get-my-tasks.ts',
      payload: {
        taskCount: Number(taskCount),
        nextTask: nextTaskId || null
      }
    });

    console.log(`✅ Startup logged to database for ${agent}`);
    console.log(`   Tasks found: ${taskCount}`);
    if (nextTaskId) {
      console.log(`   Next task: ${nextTaskId}`);
    }
  } catch (error) {
    console.error('❌ Failed to log startup:', error);
    process.exit(1);
  }
}

logStartup();