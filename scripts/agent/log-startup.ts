import { logDecision } from '../../app/services/decisions.server.js';

async function logStartup() {
  try {
    await logDecision({
      scope: 'build',
      actor: 'integrations',
      action: 'startup_complete',
      rationale: 'Agent startup complete, found 0 active tasks, awaiting direction',
      evidenceUrl: 'scripts/agent/get-my-tasks.ts'
    });
    console.log('✅ Startup logged to database');
  } catch (error) {
    console.error('❌ Failed to log startup:', error);
    process.exit(1);
  }
}

logStartup();