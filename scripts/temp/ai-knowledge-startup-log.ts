import { logDecision } from '../../app/services/decisions.server.js';

async function logStartup() {
  console.log('🔧 Logging AI-Knowledge startup...\n');

  const result = await logDecision({
    scope: 'build',
    actor: 'ai-knowledge',
    action: 'startup_complete',
    status: 'blocked',
    rationale: 'Agent startup checklist executed. Found 1 active task (AI-KB-REFRESH-001) but blocked by DEVOPS-LLAMAINDEX-001. Created startup artifacts: tasks.todo.md, tasks.todo.json, heartbeat.ndjson. Monitoring blocking task status.',
    evidenceUrl: 'artifacts/ai-knowledge/2025-10-24/',
    payload: {
      taskId: 'AI-KB-REFRESH-001',
      taskTitle: 'Implement Knowledge Base Auto-Refresh',
      taskStatus: 'blocked',
      blockingTask: 'DEVOPS-LLAMAINDEX-001',
      blockingTaskStatus: 'in_progress',
      artifactsCreated: [
        'artifacts/ai-knowledge/2025-10-24/tasks.todo.md',
        'artifacts/ai-knowledge/2025-10-24/tasks.todo.json',
        'artifacts/ai-knowledge/2025-10-24/heartbeat.ndjson',
        'artifacts/ai-knowledge/2025-10-24/mcp/'
      ],
      estimatedHours: 2,
      priority: 'P3',
      allowedPaths: ['app/workers/**', 'app/routes/api.knowledge-base.**']
    }
  });

  console.log('✅ Startup logged! ID:', result.id);
  console.log('   Created at:', result.createdAt);
  console.log('   Status: BLOCKED - waiting on DEVOPS-LLAMAINDEX-001');

  return result;
}

logStartup()
  .then((r) => {
    console.log('\n✅ DONE - Startup logged:', r.id);
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ ERROR:', err.message);
    process.exit(1);
  });

