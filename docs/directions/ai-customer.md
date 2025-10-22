# AI-Customer Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:10Z  
**Version**: 7.0  
**Status**: ACTIVE — Testing + Grading Improvements (Maintenance)

---

## ✅ AI-CUSTOMER-006 THROUGH 012 COMPLETE

**Completed** (from feedback/ai-customer/2025-10-21.md):
- ✅ AI-CUSTOMER-006: Grading UI verified
- ✅ AI-CUSTOMER-007: CEO Agent KB integration
- ✅ AI-CUSTOMER-008: CEO Agent action execution
- ✅ AI-CUSTOMER-009: CEO Agent memory service
- ✅ AI-CUSTOMER-010: CEO Agent approval adapter
- ✅ AI-CUSTOMER-012: CEO Agent monitoring

**Status**: 90% complete (9/10 tasks), testing deferred

---

## 🎯 NEW: Growth Engine Architecture (Effective 2025-10-21)

**Context**: Growth Engine Final Pack integrated into project (commit: 546bd0e)

### Production Agent Model
- **Customer-Front Agent**: CX triage → transfer to sub-agents → compose redacted reply → HITL approval
- **CEO-Front Agent**: Business queries → read-only Storefront + Action Queue → evidence-only responses

### Security & Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL** (code changes): `artifacts/ai-customer/<date>/mcp/<tool>.jsonl`
2. **Heartbeat NDJSON** (tasks >2h): `artifacts/ai-customer/<date>/heartbeat.ndjson` (15min max staleness)
3. **Dev MCP Ban**: NO Dev MCP imports in `app/` (production code only)
4. **PR Template**: Must include MCP Evidence + Heartbeat + Dev MCP Check sections

**See**: `.cursor/rules/10-growth-engine-pack.mdc` for full requirements

---

## ✅ AI-CUSTOMER-014 COMPLETE (2025-10-21)

**Task**: Grading System Enhancements

**Completed**:
- ✅ Updated grading logic in `app/services/approval/grading.server.ts`
- ✅ Enhanced scoring algorithm with confidence metrics
- ✅ Testing complete (17 tests passing)

**Evidence**: Feedback log with test results

**Completed**: 2025-10-21T17:15Z

---

## 🔄 CROSS-FUNCTIONAL SUPPORT WORK (3 hours) — START NOW

**Strategic Deployment**: Support QA and Pilot with grading expertise and test scenarios

---

### AI-CUSTOMER-015: Approval Queue Test Scenarios (2h) — P1

**Objective**: Help QA (QA-009) by creating comprehensive test scenarios for approval queue and grading

**Owner**: AI-Customer (grading + approval expert)  
**Beneficiary**: QA + Pilot

**Deliverables**:
1. **Approval Queue Test Scenarios** (`docs/ai-customer/approval-queue-test-scenarios.md`):
   - Draft → Pending Review → Approved → Applied flow
   - Grading scenarios (1-5 scale for tone/accuracy/policy)
   - Edge cases: malformed data, timeout, concurrent approvals
   - Rollback scenarios
   
2. **Grading Test Data** (`artifacts/ai-customer/2025-10-21/test-grading-data.json`):
   - 20 sample replies with expected grades (1-5)
   - Poor examples (1-2 grades) with clear issues
   - Good examples (4-5 grades) with quality indicators
   - Edge cases (missing fields, invalid scores)

**Dependencies**: None (can start immediately)

**Acceptance**: ✅ Test scenarios created (400+ lines), ✅ QA can use for testing

---

### AI-CUSTOMER-016: Pilot Smoke Test Support (1h) — P2

**Objective**: Help Pilot with CEO Agent UI smoke testing

**Owner**: AI-Customer  
**Beneficiary**: Pilot

**Deliverables**:
- **CEO Agent Smoke Test Guide** (`docs/ai-customer/ceo-agent-smoke-test-guide.md`):
  - Quick validation steps (5-10 min smoke test)
  - Expected behaviors for each feature
  - Pass/fail criteria
  - Known issues to ignore

**Dependencies**: None (can start immediately)

**Acceptance**: ✅ Smoke test guide created, ✅ Pilot can execute

---

### AI-CUSTOMER-011: CEO Agent Testing Suite (DEFERRED - Low Priority)

**Objective**: 75+ comprehensive tests for CEO Agent functionality (NOT urgent)

**Test Areas**:

