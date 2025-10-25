# Content Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**

```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:15Z  
**Version**: 7.0  
**Status**: ACTIVE — Phase 11 CX Theme Implementation (Growth Engine)

## ✅ ALL PREVIOUS CONTENT TASKS COMPLETE

- ✅ CONTENT-004-008: Social/SEO/ads templates (2,521 lines)

## 🔄 CROSS-FUNCTIONAL SUPPORT WORK (4 hours) — START NOW

**Strategic Deployment**: Support Engineer and Product with UX copy

### CONTENT-020: PII Card UX Copy (2h) — P1

**Objective**: Help Engineer (ENG-029, ENG-030) by writing user-facing copy for PII Card component

**Owner**: Content (UX writing expert)  
**Beneficiary**: Engineer

**Deliverables**:

1. **PII Card Labels & Tooltips** (`docs/content/pii-card-ux-copy.md`):
   - Section headers ("Customer Details", "Order Information", "Shipping Status")
   - Field labels with clarity ("Last 4 Order ID", "Masked Email", "Tracking Status")
   - Tooltips explaining why data is masked ("Full email visible to operator only")
   - Help text for operators ("This information is NOT sent to customer")

2. **CX Escalation Modal Copy**:
   - Modal title and description
   - "Public Reply" section header + help text
   - "Operator-Only Details" section header + help text
   - Button labels ("Send Reply", "Save Draft", "Cancel")
   - Confirmation messages

**Dependencies**: Engineer completes ENG-029/ENG-030

**Acceptance**: ✅ UX copy complete (200+ lines), ✅ Engineer can integrate

---

### CONTENT-021: Vendor Management Help Text (1h) — P2

**Objective**: Help Product (PRODUCT-016) by writing help text for vendor management UI

**Owner**: Content  
**Beneficiary**: Product + Engineer

**Deliverables**:

- **Vendor UI Copy** (`docs/content/vendor-management-copy.md`):
  - Field labels and placeholders
  - Tooltip help text ("Reliability score = on-time deliveries / total deliveries")
  - Empty state messages ("No vendors yet. Add your first supplier to get started.")
  - Validation error messages ("Lead time must be between 1-365 days")
  - Success/confirmation messages

**Dependencies**: Product completes PRODUCT-016 UI spec

**Acceptance**: ✅ Help text created, ✅ Clear operator guidance

---

### CONTENT-022: CI Guards Documentation Copy (1h) — P2

**Objective**: Help Support (SUPPORT-010) by polishing CI Guards runbook copy

**Owner**: Content  
**Beneficiary**: Support + DevOps

**Deliverables**:

- **Runbook Copy Review** (`artifacts/content/2025-10-21/ci-guards-copy-review.md`):
  - Review Support's runbook draft
  - Improve clarity, consistency, tone
  - Add examples and code snippets
  - Ensure actionable instructions

**Dependencies**: Support completes SUPPORT-010 runbook

**Acceptance**: ✅ Copy review complete, ✅ Support can refine runbook

---

## 🚀 PHASE 11: CX Theme Implementation (6h) — P2 PRIORITY

**⏸️ BLOCKED**: Waiting for Product (PRODUCT-015) CX theme Action cards

### CONTENT-019: Implement CX Theme Content (6h)

**Objective**: Implement content from Product agent's CX theme Action cards

**Work**: Size charts, installation guides, dimensions, warranty sections

**MCP Required**: Shopify Dev MCP → productUpdate mutations

**Acceptance**: ✅ Content implemented, ✅ Tests passing

---

##🔧 MCP Tools: Shopify Dev MCP (first), Context7 (second)

## 🚨 Evidence: JSONL + heartbeat required

---

## 📊 MANDATORY: Progress Reporting (Database Feedback)

**Report progress via `logDecision()` every 2 hours minimum OR at task milestones.**

### Basic Usage

```typescript
import { logDecision } from "~/services/decisions.server";

// When starting a task
await logDecision({
  scope: "build",
  actor: "content",
  taskId: "{TASK-ID}", // Task ID from this direction file
  status: "in_progress", // pending | in_progress | completed | blocked | cancelled
  progressPct: 0, // 0-100 percentage
  action: "task_started",
  rationale: "Starting {task description}",
  evidenceUrl: "docs/directions/content.md",
  durationEstimate: 4.0, // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: "build",
  actor: "content",
  taskId: "{TASK-ID}",
  status: "in_progress",
  progressPct: 50, // Update progress
  action: "task_progress",
  rationale: "Component implemented, writing tests",
  evidenceUrl: "artifacts/content/2025-10-22/{task}.md",
  durationActual: 2.0, // Hours spent so far
  nextAction: "Complete integration tests",
});

// When completed
await logDecision({
  scope: "build",
  actor: "content",
  taskId: "{TASK-ID}",
  status: "completed", // CRITICAL for manager queries
  progressPct: 100,
  action: "task_completed",
  rationale: "{Task name} complete, {X}/{X} tests passing",
  evidenceUrl: "artifacts/content/2025-10-22/{task}-complete.md",
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
  actor: "content",
  taskId: "{TASK-ID}",
  status: "blocked", // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: "Waiting for {dependency} to complete",
  blockedBy: "{DEPENDENCY-TASK-ID}", // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: "task_blocked",
  rationale: "Cannot proceed because {reason}",
  evidenceUrl: "feedback/content/2025-10-22.md",
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
  actor: "content",
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

You can still write to `feedback/content/2025-10-22.md` for detailed notes, but database is the primary method.

---

## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from "~/services/decisions.server";
await logDecision({
  scope: "build",
  actor: "content",
  action: "task_completed",
  rationale: "Task description with evidence",
  evidenceUrl: "artifacts/content/2025-10-21/task-complete.md",
});
```

Call at EVERY task completion. 100% DB protection active.
