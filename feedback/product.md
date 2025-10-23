# PRODUCT Agent Feedback

## Database-Driven Feedback Process

**CRITICAL**: This file is for reference only. All actual feedback goes to the database via `logDecision()`.

### How to Log Progress

```typescript
import { logDecision } from '~/services/decisions.server';

await logDecision({
  scope: 'build',
  actor: 'product',
  taskId: 'TASK-ID',
  status: 'in_progress', // pending | in_progress | completed | blocked | cancelled
  progressPct: 50,
  action: 'task_progress',
  rationale: 'What you did + evidence',
  evidenceUrl: 'artifacts/product/2025-10-23/task.md',
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

#### 09:00 - Startup Checklist Complete

**Git Setup**: ✅
- Branch: `agent-launch-20251023`
- Status: Up to date
- Modified files: `prisma/schema.prisma`

**Task Query**: ✅
- Active tasks in database: **0**
- Command: `npx tsx --env-file=.env scripts/agent/get-my-tasks.ts product`

**Startup Logged**: ✅
- Command: `npx tsx --env-file=.env scripts/agent/log-startup.ts product 0`

**Status Report**: ✅
- Logged to database via `scripts/product/report-startup-status.ts`
- Status: BLOCKED (awaiting task assignment)

#### Situation Analysis

**Completed Work Found** (not in database):
1. **PRODUCT-016**: Vendor Management UI Planning
   - File: `docs/product/vendor-management-ui-spec.md`
   - Status: Complete (543 lines)
   - Created: 2025-10-23

2. **PRODUCT-017**: ALC Calculation UI Planning
   - File: `docs/product/alc-calculation-ui-spec.md`
   - Status: Complete (613 lines)
   - Created: 2025-10-22

3. **PRODUCT-018**: Action Attribution UX Flow
   - File: `docs/product/action-attribution-ux.md`
   - Status: Complete (371 lines)
   - Created: 2025-10-23

**Issue**: These specs exist and are marked complete, but were never tracked in the database. This suggests work was done outside the database-driven workflow.

**Next Steps**:
1. Awaiting manager review of completed specs
2. Awaiting task assignment (either log existing work as complete OR assign new tasks)
3. Ready to begin new work once tasks are assigned

**Database Status**: All feedback logged to database via `logDecision()`
