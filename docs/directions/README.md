# Agent Directions

**DEPRECATED**: Agent directions are now managed via DATABASE, not markdown files.

## How to Get Your Direction

```bash
# Get your tasks from database (includes direction)
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <your-agent>
```

## Why This Changed

- **Real-time updates**: Manager can update tasks instantly via database
- **No git pulls needed**: Agents query database directly
- **Better tracking**: All progress logged to database via `logDecision()`
- **Immediate visibility**: Manager sees blockers in real-time

## Old Direction Files

Archived to: `docs/_archive/2025-10-23/old-directions/`

These files are NO LONGER USED and will NOT be updated.

## Database-Driven Coordination

All agent coordination now happens via:
- **Tasks**: `TaskAssignment` table (query via `get-my-tasks.ts`)
- **Progress**: `decision_log` table (log via `logDecision()`)
- **Blockers**: `TaskAssignment.status='blocked'` (log via `log-blocked.ts`)

**Manager monitors via**:
- `query-agent-status.ts` - Real-time agent status
- `query-blocked-tasks.ts` - Blocked tasks
- `query-completed-today.ts` - Completed work
