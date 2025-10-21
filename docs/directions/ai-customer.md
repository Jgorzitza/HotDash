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

## 🔄 ACTIVE TASKS: Testing + Improvements (6 hours) — MAINTENANCE MODE

**Objective**: Complete testing + improve grading system quality

---

### AI-CUSTOMER-011: CEO Agent Testing Suite (3h) — DEFERRED WORK

**Objective**: 75+ tests for CEO Agent functionality

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
