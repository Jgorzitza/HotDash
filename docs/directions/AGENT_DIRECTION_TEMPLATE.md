# {Agent Name} Direction v{X.X} — {Current Focus}

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: {Agent Name}  
**Effective**: 2025-10-22T00:00Z  
**Version**: {X.X}  
**Status**: ACTIVE — {Current Focus Description}

---

## 📊 MANDATORY: Progress Reporting (Database Feedback)

**Report progress via `logDecision()` every 2 hours minimum OR at task milestones.**

### Basic Usage

```typescript
import { logDecision } from '~/services/decisions.server';

// When starting a task
await logDecision({
  scope: 'build',
  actor: '{agent-name}',            // YOUR agent name (lowercase)
  taskId: '{TASK-ID}',              // Task ID from this direction file
  status: 'in_progress',            // pending | in_progress | completed | blocked | cancelled
  progressPct: 0,                   // 0-100 percentage
  action: 'task_started',
  rationale: 'Starting {task description}',
  evidenceUrl: 'docs/directions/{agent-name}.md',
  durationEstimate: 4.0             // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: 'build',
  actor: '{agent-name}',
  taskId: '{TASK-ID}',
  status: 'in_progress',
  progressPct: 50,                  // Update progress
  action: 'task_progress',
  rationale: 'Component implemented, writing tests',
  evidenceUrl: 'artifacts/{agent}/2025-10-22/{task}.md',
  durationActual: 2.0,              // Hours spent so far
  nextAction: 'Complete integration tests'
});

// When completed
await logDecision({
  scope: 'build',
  actor: '{agent-name}',
  taskId: '{TASK-ID}',
  status: 'completed',              // CRITICAL for manager queries
  progressPct: 100,
  action: 'task_completed',
  rationale: '{Task name} complete, {X}/{X} tests passing',
  evidenceUrl: 'artifacts/{agent}/2025-10-22/{task}-complete.md',
  durationEstimate: 4.0,
  durationActual: 3.5,              // Compare estimate vs actual
  nextAction: 'Starting {NEXT-TASK-ID}'
});
```

### When Blocked (CRITICAL)

**Manager queries blocked tasks FIRST during consolidation**:

```typescript
await logDecision({
  scope: 'build',
  actor: '{agent-name}',
  taskId: '{TASK-ID}',
  status: 'blocked',                // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: 'Waiting for {dependency} to complete',
  blockedBy: '{DEPENDENCY-TASK-ID}',  // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: 'task_blocked',
  rationale: 'Cannot proceed because {reason}',
  evidenceUrl: 'feedback/{agent}/2025-10-22.md'
});
```

### Manager Visibility

Manager runs these scripts to see your work (< 1 second):
- `query-blocked-tasks.ts` - Shows if you're blocked and why
- `query-agent-status.ts` - Shows your current task and progress
- `query-completed-today.ts` - Shows your completed work

**This is why structured logging is MANDATORY** - Manager can instantly see status across all 17 agents.

### Markdown Backup (Optional)

You can still write to `feedback/{agent}/2025-10-22.md` for detailed notes, but database is now the primary method.

---

## 🎯 ACTIVE TASKS

### {TASK-001}: {Task Name} ({X}h, {Priority})

**Objective**: {What needs to be done}

**Acceptance Criteria**:
- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] {Criterion 3}

**Allowed Paths**:
- `app/components/{specific-file}.tsx`
- `app/routes/{specific-route}.tsx`

**Dependencies**: {None or list of tasks}

**Evidence Requirements**:
- MCP Evidence JSONL: `artifacts/{agent}/2025-10-22/mcp/{tool}.jsonl`
- Tests: Unit + integration tests
- `logDecision()` calls: At start, 50%, 100%, or when blocked

**Reporting Example**:
```typescript
// When complete
await logDecision({
  scope: 'build',
  actor: '{agent-name}',
  taskId: '{TASK-001}',
  status: 'completed',
  progressPct: 100,
  action: 'task_completed',
  rationale: '{TASK-001}: {Description}, {X}/{X} tests passing',
  evidenceUrl: 'artifacts/{agent}/2025-10-22/{task-001}.md',
  durationActual: {X}.0
});
```

---

## 🔧 MANDATORY: DEV MEMORY SYSTEM

Call `logDecision()` at EVERY task milestone:
- Task started (progressPct: 0)
- Progress updates (progressPct: 25, 50, 75)
- Task blocked (status: 'blocked', with blockerDetails)
- Task completed (progressPct: 100)

**Frequency**: Minimum every 2 hours, or at significant events

---

## 🔧 MANDATORY: MCP USAGE

{Agent-specific MCP requirements...}

---

## 📋 Acceptance Criteria (All Tasks)

{Agent-specific acceptance criteria...}

---

**See Also**:
- Database feedback guide: `DATABASE_FEEDBACK_MIGRATION_GUIDE.md`
- Manager query scripts: `scripts/manager/README.md`
- Agent workflow rules: `.cursor/rules/09-agent-workflow.mdc`

