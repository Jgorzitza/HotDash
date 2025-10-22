# Analytics Direction v8.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T16:35Z  
**Version**: 8.0  
**Status**: ACTIVE — Phase 11 Action Attribution + Search Console Persistence (Growth Engine)

---

## ✅ ALL PREVIOUS ANALYTICS TASKS COMPLETE

**Completed** (from feedback/analytics/2025-10-21.md):
- ✅ ANALYTICS-006 through 009: Social, SEO, Ads, Growth metrics (2,800 lines, 94/94 tests)
- ✅ ANALYTICS-010: CSV/Excel exports (streaming, all 4 areas)
- ✅ ANALYTICS-011: Multi-project aggregation (agency view)
- ✅ ANALYTICS-012: Trend forecasting (linear regression, confidence intervals)
- ✅ ANALYTICS-013: Anomaly detection (Z-score, alerts)
- ✅ ANALYTICS-014: Scheduled reports (daily/weekly/monthly)
- ✅ ANALYTICS-015: Data validation (quality score 0-100)

**Total Output**: ~3,500 lines, 147 tests passing, all React Router 7 compliant

**Lesson Learned**: React Router 7 violation corrected by Manager (commit 19c09b3) - use `Response.json()` NOT `json()`

---

## 🎯 NEW: Growth Engine Architecture (Effective 2025-10-21)

**Context**: Growth Engine Final Pack integrated into project (commit: 546bd0e)

### Security & Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL** (code changes): `artifacts/analytics/<date>/mcp/<tool>.jsonl`
2. **Heartbeat NDJSON** (tasks >2h): `artifacts/analytics/<date>/heartbeat.ndjson` (15min max staleness)
3. **Dev MCP Ban**: NO Dev MCP imports in `app/` (production code only)
4. **PR Template**: Must include MCP Evidence + Heartbeat + Dev MCP Check sections

**See**: `.cursor/rules/10-growth-engine-pack.mdc` for full requirements

---

## 🔄 IMMEDIATE CROSS-FUNCTIONAL WORK (2 hours) — START NOW

**While waiting for BLOCKER-002 (migrations)**: Support Data and Integrations

### ANALYTICS-019: Search Console Schema Review (1h) — P1

**Objective**: Help Data (DATA-020) by reviewing Search Console metrics table schema

**Owner**: Analytics (data modeling expert)  
**Beneficiary**: Data

**Deliverables**:
- **Schema Review** (`artifacts/analytics/2025-10-21/search-console-schema-review.md`):
  - Review DATA-020 tables (seo_search_console_metrics, seo_search_queries, seo_landing_pages)
  - Validate columns match Search Console API response
  - Recommend indexes for performance
  - Suggest aggregation queries for dashboard

**Dependencies**: None (can review migrations now)

**Acceptance**: ✅ Review complete, ✅ Data can refine schema

---

### ANALYTICS-020: Telemetry Documentation (1h) — P2

**Objective**: Help Integrations with telemetry implementation documentation

**Owner**: Analytics  
**Beneficiary**: Integrations + DevOps

**Deliverables**:
- **Telemetry Guide** (`docs/analytics/telemetry-implementation.md`):
  - GA4 Property 339826228 setup
  - Event tracking best practices
  - Custom dimension guidelines
  - Testing and validation

**Dependencies**: None (can start immediately)

**Acceptance**: ✅ Telemetry guide created (200+ lines)

---

## 🚀 PHASE 11: Action Attribution + Search Console Persistence (8 hours) — P0 CRITICAL

**⚠️ BLOCKED**: Waiting for BLOCKER-002 (migrations applied)

### Context

**Action Attribution** (CEO stated CRITICAL, not nice-to-have):
- GA4 custom dimension `hd_action_key` tracks actions → revenue
- Query GA4 for ROI (7d/14d/28d windows)
- Re-rank Action Queue based on realized performance

