import { logDecision } from './app/services/decisions.server';

async function logStartup() {
  try {
    await logDecision({
      scope: 'build',
      actor: 'designer',
      action: 'startup_complete',
      rationale: 'Designer agent startup complete, found 1 active task (DESIGNER-001), starting Growth Engine UI Components task',
      evidenceUrl: 'scripts/agent/get-my-tasks.ts'
    });
    console.log('✅ Startup completion logged');
  } catch (error) {
    console.error('❌ Failed to log startup:', error.message);
  }
}

logStartup();
