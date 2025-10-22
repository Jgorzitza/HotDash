# SEO Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:18Z  
**Version**: 7.0  
**Status**: ✅ ALL TASKS COMPLETE — MAINTENANCE MODE (No new work assigned)

## ✅ SEO-007 THROUGH 010 COMPLETE (Phases 1-8)
- ✅ Automated audits, cannibalization, schema, Search Console (1,965 lines)

## ✅ SEO-018 COMPLETE (2025-10-21)

**Task**: Automated Content Optimization (3h)

**Completed**:
- ✅ Service: `app/services/seo/content-optimizer.ts` verified
- ✅ 20 tests created and passing
- ✅ Content quality analysis implemented (Flesch reading ease, keyword density, heading structure, internal linking, image alt text, SEO score)

**Evidence**: Tests in `tests/unit/services/seo/content-optimizer.spec.ts`

---

## ✅ SEO-019 COMPLETE (2025-10-21)

**Task**: Core Web Vitals Monitoring (3h)

**Completed**:
- ✅ Service: `app/services/seo/core-web-vitals.ts` verified
- ✅ 22 tests created and passing
- ✅ LCP, FID, CLS tracking implemented

**Evidence**: Tests in `tests/unit/services/seo/core-web-vitals.spec.ts`

---

## ✅ SEO-020 COMPLETE (2025-10-21)

**Task**: Internal Linking Service (2h)

**Completed**:
- ✅ Service: `app/services/seo/internal-linking.ts` verified
- ✅ 22 tests created and passing
- ✅ Orphan page detection, link suggestions, page authority calculation implemented

**Evidence**: Tests in `tests/unit/services/seo/internal-linking.spec.ts`

---

## ✅ SEO-021 COMPLETE (2025-10-21)

**Task**: Testing + Documentation (4h)

**Completed**:
- ✅ 64 tests total (all passing)
- ✅ Comprehensive test coverage

**Evidence**: Feedback log with test results

**Completed**: 2025-10-21T22:50:48Z

---

## 🔄 CROSS-FUNCTIONAL SUPPORT WORK (3 hours) — START NOW

**Strategic Deployment**: Support Content and Analytics with SEO expertise

### SEO-022: Content Optimization Review (2h) — P2

**Objective**: Help Content agent (CONTENT-015) by applying SEO optimization to generated content

**Owner**: SEO (optimization expert)  
**Beneficiary**: Content

**Deliverables**:
1. **Content SEO Audit** (`artifacts/seo/2025-10-21/content-audit.md`):
   - Review CX theme content for SEO quality
   - Apply content-optimizer service to all generated content
   - Recommend improvements (keyword density, readability, headers)

2. **SEO Guidelines for Content Generation**:
   - Best practices doc for Content agent
   - Target metrics (Flesch score >60, keyword density 1-3%)
   - Internal linking strategy for CX content

**Dependencies**: Content generates CX theme content (CONTENT-015)

**Acceptance**: ✅ Content audit complete, ✅ Guidelines created

---

### SEO-023: GA4 Action Attribution Documentation (1h) — P1

**Objective**: Help Analytics (ANALYTICS-017) by documenting GA4 custom dimension setup

**Owner**: SEO (GA4 expert)  
**Beneficiary**: Analytics + DevOps

**Deliverables**:
1. **GA4 Custom Dimension Setup Guide** (`docs/seo/ga4-custom-dimensions.md`):
   - How to create `hd_action_key` custom dimension in GA4 Property 339826228
   - Event scope vs user scope (event scope for action tracking)
   - Testing and validation steps
   
2. **Shopify Web Pixel Integration**:
   - How Shopify's native GA4 already sends purchase/add_to_cart events
   - How to piggyback on existing events with custom dimensions
   - Code snippets for Web Pixel implementation

**Dependencies**: None (can start immediately)

**Acceptance**: ✅ Setup guide created (200+ lines), ✅ Analytics can implement

---

**Total Assigned**: 3 hours supporting Content and Analytics  
**Priority**: P1-P2  
**Start**: SEO-023 (immediate), SEO-022 (when Content has output)

---

## 🔧 MCP Tools: Context7 (first), Web search (PageSpeed API only)
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
  actor: 'seo',
  taskId: '{TASK-ID}',              // Task ID from this direction file
  status: 'in_progress',            // pending | in_progress | completed | blocked | cancelled
  progressPct: 0,                   // 0-100 percentage
  action: 'task_started',
  rationale: 'Starting {task description}',
  evidenceUrl: 'docs/directions/seo.md',
  durationEstimate: 4.0             // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: 'build',
  actor: 'seo',
  taskId: '{TASK-ID}',
  status: 'in_progress',
  progressPct: 50,                  // Update progress
  action: 'task_progress',
  rationale: 'Component implemented, writing tests',
  evidenceUrl: 'artifacts/seo/2025-10-22/{task}.md',
  durationActual: 2.0,              // Hours spent so far
  nextAction: 'Complete integration tests'
});

// When completed
await logDecision({
  scope: 'build',
  actor: 'seo',
  taskId: '{TASK-ID}',
  status: 'completed',              // CRITICAL for manager queries
  progressPct: 100,
  action: 'task_completed',
  rationale: '{Task name} complete, {X}/{X} tests passing',
  evidenceUrl: 'artifacts/seo/2025-10-22/{task}-complete.md',
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
  actor: 'seo',
  taskId: '{TASK-ID}',
  status: 'blocked',                // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: 'Waiting for {dependency} to complete',
  blockedBy: '{DEPENDENCY-TASK-ID}',  // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: 'task_blocked',
  rationale: 'Cannot proceed because {reason}',
  evidenceUrl: 'feedback/seo/2025-10-22.md'
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
  actor: 'seo',
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

You can still write to `feedback/seo/2025-10-22.md` for detailed notes, but database is the primary method.

---
## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'seo',
  action: 'task_completed',
  rationale: 'Task description with evidence',
  evidenceUrl: 'artifacts/seo/2025-10-21/task-complete.md'
});
```

Call at EVERY task completion. 100% DB protection active.
