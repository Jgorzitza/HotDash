# Agent Feedback

**DEPRECATED**: Agent feedback is now stored in the **DATABASE**, not markdown files.

## ❌ DO NOT Create Markdown Files Here

All agent feedback must be logged via database using `logDecision()`.

**Why**: 
- Manager monitors database in real-time
- Markdown files are NOT monitored
- Database provides instant visibility
- Better tracking and analytics

## ✅ How to Log Feedback

```typescript
import { logDecision } from './app/services/tasks.server';

await logDecision({
  scope: 'build',
  actor: '<your-agent>',
  taskId: '<TASK-ID>',
  status: 'in_progress',
  action: 'task_progress',
  rationale: 'Completed X, working on Y',
  evidenceUrl: 'path/to/file.ts',
  payload: {
    progress: 50,
    nextSteps: 'Implement Z'
  }
});
```

## 📊 Manager Queries Feedback Via

```bash
# Get all feedback from database
npx tsx --env-file=.env scripts/manager/query-agent-status.ts

# Get completed work
npx tsx --env-file=.env scripts/manager/query-completed-today.ts

# Get blocked tasks
npx tsx --env-file=.env scripts/manager/query-blocked-tasks.ts
```

## 📁 Old Feedback Files

All old markdown feedback files have been archived to:
`docs/_archive/2025-10-23/old-feedback/`

These files are preserved for historical reference but are NO LONGER USED.

## 🚫 .gitignore

The `feedback/` directory now ignores all `.md` files to prevent accidental creation:

```gitignore
# Feedback is database-only - no markdown files
feedback/**/*.md
!feedback/README.md
```

---

**Use database for all feedback** - Markdown files will be ignored and deleted.

