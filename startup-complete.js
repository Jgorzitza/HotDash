import { logDecision } from './app/services/decisions.server.js';

await logDecision({
  scope: 'build',
  actor: 'engineer',
  action: 'startup_complete',
  rationale: 'Agent startup complete, found 42 active tasks, continuing with ENG-058 Action Queue Implementation',
  evidenceUrl: 'scripts/agent/get-my-tasks.ts',
});

console.log('✅ Startup completion logged successfully');