1. **Tool Calling** (1h):
   - Test all 7 CEO Agent tools (Shopify orders, products, customers; Supabase analytics; Chatwoot; LlamaIndex; GA)
   - Test tool execution success/failure
   - Test error handling
   - Test rate limiting

2. **KB Integration** (1h):
   - Test query_knowledge_base tool
   - Test answer + sources + confidence
   - Test empty results handling
   - Test query performance

3. **Approval Workflow** (30min):
   - Test approval adapter
   - Test all 5 approval types
   - Test evidence formatting
   - Test HITL interruptions

4. **Memory & Conversations** (30min):
   - Test conversation storage
   - Test multi-turn context
   - Test summarization
   - Test conversation search

**Tests**: `tests/unit/packages/agents/ai-ceo.spec.ts`

**Acceptance**:
- ✅ 75+ tests implemented
- ✅ All test cases passing
- ✅ Coverage ≥90%
- ✅ Mock all external APIs

**MCP Required**: 
- Context7 → OpenAI Agents SDK testing patterns
- Context7 → Vitest mocking patterns

---

### AI-CUSTOMER-020: Grading System Analytics (2h)

**Objective**: Analyze grading data to improve draft quality

**Service**: `app/services/ai-customer/grading-analytics.ts` (NEW)

**Functions**:

```typescript
// Get grading trends over time
export async function getGradingTrends(days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  const grades = await prisma.approvalRecord.findMany({
    where: {
      approvedAt: { gte: since },
      tone: { not: null },
      accuracy: { not: null },
      policy: { not: null }
    },
    select: {
      tone: true,
      accuracy: true,
      policy: true,
      approvedAt: true
    },
    orderBy: { approvedAt: 'asc' }
  });
  
  // Group by week
  const weeklyAvg = groupByWeek(grades);
  
  return {
    avgTone: calculateAverage(grades.map(g => g.tone)),
    avgAccuracy: calculateAverage(grades.map(g => g.accuracy)),
    avgPolicy: calculateAverage(grades.map(g => g.policy)),
    weeklyTrends: weeklyAvg,
    totalGrades: grades.length
  };
}

// Identify low-scoring patterns
export async function identifyLowScoringPatterns() {
  const lowScores = await prisma.approvalRecord.findMany({
    where: {
      OR: [
        { tone: { lt: 3 } },
        { accuracy: { lt: 3 } },
        { policy: { lt: 3 } }
      ]
    },
    select: {
      draftText: true,
      finalText: true,
      tone: true,
      accuracy: true,
      policy: true,
      editDistance: true
    }
  });
  
  // Analyze patterns in low-scoring drafts
  const patterns = {
    toneIssues: lowScores.filter(s => s.tone < 3),
    accuracyIssues: lowScores.filter(s => s.accuracy < 3),
    policyIssues: lowScores.filter(s => s.policy < 3)
  };
  
  return patterns;
}
```

**Deliverable**: `artifacts/ai-customer/grading-insights-2025-10-21.md`
- Grading trends (last 30 days)
- Low-scoring patterns analysis
- Recommendations for improving draft quality

**Acceptance**:
- ✅ Grading analytics service implemented
- ✅ Trends calculated
- ✅ Low-scoring patterns identified
- ✅ Insights document created

**MCP Required**: 
- Context7 → Prisma aggregations

---

### AI-CUSTOMER-021: Agent Performance Monitoring (1h)

**Objective**: Track CEO Agent + Customer Agent performance metrics

**Service**: `app/services/ai-customer/agent-performance.ts` (NEW)

**Metrics to Track**:

```typescript
interface AgentPerformanceMetrics {
  // Response Quality
  avgDraftGrade: number; // 1-5 scale
  draftApprovalRate: number; // % drafts approved without edits
  
  // Response Time
  avgDraftGenerationTime: number; // seconds
  avgApprovalTime: number; // minutes (operator review time)
  
  // Throughput
  draftsGenerated: number;
  draftsApproved: number;
  draftsRejected: number;
  draftsEdited: number;
  
  // Learning
  avgEditDistance: number; // Levenshtein distance
  improvementTrend: 'improving' | 'stable' | 'declining';
}

export async function getAgentPerformance(
  agent: 'customer' | 'ceo',
  days: number = 7
): Promise<AgentPerformanceMetrics>;
```

**Dashboard Integration**: Display on CEO Agent tile

**Acceptance**:
- ✅ Performance monitoring service implemented
- ✅ All metrics tracked
- ✅ Dashboard displays metrics

**MCP Required**: 
- Context7 → TypeScript algorithms