**Search Console Persistence** (fill gap):
- Search Console API works (`app/lib/seo/search-console.ts`) but data NOT stored
- In-memory cache only (5min TTL), no historical tracking
- Data agent created tables (DATA-021)
- Analytics builds storage service

---

### ANALYTICS-017: Action Attribution Service (5h)

**File**: `app/services/analytics/action-attribution.ts` (NEW)

**Purpose**: Query GA4 for action ROI and re-rank Action Queue

**Prerequisites**:
- ✅ DevOps creates GA4 custom dimension `hd_action_key` (event scope) - Property 339826228
- ✅ Engineer implements client tracking (ENG-032, 033)

**GA4 Data API Query**:

```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const GA4_PROPERTY_ID = '339826228';

interface ActionAttributionResult {
  actionKey: string;
  periodDays: number; // 7, 14, or 28
  sessions: number;
  pageviews: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  averageOrderValue: number;
  realizedROI: number; // Actual revenue generated
}

// Query GA4 for action performance
export async function getActionAttribution(
  actionKey: string,
  periodDays: 7 | 14 | 28
): Promise<ActionAttributionResult> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);
  
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [{
      startDate: startDate.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }],
    dimensions: [
      { name: 'customEvent:hd_action_key' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'addToCarts' },
      { name: 'ecommercePurchases' },
      { name: 'totalRevenue' }
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'customEvent:hd_action_key',
        stringFilter: {
          value: actionKey,
          matchType: 'EXACT'
        }
      }
    }
  });
  
  if (!response.rows || response.rows.length === 0) {
    return {
      actionKey,
      periodDays,
      sessions: 0,
      pageviews: 0,
      addToCarts: 0,
      purchases: 0,
      revenue: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      realizedROI: 0
    };
  }
  
  const row = response.rows[0];
  const sessions = parseInt(row.metricValues[0].value || '0');
  const pageviews = parseInt(row.metricValues[1].value || '0');
  const addToCarts = parseInt(row.metricValues[2].value || '0');
  const purchases = parseInt(row.metricValues[3].value || '0');
  const revenue = parseFloat(row.metricValues[4].value || '0');
  
  return {
    actionKey,
    periodDays,
    sessions,
    pageviews,
    addToCarts,
    purchases,
    revenue,
    conversionRate: sessions > 0 ? (purchases / sessions) * 100 : 0,
    averageOrderValue: purchases > 0 ? revenue / purchases : 0,
    realizedROI: revenue
  };
}

// Update action record with realized ROI
export async function updateActionROI(
  actionId: string,
  actionKey: string
) {
  // Query all 3 windows
  const [roi7d, roi14d, roi28d] = await Promise.all([
    getActionAttribution(actionKey, 7),
    getActionAttribution(actionKey, 14),
    getActionAttribution(actionKey, 28)
  ]);
  
  // Update action_queue record
  await prisma.actionQueue.update({
    where: { id: actionId },
    data: {
      realizedRevenue7d: roi7d.revenue,
      realizedRevenue14d: roi14d.revenue,
      realizedRevenue28d: roi28d.revenue,
      conversionRate: roi28d.conversionRate,
      lastAttributionCheck: new Date()
    }
  });
  
  // Store detailed attribution in separate table
  await prisma.actionAttribution.create({
    data: {
      actionId,
      actionKey,
      periodDays: 28,
      sessions: roi28d.sessions,
      pageviews: roi28d.pageviews,
      addToCarts: roi28d.addToCarts,
      purchases: roi28d.purchases,
      revenue: roi28d.revenue,
      conversionRate: roi28d.conversionRate,
      averageOrderValue: roi28d.averageOrderValue,
      recordedAt: new Date()
    }
  });
  
  return { roi7d, roi14d, roi28d };
}

// Re-rank Action Queue based on realized ROI
export async function rerankActionQueue() {
  // Get all approved actions from last 30 days
  const actions = await prisma.actionQueue.findMany({
    where: {
      status: 'approved',
      approvedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      actionKey: { not: null }
    }
  });
  
  // Update attribution for each
  for (const action of actions) {
    if (action.actionKey) {
      await updateActionROI(action.id, action.actionKey);
      
      // Rate limit: 1 query/second (GA4 API limit)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Calculate new ranking scores (realized ROI × confidence)
  // Top actions = those that delivered actual results
  const rankedActions = await prisma.actionQueue.findMany({
    where: { status: 'pending' },
    orderBy: [
      { realizedRevenue28d: 'desc' },
      { expectedRevenue: 'desc' }
    ],
    take: 10
  });
  
  return rankedActions;
}

// Nightly job: Update attribution for all recent actions
export async function runNightlyAttributionUpdate() {
  console.log("[Attribution] Starting nightly ROI update");
  
  const result = await rerankActionQueue();
  
  console.log(`[Attribution] Updated ${result.length} actions`);
  
  // Log decision
  await logDecision({
    scope: 'ops',
    who: 'system',
    what: 'action_attribution_update',
    why: `Nightly ROI sync: ${result.length} actions updated from GA4`,
    evidenceUrl: '/api/action-queue',
    createdAt: new Date()
  });
}
```

