# Support Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:22Z  
**Version**: 7.0  
**Status**: ✅ ALL TASKS COMPLETE — MAINTENANCE MODE (No new work assigned)

## ✅ SUPPORT-001-007 COMPLETE (Phases 1-8)
- ✅ Email + Live Chat tested (85 conversations, 1,500+ lines docs)
- ⚠️ SMS blocked on Twilio credentials

## ✅ SUPPORT-008 COMPLETE (2025-10-21)

**Task**: Growth Engine CX Workflow Documentation (8h)

**Completed Deliverables**:

1. ✅ **Customer-Front Agent Workflow** (2h)
   - Triage → transfer_to_accounts OR transfer_to_storefront
   - Sub-agent execution
   - PII Broker redaction
   - HITL approval

2. ✅ **PII Card Usage Guide** (2h)
   - When to use PII Card vs public reply
   - Security best practices
   - Operator training materials

3. ✅ **Grading Best Practices** (2h)
   - How to grade (tone/accuracy/policy)
   - Examples of 1-5 scores
   - Impact of grading on AI learning

4. ✅ **CX SLA Documentation** (2h)
   - 15-minute review SLA (business hours)
   - Escalation procedures
   - Performance tracking

**Evidence**: `docs/support/growth-engine-cx-workflows.md` (1,669 lines, commits bdc9541, 08cf517)

**Completed**: 2025-10-21T17:50Z

---

## 🔄 CROSS-FUNCTIONAL SUPPORT WORK (3-4 hours) — START NOW

**Strategic Deployment**: Support Engineer, QA, and DevOps with documentation

### SUPPORT-009: PII Card Testing Documentation (2h) — P1

**Objective**: Help Engineer (ENG-029) by creating comprehensive test documentation

**Owner**: Support (documentation expert)  
**Beneficiary**: Engineer + QA

**Deliverables**:
1. **Test Scenarios Document** (`docs/support/pii-card-test-scenarios.md`):
   - Edge cases: null values, malformed data, special characters
   - Security tests: verify NO full PII in redacted output
   - Integration tests: PII Card + public reply split
   - Performance: redaction function benchmarks

2. **Operator Testing Checklist** (for QA-009):
   - Step-by-step manual testing guide
   - Expected vs actual results template
   - Accessibility testing checklist (screen reader, keyboard nav)

**Dependencies**: Engineer completes ENG-029 (PII Card component)

**Acceptance**: ✅ Test docs created (500+ lines), ✅ QA can use for testing

---

### SUPPORT-010: CI Guards Runbook (1.5h) — P1

**Objective**: Help DevOps (DEVOPS-014) by documenting CI guard setup and troubleshooting

**Owner**: Support (runbook expert)  
**Beneficiary**: DevOps + All agents

**Deliverables**:
1. **CI Guards Setup Runbook** (`docs/runbooks/ci-guards-setup.md`):
   - MCP Evidence JSONL: How to create, validate, common errors
   - Heartbeat NDJSON: When required, format, staleness check
   - Dev MCP Ban: What to check, how to fix violations
   
2. **Troubleshooting Guide**:
   - "MCP Evidence missing" → How to fix
   - "Heartbeat stale" → How to update
   - "Dev MCP detected" → How to remove from app/

**Dependencies**: DevOps completes DEVOPS-014 (scripts available)

**Acceptance**: ✅ Runbook created (300+ lines), ✅ Agents can self-serve

---

### SUPPORT-011: QA Test Documentation Support (30min) — P2

**Objective**: Help QA create standardized test documentation format

**Owner**: Support  
**Beneficiary**: QA

**Deliverables**:
- Test documentation template (pass/fail format)
- Evidence logging guidelines for QA
- Bug report template for Growth Engine features

**Dependencies**: None (can start immediately)

**Acceptance**: ✅ Templates created, ✅ QA adopts format

---

**Total Assigned**: 4 hours supporting Engineer, DevOps, QA  
**Priority**: P1 (unblock other agents)  
**Start**: SUPPORT-011 (immediate), SUPPORT-009/010 (when dependencies ready)

---

## 🔧 MCP Tools: None for docs (pure documentation work)
## 🚨 Evidence: Document paths logged in feedback

---


## 📊 MANDATORY: Progress Reporting (Database Feedback)

**Report progress via `logDecision()` every 2 hours minimum OR at task milestones.**

### Basic Usage

```typescript
import { logDecision } from '~/services/decisions.server';

// When starting a task
await logDecision({
  scope: 'build',
  actor: 'support',
  taskId: '{TASK-ID}',              // Task ID from this direction file
  status: 'in_progress',            // pending | in_progress | completed | blocked | cancelled
  progressPct: 0,                   // 0-100 percentage
  action: 'task_started',
  rationale: 'Starting {task description}',
  evidenceUrl: 'docs/directions/support.md',
  durationEstimate: 4.0             // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: 'build',
  actor: 'support',
  taskId: '{TASK-ID}',
  status: 'in_progress',
  progressPct: 50,                  // Update progress
  action: 'task_progress',
  rationale: 'Component implemented, writing tests',
  evidenceUrl: 'artifacts/support/2025-10-22/{task}.md',
  durationActual: 2.0,              // Hours spent so far
  nextAction: 'Complete integration tests'
});

// When completed
await logDecision({
  scope: 'build',
  actor: 'support',
  taskId: '{TASK-ID}',
  status: 'completed',              // CRITICAL for manager queries
  progressPct: 100,
  action: 'task_completed',
  rationale: '{Task name} complete, {X}/{X} tests passing',
  evidenceUrl: 'artifacts/support/2025-10-22/{task}-complete.md',
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
  actor: 'support',
  taskId: '{TASK-ID}',
  status: 'blocked',                // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: 'Waiting for {dependency} to complete',
  blockedBy: '{DEPENDENCY-TASK-ID}',  // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: 'task_blocked',
  rationale: 'Cannot proceed because {reason}',
  evidenceUrl: 'feedback/support/2025-10-22.md'
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
  actor: 'support',
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

You can still write to `feedback/support/2025-10-22.md` for detailed notes, but database is the primary method.

---
## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'support',
  action: 'task_completed',
  rationale: 'Task description with evidence',
  evidenceUrl: 'artifacts/support/2025-10-21/task-complete.md'
});
```

Call at EVERY task completion. 100% DB protection active.
