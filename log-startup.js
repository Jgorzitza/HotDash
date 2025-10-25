import { logDecision } from './app/services/decisions.server.js';

await logDecision({
  scope: 'build',
  actor: 'data',
  action: 'startup_complete',
  rationale: 'Agent startup complete, found 8 active tasks, starting SECURITY-AUDIT-002',
  evidenceUrl: 'scripts/agent/get-my-tasks.ts'
});

console.log('✅ Startup completion logged');