**API Route**: `app/routes/api.actions.$id.attribution.ts`

```typescript
// GET /api/actions/:id/attribution
export async function loader({ params }: LoaderFunctionArgs) {
  const action = await prisma.actionQueue.findUnique({
    where: { id: params.id },
    include: { attributions: { orderBy: { recordedAt: 'desc' }, take: 1 } }
  });
  
  if (!action || !action.actionKey) {
    return Response.json(
      { error: "Action not found or no action key" },
      { status: 404 }
    );
  }
  
  // Get latest attribution
  const attribution = await getActionAttribution(action.actionKey, 28);
  
  return Response.json({ action, attribution });
}

// POST /api/actions/:id/attribution (refresh)
export async function action({ params }: ActionFunctionArgs) {
  const action = await prisma.actionQueue.findUnique({
    where: { id: params.id }
  });
  
  if (!action || !action.actionKey) {
    return Response.json(
      { error: "Action not found or no action key" },
      { status: 404 }
    );
  }
  
  // Refresh attribution
  const result = await updateActionROI(action.id, action.actionKey);
  
  return Response.json({ success: true, attribution: result });
}
```

**Tests**: `tests/unit/services/analytics/action-attribution.spec.ts`
- Test GA4 query (mock response)
- Test update action ROI
- Test re-rank queue (prioritize realized ROI)
- Test nightly attribution update
- Mock Google Analytics Data API

**Acceptance**:
- ✅ Action attribution service implemented
- ✅ GA4 Data API integration (custom dimension query)
- ✅ Update action ROI (3 windows: 7d, 14d, 28d)
- ✅ Re-rank Action Queue based on realized performance
- ✅ Nightly job script
- ✅ API routes (get attribution, refresh)
- ✅ Unit tests passing (100% coverage)
- ✅ Rate limiting (1 query/second for GA4 API)

