# Pilot Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**

```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:24Z  
**Version**: 7.0  
**Status**: ACTIVE — Phase 9-12 Smoke Testing (Reactive)

## ✅ PILOT-002 COMPLETE

- ✅ CX + Sales modals PASSED
- ⚠️ Inventory modal NOT FOUND

## 🔄 IMMEDIATE CROSS-FUNCTIONAL WORK (2 hours) — START NOW

**While waiting for Engineer**: Support QA and DevOps with testing infrastructure

### PILOT-017: QA Early Smoke Tests (1h) — P2

**Objective**: Help QA by performing early smoke tests on Phase 7-8 features

**Owner**: Pilot (smoke test expert)  
**Beneficiary**: QA

**Deliverables**:

- **Phase 7-8 Smoke Test Report** (`artifacts/pilot/2025-10-21/phase-7-8-smoke-test.md`):
  - Test analytics tiles (Social, SEO, Ads, Growth) - quick 5-min validation each
  - Test analytics modals - open/close, data display
  - Browser compatibility check (Chrome, Firefox, Safari)
  - Mobile responsiveness check (viewport resize)
  - Pass/fail with screenshots

**Dependencies**: None (Phase 7-8 already deployed to staging)

**Acceptance**: ✅ Smoke test report created, ✅ QA has early validation

---

### PILOT-018: DevOps CI Guards Testing (1h) — P1

**Objective**: Help DevOps (DEVOPS-014) by testing CI guard scripts

**Owner**: Pilot  
**Beneficiary**: DevOps

**Deliverables**:

- **CI Guards Test Report** (`artifacts/pilot/2025-10-21/ci-guards-test-report.md`):
  - Test verify-mcp-evidence.js (missing evidence, invalid JSONL, non-code change exemption)
  - Test verify-heartbeat.js (stale heartbeat, no heartbeat for long task)
  - Test dev-mcp-ban (Dev MCP in app/, Dev MCP in scripts/ - should pass)
  - Document failure messages (are they clear and actionable?)

**Dependencies**: DevOps completes DEVOPS-014 scripts

**Acceptance**: ✅ Test report created, ✅ DevOps can fix issues

---

## 🔄 WAITING ON ENGINEER: Phase 9-12 Smoke Testing (12h) — REACTIVE

**All blocked until Engineer completes Phase 9-12 work**

### PILOT-012: Phase 9 PII Card Smoke Test (2h) — ⏸️ BLOCKED

**Prerequisites**: Engineer completes Phase 9

**Test**: PII Card, CX modal split UI, redaction working

**MCP Required**: Chrome DevTools MCP (snapshots, screenshots)

**Acceptance**: ✅ Smoke test PASSED

---

### PILOT-013: Phase 10 Vendor/ALC Smoke Test (2h)

**Prerequisites**: Phase 10 complete

**Test**: Vendor dropdown, receiving workflow, ALC calculation

**Acceptance**: ✅ Smoke test PASSED

---

### PILOT-014: Phase 11 Attribution Smoke Test (2h)

**Prerequisites**: Phase 11 complete

**Test**: Action links, GA4 tracking, attribution working

**Acceptance**: ✅ Smoke test PASSED

---

### PILOT-015: Phase 12 CX Loop Smoke Test (1h)

**Prerequisites**: Phase 12 complete

**Test**: Themes detected, Actions generated

**Acceptance**: ✅ Smoke test PASSED

---

### PILOT-016: Browser/Mobile Testing (5h)

**Objective**: Test on all browsers + devices

**Acceptance**: ✅ Compatibility report complete

**START NOW**: Monitor Engineer progress, prepare Chrome DevTools MCP

---

## 🔧 MCP Tools: Chrome DevTools MCP (MANDATORY for all testing)

## 🚨 Evidence: Screenshots + snapshots required

---

## 📊 MANDATORY: Progress Reporting (Database Feedback)

**Report progress via `logDecision()` every 2 hours minimum OR at task milestones.**

### Basic Usage

```typescript
import { logDecision } from "~/services/decisions.server";

// When starting a task
await logDecision({
  scope: "build",
  actor: "pilot",
  taskId: "{TASK-ID}", // Task ID from this direction file
  status: "in_progress", // pending | in_progress | completed | blocked | cancelled
  progressPct: 0, // 0-100 percentage
  action: "task_started",
  rationale: "Starting {task description}",
  evidenceUrl: "docs/directions/pilot.md",
  durationEstimate: 4.0, // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: "build",
  actor: "pilot",
  taskId: "{TASK-ID}",
  status: "in_progress",
  progressPct: 50, // Update progress
  action: "task_progress",
  rationale: "Component implemented, writing tests",
  evidenceUrl: "artifacts/pilot/2025-10-22/{task}.md",
  durationActual: 2.0, // Hours spent so far
  nextAction: "Complete integration tests",
});

// When completed
await logDecision({
  scope: "build",
  actor: "pilot",
  taskId: "{TASK-ID}",
  status: "completed", // CRITICAL for manager queries
  progressPct: 100,
  action: "task_completed",
  rationale: "{Task name} complete, {X}/{X} tests passing",
  evidenceUrl: "artifacts/pilot/2025-10-22/{task}-complete.md",
  durationEstimate: 4.0,
  durationActual: 3.5, // Compare estimate vs actual
  nextAction: "Starting {NEXT-TASK-ID}",
});
```

### When Blocked (CRITICAL)

**Manager queries blocked tasks FIRST during consolidation**:

```typescript
await logDecision({
  scope: "build",
  actor: "pilot",
  taskId: "{TASK-ID}",
  status: "blocked", // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: "Waiting for {dependency} to complete",
  blockedBy: "{DEPENDENCY-TASK-ID}", // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: "task_blocked",
  rationale: "Cannot proceed because {reason}",
  evidenceUrl: "feedback/pilot/2025-10-22.md",
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
import { calculateSelfGradeAverage } from "~/services/decisions.server";

const grades = {
  progress: 5, // 1-5: Progress vs DoD
  evidence: 4, // 1-5: Evidence quality
  alignment: 5, // 1-5: Followed North Star/Rules
  toolDiscipline: 5, // 1-5: MCP-first, no guessing
  communication: 4, // 1-5: Clear updates, timely blockers
};

await logDecision({
  scope: "build",
  actor: "pilot",
  action: "shutdown",
  status: "in_progress", // or 'completed' if all tasks done
  progressPct: 75, // Overall daily progress
  rationale: "Daily shutdown - {X} tasks completed, {Y} in progress",
  durationActual: 6.5, // Total hours today
  payload: {
    dailySummary: "{TASK-A} complete, {TASK-B} at 75%",
    selfGrade: {
      ...grades,
      average: calculateSelfGradeAverage(grades),
    },
    retrospective: {
      didWell: ["Used MCP first", "Good test coverage"],
      toChange: ["Ask questions earlier"],
      toStop: "Making assumptions",
    },
    tasksCompleted: ["{TASK-ID-A}", "{TASK-ID-B}"],
    hoursWorked: 6.5,
  },
});
```

### Markdown Backup (Optional)

You can still write to `feedback/pilot/2025-10-22.md` for detailed notes, but database is the primary method.

---

## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from "~/services/decisions.server";
await logDecision({
  scope: "build",
  actor: "pilot",
  action: "task_completed",
  rationale: "Task description with test results",
  evidenceUrl: "artifacts/pilot/2025-10-21/task-complete.md",
});
```

Call at EVERY task completion. 100% DB protection active.