---

## 📋 Acceptance Criteria (All Tasks)

### Testing + Improvements (6h)
- ✅ AI-CUSTOMER-011: CEO Agent testing suite (75+ tests)
- ✅ AI-CUSTOMER-020: Grading analytics (trends, patterns, insights)
- ✅ AI-CUSTOMER-021: Agent performance monitoring (metrics, dashboard)
- ✅ All tests passing
- ✅ TypeScript clean

---

## 🔧 Tools & Resources

### MCP Tools (MANDATORY)
1. **Context7 MCP**: For all development
   - OpenAI Agents SDK testing
   - Vitest mocking
   - Prisma aggregations
   - TypeScript algorithms

2. **Web Search**: LAST RESORT ONLY

### Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL**: `artifacts/ai-customer/<date>/mcp/testing-improvements.jsonl`
2. **Heartbeat NDJSON**: `artifacts/ai-customer/<date>/heartbeat.ndjson` (append every 15min if >2h)
3. **PR Template**: Fill out all sections

---

## 🎯 Execution Order

**START NOW** - No idle time:

1. **AI-CUSTOMER-011**: Testing Suite (3h) → START IMMEDIATELY
2. **AI-CUSTOMER-020**: Grading Analytics (2h)
3. **AI-CUSTOMER-021**: Performance Monitoring (1h)

**Total**: 6 hours

**Expected Output**:
- 75+ tests
- 2 new services (~400-500 lines)
- Grading insights document

---

## 🚨 Critical Reminders

1. **NO IDLE**: Start AI-CUSTOMER-011 immediately
2. **MCP FIRST**: Pull Context7 docs
3. **Evidence**: Create artifacts/ and log MCP calls
4. **Feedback**: Update every 2 hours

**Let's build! 🤖**

---


## 📊 MANDATORY: Progress Reporting (Database Feedback)

**Report progress via `logDecision()` every 2 hours minimum OR at task milestones.**

### Basic Usage

```typescript
import { logDecision } from '~/services/decisions.server';

// When starting a task
await logDecision({
  scope: 'build',
  actor: 'ai-customer',
  taskId: '{TASK-ID}',              // Task ID from this direction file
  status: 'in_progress',            // pending | in_progress | completed | blocked | cancelled
  progressPct: 0,                   // 0-100 percentage
  action: 'task_started',
  rationale: 'Starting {task description}',
  evidenceUrl: 'docs/directions/ai-customer.md',
  durationEstimate: 4.0             // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: 'build',
  actor: 'ai-customer',
  taskId: '{TASK-ID}',
  status: 'in_progress',
  progressPct: 50,                  // Update progress
  action: 'task_progress',
  rationale: 'Component implemented, writing tests',
  evidenceUrl: 'artifacts/ai-customer/2025-10-22/{task}.md',
  durationActual: 2.0,              // Hours spent so far
  nextAction: 'Complete integration tests'
});

// When completed
await logDecision({
  scope: 'build',
  actor: 'ai-customer',
  taskId: '{TASK-ID}',
  status: 'completed',              // CRITICAL for manager queries
  progressPct: 100,
  action: 'task_completed',
  rationale: '{Task name} complete, {X}/{X} tests passing',
  evidenceUrl: 'artifacts/ai-customer/2025-10-22/{task}-complete.md',
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
  actor: 'ai-customer',
  taskId: '{TASK-ID}',
  status: 'blocked',                // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: 'Waiting for {dependency} to complete',
  blockedBy: '{DEPENDENCY-TASK-ID}',  // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: 'task_blocked',
  rationale: 'Cannot proceed because {reason}',
  evidenceUrl: 'feedback/ai-customer/2025-10-22.md'
});
```

### Manager Visibility

Manager runs these scripts to see your work instantly:
- `query-blocked-tasks.ts` - Shows if you're blocked and why
- `query-agent-status.ts` - Shows your current task and progress  
- `query-completed-today.ts` - Shows your completed work

**This is why structured logging is MANDATORY** - Manager can see status across all 17 agents in <10 seconds.

### Markdown Backup (Optional)

You can still write to `feedback/ai-customer/2025-10-22.md` for detailed notes, but database is the primary method.

---
## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'ai-customer',
  action: 'task_completed',
  rationale: 'Task description with test results',
  evidenceUrl: 'artifacts/ai-customer/2025-10-21/task-complete.md'
});
```

Call at EVERY task completion. 100% DB protection active.