**MCP Required**: 
- Context7 → Google Analytics Data API v1, TypeScript patterns
- Web search → "GA4 Data API custom dimensions query" (if Context7 doesn't have)

---

### ANALYTICS-018: Search Console Storage Service (3h)

**File**: `app/services/seo/search-console-storage.ts` (NEW)

**Purpose**: Store Search Console data to Supabase for historical tracking

**Prerequisites**:
- ✅ Data agent creates tables (DATA-021: seo_search_console_metrics, seo_search_queries, seo_landing_pages)
- ✅ Search Console API works (`app/lib/seo/search-console.ts`)

**Service Functions**:

```typescript
import prisma from "~/db.server";
import {
  getSearchAnalytics,
  getTopQueries,
  getLandingPages,
  type SearchAnalyticsMetrics,
  type TopQuery,
  type LandingPageMetrics
} from "../../lib/seo/search-console";

// Store site-wide metrics
export async function storeSearchConsoleMetrics(
  metrics: SearchAnalyticsMetrics,
  periodDays: number = 30
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  await prisma.seoSearchConsoleMetrics.upsert({
    where: {
      date_periodDays: {
        date: today,
        periodDays
      }
    },
    create: {
      date: today,
      periodDays,
      clicks: metrics.clicks,
      impressions: metrics.impressions,
      ctr: metrics.ctr,
      position: metrics.position,
      clicksChange7d: metrics.change7d.clicksChange,
      impressionsChange7d: metrics.change7d.impressionsChange,
      ctrChange7d: metrics.change7d.ctrChange,
      positionChange7d: metrics.change7d.positionChange
    },
    update: {
      clicks: metrics.clicks,
      impressions: metrics.impressions,
      ctr: metrics.ctr,
      position: metrics.position,
      clicksChange7d: metrics.change7d.clicksChange,
      impressionsChange7d: metrics.change7d.impressionsChange,
      ctrChange7d: metrics.change7d.ctrChange,
      positionChange7d: metrics.change7d.positionChange,
      fetchedAt: new Date()
    }
  });
}

// Store top queries
export async function storeTopQueries(
  queries: TopQuery[],
  periodDays: number = 30
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Delete existing queries for today (replace)
  await prisma.seoSearchQuery.deleteMany({
    where: { date: today, periodDays }
  });
  
  // Insert new queries
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    
    await prisma.seoSearchQuery.create({
      data: {
        date: today,
        periodDays,
        query: query.query,
        clicks: query.clicks,
        impressions: query.impressions,
        ctr: query.ctr,
        position: query.position,
        rank: i + 1
      }
    });
  }
}

// Store landing pages
export async function storeLandingPages(
  pages: LandingPageMetrics[],
  periodDays: number = 30
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Delete existing pages for today (replace)
  await prisma.seoLandingPage.deleteMany({
    where: { date: today, periodDays }
  });
  
  // Insert new pages
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    await prisma.seoLandingPage.create({
      data: {
        date: today,
        periodDays,
        url: page.url,
        clicks: page.clicks,
        impressions: page.impressions,
        ctr: page.ctr,
        position: page.position,
        clicksChange7d: page.change7dPct,
        rank: i + 1
      }
    });
  }
}

// Store complete summary (all-in-one)
export async function storeSearchConsoleSummary() {
  try {
    // 1. Fetch from Search Console API
    const [metrics, queries, pages] = await Promise.all([
      getSearchAnalytics(),
      getTopQueries(25),
      getLandingPages(25)
    ]);
    
    // 2. Store to Supabase
    await Promise.all([
      storeSearchConsoleMetrics(metrics, 30),
      storeTopQueries(queries, 30),
      storeLandingPages(pages, 30)
    ]);
    
    console.log("[Search Console] ✅ Data stored successfully");
    
    return { success: true, metrics, queries: queries.length, pages: pages.length };
  } catch (error: any) {
    console.error("[Search Console] Storage error:", error);
    throw error;
  }
}

// Historical query functions
export async function getHistoricalMetrics(days: number = 30) {
  return await prisma.seoSearchConsoleMetrics.findMany({
    where: { periodDays: 30 },
    orderBy: { date: 'desc' },
    take: days
  });
}

export async function getQueryTrend(query: string, days: number = 30) {
  return await prisma.seoSearchQuery.findMany({
    where: { query, periodDays: 30 },
    orderBy: { date: 'desc' },
    take: days
  });
}

export async function getLandingPageTrend(url: string, days: number = 30) {
  return await prisma.seoLandingPage.findMany({
    where: { url, periodDays: 30 },
    orderBy: { date: 'desc' },
    take: days
  });
}
```

**Integration**: Update `app/lib/seo/search-console.ts`

```typescript
// After fetching data, store to database
import { storeSearchConsoleSummary } from "~/services/seo/search-console-storage";

export async function getSearchConsoleSummary(): Promise<SearchConsoleSummary> {
  const [analytics, topQueries, landingPages] = await Promise.all([
    getSearchAnalytics(),
    getTopQueries(10),
    getLandingPages(10),
  ]);
  
  // Store to Supabase (async, don't block response)
  storeSearchConsoleSummary().catch(err => 
    console.error("[Search Console] Storage failed:", err)
  );
  
  return {
    totalClicks: analytics.clicks,
    totalImpressions: analytics.impressions,
    avgCtr: analytics.ctr,
    avgPosition: analytics.position,
    indexCoveragePct: 0,
    topQueries,
    landingPages,
  };
}
```

**Nightly Job**: `scripts/seo/nightly-search-console-sync.ts`

```typescript
import { storeSearchConsoleSummary } from "~/services/seo/search-console-storage";

async function main() {
  console.log("[Cron] Starting nightly Search Console sync");
  
  const result = await storeSearchConsoleSummary();
  
  console.log(`[Cron] Complete: ${result.queries} queries, ${result.pages} pages stored`);
}

main().catch(console.error);
```

**Tests**: `tests/unit/services/seo/search-console-storage.spec.ts`
- Test store metrics
- Test store queries (batch insert)
- Test store landing pages (batch insert)
- Test complete summary storage
- Test historical query functions
- Mock Prisma calls

**Acceptance**:
- ✅ Storage service implemented
- ✅ Store site-wide metrics (upsert)
- ✅ Store top queries (replace daily)
- ✅ Store landing pages (replace daily)
- ✅ Complete summary function
- ✅ Historical query functions (trends)
- ✅ Nightly job script
- ✅ Integration with existing Search Console API
- ✅ Unit tests passing

**MCP Required**: 
- Context7 → Prisma upsert, batch inserts

---

## 📋 Acceptance Criteria (All Tasks)

### Phase 11: Action Attribution + Search Console Persistence (8h)
- ✅ ANALYTICS-017: Action attribution service (GA4 Data API, re-rank queue, nightly job, API routes)
- ✅ ANALYTICS-018: Search Console storage service (store metrics/queries/pages, historical trends, nightly job)
- ✅ All unit tests passing (100% coverage)
- ✅ Rate limiting enforced (GA4: 1 req/sec)
- ✅ TypeScript clean, no linter errors

---

## 🔧 Tools & Resources

### MCP Tools (MANDATORY)
1. **Context7 MCP**: For all service development
   - Google Analytics Data API v1
   - Prisma upsert, batch inserts
   - TypeScript patterns

2. **Web Search**: If Context7 doesn't have GA4 Data API docs
   - "GA4 Data API custom dimensions query Node.js"

### Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL**: `artifacts/analytics/<date>/mcp/action-attribution.jsonl`, `mcp/search-console-storage.jsonl`
2. **Heartbeat NDJSON**: `artifacts/analytics/<date>/heartbeat.ndjson` (append every 15min)
3. **Dev MCP Check**: Verify NO Dev MCP imports in `app/`
4. **PR Template**: Fill out all sections

### Testing
- Unit tests for GA4 API queries
- Mock Google Analytics Data API responses
- Test Prisma upsert/batch inserts
- Test rate limiting (1 req/sec)

---

## 🎯 Execution Order

**START NOW** - No idle time:

1. **ANALYTICS-017**: Action Attribution Service (5h) → START IMMEDIATELY
   - Pull Context7: Google Analytics Data API
   - Implement GA4 query (custom dimension)
   - Implement update action ROI
   - Implement re-rank queue
   - Create nightly job script
   - Create API routes
   - Write unit tests

2. **ANALYTICS-018**: Search Console Storage (3h)
   - Pull Context7: Prisma upsert, batch inserts
   - Implement storage functions
   - Integrate with existing Search Console API
   - Create nightly job script
   - Implement historical query functions
   - Write unit tests

**Total**: 8 hours

**Expected Output**:
- 2 new services (~600-800 lines)
- 2 API routes
- 2 nightly job scripts
- 40+ unit tests
- Integration with GA4 Data API + existing Search Console API

---

## 🚨 Critical Reminders

1. **NO IDLE**: Start ANALYTICS-017 immediately
2. **MCP FIRST**: Pull Context7 docs BEFORE every task
3. **Evidence JSONL**: Create `artifacts/analytics/2025-10-21/mcp/` and log every MCP call
4. **Heartbeat**: Tasks >2h, append to `artifacts/analytics/2025-10-21/heartbeat.ndjson` every 15min
5. **React Router 7**: Use `Response.json()` NOT `json()` (lesson learned from previous violation)
6. **Rate Limiting**: GA4 Data API = 1 query/second
7. **Dependencies**: Wait for DevOps to create GA4 custom dimension `hd_action_key`
8. **Feedback**: Update `feedback/analytics/2025-10-21.md` every 2 hours

**Questions or blockers?** → Escalate immediately in feedback

**Let's build! 📊**

---

## ✅ v8.0 COMPLETE (2025-10-21T17:27Z)

Phase 7-8 Growth Analytics complete. Phase 11 assigned (cross-functional work active).

---


## 📊 MANDATORY: Progress Reporting (Database Feedback)

**Report progress via `logDecision()` every 2 hours minimum OR at task milestones.**

### Basic Usage

```typescript
import { logDecision } from '~/services/decisions.server';

// When starting a task
await logDecision({
  scope: 'build',
  actor: 'analytics',
  taskId: '{TASK-ID}',              // Task ID from this direction file
  status: 'in_progress',            // pending | in_progress | completed | blocked | cancelled
  progressPct: 0,                   // 0-100 percentage
  action: 'task_started',
  rationale: 'Starting {task description}',
  evidenceUrl: 'docs/directions/analytics.md',
  durationEstimate: 4.0             // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: 'build',
  actor: 'analytics',
  taskId: '{TASK-ID}',
  status: 'in_progress',
  progressPct: 50,                  // Update progress
  action: 'task_progress',
  rationale: 'Component implemented, writing tests',
  evidenceUrl: 'artifacts/analytics/2025-10-22/{task}.md',
  durationActual: 2.0,              // Hours spent so far
  nextAction: 'Complete integration tests'
});

// When completed
await logDecision({
  scope: 'build',
  actor: 'analytics',
  taskId: '{TASK-ID}',
  status: 'completed',              // CRITICAL for manager queries
  progressPct: 100,
  action: 'task_completed',
  rationale: '{Task name} complete, {X}/{X} tests passing',
  evidenceUrl: 'artifacts/analytics/2025-10-22/{task}-complete.md',
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
  actor: 'analytics',
  taskId: '{TASK-ID}',
  status: 'blocked',                // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: 'Waiting for {dependency} to complete',
  blockedBy: '{DEPENDENCY-TASK-ID}',  // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: 'task_blocked',
  rationale: 'Cannot proceed because {reason}',
  evidenceUrl: 'feedback/analytics/2025-10-22.md'
});
```

### Manager Visibility

Manager runs these scripts to see your work instantly:
- `query-blocked-tasks.ts` - Shows if you're blocked and why
- `query-agent-status.ts` - Shows your current task and progress  
- `query-completed-today.ts` - Shows your completed work

**This is why structured logging is MANDATORY** - Manager can see status across all 17 agents in <10 seconds.

### Markdown Backup (Optional)

You can still write to `feedback/analytics/2025-10-22.md` for detailed notes, but database is the primary method.

---
## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'analytics',
  action: 'task_completed',
  rationale: 'ANALYTICS-019: Search Console schema review complete',
  evidenceUrl: 'artifacts/analytics/2025-10-21/schema-review.md'
});
```

Call at EVERY task completion.
