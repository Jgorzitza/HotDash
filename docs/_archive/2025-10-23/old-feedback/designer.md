# DESIGNER Agent Feedback

## Database-Driven Feedback Process

**CRITICAL**: This file is for reference only. All actual feedback goes to the database via `logDecision()`.

### How to Log Progress

```typescript
import { logDecision } from '~/services/decisions.server';

await logDecision({
  scope: 'build',
  actor: 'designer',
  taskId: 'TASK-ID',
  status: 'in_progress', // pending | in_progress | completed | blocked | cancelled
  progressPct: 50,
  action: 'task_progress',
  rationale: 'What you did + evidence',
  evidenceUrl: 'artifacts/designer/2025-10-23/task.md',
  payload: {
    commits: ['abc123f'],
    files: [{ path: 'app/routes/dashboard.tsx', lines: 45, type: 'modified' }],
    tests: { overall: '22/22 passing' }
  }
});
```

### When to Log

- ✅ Task started (status: 'in_progress')
- ✅ Task completed (status: 'completed') - IMMEDIATE
- ✅ Task blocked (status: 'blocked') - IMMEDIATE
- ✅ Blocker cleared (status: 'in_progress') - IMMEDIATE
- ✅ Every 2 hours if still working on same task

### Manager Queries

Manager can see your progress via:
- `scripts/manager/query-blocked-tasks.ts`
- `scripts/manager/query-agent-status.ts`
- `scripts/manager/query-completed-today.ts`

---

## Feedback Log

*All feedback is logged to the database via `logDecision()` or progress scripts.*
*This file is for reference only - do not add content here.*
