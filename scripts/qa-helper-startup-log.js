import { logDecision } from '../app/services/decisions.server.js';

async function main() {
  try {
    await logDecision({
      scope: 'build',
      actor: 'qa-helper',
      action: 'startup_complete',
      rationale: 'Agent startup complete, found 9 active tasks, starting QA-001',
      evidenceUrl: 'scripts/agent/get-my-tasks.ts',
    });
    console.log('✅ Startup completion logged');
  } catch (error) {
    console.error('❌ Failed to log startup completion:', error.message);
  }
}

main();
