# SUPPORT Agent Feedback

## Database-Driven Feedback Process

**CRITICAL**: This file is for reference only. All actual feedback goes to the database via `logDecision()`.

### How to Log Progress

```typescript
import { logDecision } from '~/services/decisions.server';

await logDecision({
  scope: 'build',
  actor: 'support',
  taskId: 'TASK-ID',
  status: 'in_progress', // pending | in_progress | completed | blocked | cancelled
  progressPct: 50,
  action: 'task_progress',
  rationale: 'What you did + evidence',
  evidenceUrl: 'artifacts/support/2025-10-23/task.md',
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

*This section is for reference only. Actual progress is logged to the database.*

### 2025-10-23

#### Startup Completion - 10:00 AM

**Status**: ✅ Startup checklist complete - Ready for task assignment
**Branch**: agent-launch-20251023
**Tasks Found**: 0 active tasks
**Evidence**: `artifacts/support/2025-10-23/startup-completion.md`

**Completed Steps**:
1. ✅ Git setup (fetch, checkout, pull, verify branch)
2. ✅ File ownership review (owns: `docs/support/`)
3. ✅ Core docs alignment (NORTH_STAR, OPERATING_MODEL, RULES, growth-engine-pack)
4. ✅ Database task query (0 tasks found)
5. ✅ Evidence directories created (`artifacts/support/2025-10-23/mcp/`)
6. ✅ Startup logged to database

**Key Learnings**:
- Database-driven task management via TaskAssignment table
- MCP Tool Priority: Shopify Dev MCP → Context7 MCP → Web Search
- KB search MANDATORY before task execution
- All progress via `logDecision()` to database
- Database safety: NEVER run migration commands

**Next Action**: Awaiting task assignment from Manager
**Database Status**: Startup logged via `log-startup.ts`
