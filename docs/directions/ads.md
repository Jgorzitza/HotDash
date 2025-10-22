# Ads Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:20Z  
**Version**: 7.0  
**Status**: ACTIVE — Campaign Optimization Support (Maintenance)

## ✅ ADS-001 THROUGH 004 COMPLETE
- ✅ Google Ads client, metrics, budget alerts, HITL copy (1,753 lines)
- ⚠️ BLOCKER: Google Ads credentials missing

## 🔄 ACTIVE TASKS: Campaign Optimization (8h) — MAINTENANCE MODE

### ADS-010: Google Ads Credential Setup (2h) — P1 BLOCKER

**Objective**: Obtain and test Google Ads API credentials

**Required**: CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, DEVELOPER_TOKEN, CUSTOMER_IDS

**Tasks**:
1. Check vault/occ/google/
2. If missing: Request from Manager
3. Test integration (OAuth authentication)
4. Verify rate limiting

**Acceptance**: ✅ Credentials obtained, ✅ Integration tested

---

### ADS-011: Campaign Automation + Optimization (6h)

**Objective**: Automate campaign management with HITL approval

**Tasks**:
1. Auto-pause low performers (CTR <1%, ROAS <1.0)
2. Auto-increase budgets for high performers (ROAS >3.0)
3. A/B testing for ad creatives
4. HITL approval for all actions

**MCP Required**: Web search → Google Ads API v16

**Acceptance**: ✅ Automation service implemented, ✅ Tests passing

**START NOW**: Request credentials from Manager, implement automation

---

## 🔧 MCP Tools: Web search (Google Ads API), Context7 (algorithms)
## 🚨 Evidence: JSONL + heartbeat required

---


## 📊 MANDATORY: Progress Reporting (Database Feedback)

**Report progress via `logDecision()` every 2 hours minimum OR at task milestones.**

### Basic Usage

```typescript
import { logDecision } from '~/services/decisions.server';

// When starting a task
await logDecision({
  scope: 'build',
  actor: 'ads',
  taskId: '{TASK-ID}',              // Task ID from this direction file
  status: 'in_progress',            // pending | in_progress | completed | blocked | cancelled
  progressPct: 0,                   // 0-100 percentage
  action: 'task_started',
  rationale: 'Starting {task description}',
  evidenceUrl: 'docs/directions/ads.md',
  durationEstimate: 4.0             // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: 'build',
  actor: 'ads',
  taskId: '{TASK-ID}',
  status: 'in_progress',
  progressPct: 50,                  // Update progress
  action: 'task_progress',
  rationale: 'Component implemented, writing tests',
  evidenceUrl: 'artifacts/ads/2025-10-22/{task}.md',
  durationActual: 2.0,              // Hours spent so far
  nextAction: 'Complete integration tests'
});

// When completed
await logDecision({
  scope: 'build',
  actor: 'ads',
  taskId: '{TASK-ID}',
  status: 'completed',              // CRITICAL for manager queries
  progressPct: 100,
  action: 'task_completed',
  rationale: '{Task name} complete, {X}/{X} tests passing',
  evidenceUrl: 'artifacts/ads/2025-10-22/{task}-complete.md',
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
  actor: 'ads',
  taskId: '{TASK-ID}',
  status: 'blocked',                // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: 'Waiting for {dependency} to complete',
  blockedBy: '{DEPENDENCY-TASK-ID}',  // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: 'task_blocked',
  rationale: 'Cannot proceed because {reason}',
  evidenceUrl: 'feedback/ads/2025-10-22.md'
});
```

### Manager Visibility

Manager runs these scripts to see your work instantly:
- `query-blocked-tasks.ts` - Shows if you're blocked and why
- `query-agent-status.ts` - Shows your current task and progress  
- `query-completed-today.ts` - Shows your completed work

**This is why structured logging is MANDATORY** - Manager can see status across all 17 agents in <10 seconds.


### Daily Shutdown (with Self-Grading)

**At end of day, log shutdown with self-assessment**:

```typescript
import { calculateSelfGradeAverage } from '~/services/decisions.server';

const grades = {
  progress: 5,        // 1-5: Progress vs DoD
  evidence: 4,        // 1-5: Evidence quality
  alignment: 5,       // 1-5: Followed North Star/Rules
  toolDiscipline: 5,  // 1-5: MCP-first, no guessing
  communication: 4    // 1-5: Clear updates, timely blockers
};

await logDecision({
  scope: 'build',
  actor: 'ads',
  action: 'shutdown',
  status: 'in_progress',  // or 'completed' if all tasks done
  progressPct: 75,        // Overall daily progress
  rationale: 'Daily shutdown - {X} tasks completed, {Y} in progress',
  durationActual: 6.5,    // Total hours today
  payload: {
    dailySummary: '{TASK-A} complete, {TASK-B} at 75%',
    selfGrade: {
      ...grades,
      average: calculateSelfGradeAverage(grades)
    },
    retrospective: {
      didWell: ['Used MCP first', 'Good test coverage'],
      toChange: ['Ask questions earlier'],
      toStop: 'Making assumptions'
    },
    tasksCompleted: ['{TASK-ID-A}', '{TASK-ID-B}'],
    hoursWorked: 6.5
  }
});
```

### Markdown Backup (Optional)

You can still write to `feedback/ads/2025-10-22.md` for detailed notes, but database is the primary method.

---
## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'ads',
  action: 'task_completed',
  rationale: 'Task description with evidence',
  evidenceUrl: 'artifacts/ads/2025-10-21/task-complete.md'
});
```

Call at EVERY task completion. 100% DB protection active.
