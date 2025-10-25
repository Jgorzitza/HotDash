# Agent Feedback Quick Start

**Simple commands to write feedback to the database.**

## Option 1: Use the Template (Easiest)

### Step 1: Copy the template to a temp file
```bash
# Copy template to your own temp file
cp scripts/agent/log-feedback.ts /tmp/my-feedback.ts
```

### Step 2: Edit YOUR temp file
```bash
# Edit your temp file (not the template!)
code /tmp/my-feedback.ts
```

Update your feedback:
```typescript
const feedback = await logDecision({
  scope: "build",
  actor: "engineer",              // YOUR agent name
  action: "task_completed",       // What you did
  rationale: "Completed feature X with tests",
  taskId: "ENG-123",             // Your task ID
  status: "completed",
  progressPct: 100,
  evidenceUrl: "artifacts/engineer/tasks/eng-123.md",
});
```

### Step 3: Run YOUR temp file
```bash
npx tsx --env-file=.env /tmp/my-feedback.ts
```

**Done!** ✅ Your temp file is automatically cleaned up later.

---

## Option 2: One-Liner (Quick)

```bash
npx tsx --env-file=.env -e "
import { logDecision } from './app/services/decisions.server';

await logDecision({
  scope: 'build',
  actor: 'engineer',
  action: 'task_completed',
  rationale: 'Completed the feature',
  taskId: 'ENG-123',
  status: 'completed',
  progressPct: 100
});

console.log('✅ Feedback logged!');
"
```

---

## Option 3: In Your Code (Best for Automation)

```typescript
import { logDecision } from './app/services/decisions.server';

// At the end of your task
await logDecision({
  scope: "build",
  actor: "engineer",
  action: "task_completed",
  rationale: "Implemented user authentication with OAuth",
  taskId: "ENG-029",
  status: "completed",
  progressPct: 100,
  evidenceUrl: "artifacts/engineer/tasks/eng-029.md",
  durationActual: 3.5,
});
```

---

## Common Feedback Patterns

### Task Started
```typescript
await logDecision({
  scope: "build",
  actor: "engineer",
  action: "task_started",
  rationale: "Starting work on authentication feature",
  taskId: "ENG-029",
  status: "in_progress",
  progressPct: 0,
  durationEstimate: 4,
});
```

### Progress Update
```typescript
await logDecision({
  scope: "build",
  actor: "engineer",
  action: "progress_update",
  rationale: "Completed OAuth integration, starting tests",
  taskId: "ENG-029",
  status: "in_progress",
  progressPct: 60,
  nextAction: "Write integration tests",
});
```

### Task Completed
```typescript
await logDecision({
  scope: "build",
  actor: "engineer",
  action: "task_completed",
  rationale: "Authentication feature complete with tests",
  taskId: "ENG-029",
  status: "completed",
  progressPct: 100,
  evidenceUrl: "artifacts/engineer/tasks/eng-029.md",
  durationActual: 3.5,
});
```

### Blocker Found
```typescript
await logDecision({
  scope: "build",
  actor: "engineer",
  action: "blocker_found",
  rationale: "Cannot proceed without API endpoint",
  taskId: "ENG-029",
  status: "blocked",
  progressPct: 40,
  blockerDetails: "Waiting for backend API endpoint /auth/oauth",
  blockedBy: "ENG-028",
  nextAction: "Work on frontend UI while waiting",
});
```

### Daily Shutdown
```typescript
await logDecision({
  scope: "ops",
  actor: "engineer",
  action: "daily_shutdown",
  rationale: "End of day summary",
  payload: {
    tasksCompleted: ["ENG-029", "ENG-030"],
    hoursWorked: 7.5,
    retrospective: {
      didWell: ["Completed OAuth integration", "Added comprehensive tests"],
      toChange: ["Need to improve error handling"],
    },
  },
});
```

---

## Field Reference

### Required Fields
- `scope`: "build" or "ops"
- `actor`: Your agent name (engineer, data, designer, etc.)
- `action`: What you did (task_completed, task_started, etc.)

### Recommended Fields
- `rationale`: Brief description of what you did
- `taskId`: Task ID from your direction (e.g., "ENG-029")
- `status`: pending, in_progress, completed, blocked, cancelled
- `progressPct`: 0-100

### Optional Fields
- `evidenceUrl`: Link to artifacts or documentation
- `blockerDetails`: Description of blocker (if status is "blocked")
- `blockedBy`: Task ID blocking you
- `durationEstimate`: Estimated hours
- `durationActual`: Actual hours spent
- `nextAction`: What you'll do next
- `payload`: Any additional structured data (JSON)

---

## Verify Your Feedback

### Check today's feedback
```bash
npx tsx --env-file=.env scripts/manager/query-completed-today.ts
```

### Check your direction
```bash
npx tsx --env-file=.env scripts/agent/get-my-direction.ts
```

---

## Where Does It Go?

**Database:** KB Supabase (separate from production)
**Table:** `DecisionLog`
**Access:** Manager can query and review

**Your feedback is:**
- ✅ Stored in KB database (not production)
- ✅ Queryable by manager
- ✅ Used for direction and coordination
- ✅ Safe and isolated

---

## Troubleshooting

### "KB Database client not initialized"
**Fix:** Make sure `vault/dev-kb/supabase.env` exists with KB credentials

### "Missing required field"
**Fix:** Ensure you have `scope`, `actor`, and `action` at minimum

### "Cannot find module"
**Fix:** Run from project root: `/home/justin/HotDash/hot-dash`

---

## Summary

**Simplest command:**
```bash
# 1. Copy template to temp file
cp scripts/agent/log-feedback.ts /tmp/my-feedback.ts

# 2. Edit YOUR temp file
code /tmp/my-feedback.ts

# 3. Run YOUR temp file
npx tsx --env-file=.env /tmp/my-feedback.ts
```

**That's it!** Your feedback is now in the database.

**Why use /tmp?**
- Each agent has their own temp file
- No conflicts when multiple agents log feedback
- Temp files are automatically cleaned up
- Template stays clean for next use

---

**Questions?** Ask manager or check `app/services/decisions.server.ts` for full API.

