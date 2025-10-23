# Feedback Process Database Schema Analysis

## Current State vs Required State

### Agent Workflow Requirements (from `.cursor/rules/09-agent-workflow.mdc`)

**Required Feedback Format**:
```md
## YYYY-MM-DDTHH:MM:SSZ — {Agent}: [Status Update]

**Working On**: [Task from direction file]
**Progress**: [Milestone or % complete]
**Evidence**: [File paths, commits, test results]
**Blockers**: [None or detailed description]
**Next**: [Next action]
```

**Requirements**: Report every 2 hours minimum with specific data points.

---

## Current Schema: DecisionLog

```prisma
model DecisionLog {
  id          Int      @id @default(autoincrement())
  scope       String                    // 'build' or 'ops'
  actor       String                    // agent name (e.g., 'engineer', 'manager')
  action      String                    // e.g., 'task_completed', 'blocker_cleared'
  rationale   String?                   // description
  evidenceUrl String?                   // reference to artifacts
  shopDomain  String?                   
  externalRef String?                   
  payload     Json?                     // unstructured metadata
  createdAt   DateTime @default(now())

  @@index([scope, createdAt])
  @@schema("public")
}
```

---

## Gap Analysis

### ✅ What Works
1. **Actor tracking** - Can identify which agent logged the entry
2. **Timestamp** - CreatedAt for temporal queries
3. **Evidence** - evidenceUrl for artifact references
4. **Flexible payload** - JSON field for unstructured data
5. **Database protection** - RLS + triggers prevent deletion/modification

### ❌ What's Missing for Efficient Manager Queries

#### 1. **Task Identification** (CRITICAL)
**Current**: No dedicated `taskId` field  
**Problem**: Can't query "show me all ENG-029 updates" or "what tasks is engineer working on?"  
**Impact**: Manager must parse payload JSON or read feedback files

**Needed**: 
```prisma
taskId      String?   // e.g., 'ENG-029', 'DATA-017', 'INVENTORY-016'
```

#### 2. **Status Tracking** (CRITICAL)
**Current**: Status is implied by action type or buried in payload  
**Problem**: Can't query "show me all blocked tasks" or "what's completed?"  
**Impact**: Manager can't filter by status efficiently

**Needed**:
```prisma
status      String    // enum: 'pending', 'in_progress', 'completed', 'blocked', 'cancelled'
```

#### 3. **Progress Tracking** (HIGH PRIORITY)
**Current**: Progress mentioned in rationale text but not structured  
**Problem**: Can't query "show tasks >50% complete" or track velocity  
**Impact**: No progress metrics without parsing text

**Needed**:
```prisma
progressPct    Int?       // 0-100 percentage
progressLabel  String?    // e.g., "Phase 2 of 3", "Testing"
```

#### 4. **Blocker Details** (CRITICAL)
**Current**: Blockers mentioned in rationale but not structured  
**Problem**: Can't query "show all agents blocked" or "what are they blocked on?"  
**Impact**: Manager must read all feedback to find blockers

**Needed**:
```prisma
blockerDetails  String?    // Detailed blocker description
blockedBy       String?    // What/who is blocking (e.g., 'DATA-017', 'credentials')
```

#### 5. **Duration Tracking** (MEDIUM PRIORITY)
**Current**: Duration in payload JSON (inconsistent)  
**Problem**: Can't analyze actual vs estimated time  
**Impact**: No velocity metrics, can't improve estimates

**Needed**:
```prisma
durationEstimateHours  Decimal?  @db.Decimal(5, 2)  // Estimated hours
durationActualHours    Decimal?  @db.Decimal(5, 2)  // Actual hours spent
```

#### 6. **Next Action** (LOW PRIORITY)
**Current**: Not captured  
**Problem**: Can't see what agent plans to do next  
**Impact**: Harder to coordinate dependencies

**Needed**:
```prisma
nextAction    String?    // Agent's stated next step
```

---

## Proposed Enhanced Schema

### Option A: Extend DecisionLog (RECOMMENDED)

**Pros**:
- Single table for all decisions
- Backward compatible (all new fields nullable)
- Keeps existing RLS/trigger protection

**Cons**:
- Table becomes more complex
- Mixed concerns (decisions + progress tracking)

```prisma
model DecisionLog {
  // Existing fields
  id          Int      @id @default(autoincrement())
  scope       String   
  actor       String   
  action      String   
  rationale   String?  
  evidenceUrl String?  
  shopDomain  String?  
  externalRef String?  
  payload     Json?    
  createdAt   DateTime @default(now())

  // NEW: Task tracking fields
  taskId              String?   // e.g., 'ENG-029', 'DATA-017'
  status              String?   // 'pending', 'in_progress', 'completed', 'blocked', 'cancelled'
  progressPct         Int?      // 0-100
  progressLabel       String?   // e.g., "Phase 2 of 3"
  
  // NEW: Blocker tracking
  blockerDetails      String?   // Detailed description
  blockedBy           String?   // What's blocking (taskId or resource)
  
  // NEW: Duration tracking
  durationEstimate    Decimal?  @db.Decimal(5, 2)  // Estimated hours
  durationActual      Decimal?  @db.Decimal(5, 2)  // Actual hours
  
  // NEW: Planning
  nextAction          String?   // Agent's next step

  @@index([scope, createdAt])
  @@index([actor, status, createdAt])  // NEW: Query by agent + status
  @@index([taskId])                     // NEW: Query by task
  @@index([status, createdAt])          // NEW: Query blocked tasks
  @@schema("public")
}
```

**Migration Required**: Yes (adds nullable columns, safe)

---

### Option B: Create Separate AgentProgress Table

**Pros**:
- Clean separation of concerns
- DecisionLog stays focused on decisions
- Purpose-built for progress tracking

**Cons**:
- Two tables to maintain
- More complex queries (joins)
- Need to replicate RLS protection

```prisma
model DecisionLog {
  // Keep as-is (existing functionality)
}

model AgentProgress {
  id                  Int      @id @default(autoincrement())
  agent               String   
  taskId              String   
  status              String   // 'pending', 'in_progress', 'completed', 'blocked'
  progressPct         Int?     
  progressLabel       String?  
  blockerDetails      String?  
  blockedBy           String?  
  durationEstimate    Decimal? @db.Decimal(5, 2)
  durationActual      Decimal? @db.Decimal(5, 2)
  evidenceUrl         String?  
  nextAction          String?  
  reportedAt          DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([agent, status, reportedAt])
  @@index([taskId])
  @@index([status, reportedAt])
  @@schema("public")
}
```

**Migration Required**: Yes (new table + RLS policies)

---

## Manager Query Use Cases

With enhanced schema (Option A), the manager can:

### 1. Get All Blocked Tasks
```typescript
const blocked = await prisma.decisionLog.findMany({
  where: { status: 'blocked' },
  orderBy: { createdAt: 'desc' },
  select: {
    actor: true,
    taskId: true,
    blockerDetails: true,
    blockedBy: true,
    createdAt: true
  }
});
```

**Result**: Instant list of all blocked tasks across all agents

### 2. Get Agent's Latest Status
```typescript
const engineerStatus = await prisma.decisionLog.findMany({
  where: { 
    actor: 'engineer',
    taskId: { not: null }
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
  select: {
    taskId: true,
    status: true,
    progressPct: true,
    nextAction: true,
    createdAt: true
  }
});
```

**Result**: Engineer's last 10 task updates with status/progress

### 3. Get Completed Tasks (Last 24h)
```typescript
const completed = await prisma.decisionLog.findMany({
  where: {
    status: 'completed',
    createdAt: { gte: new Date(Date.now() - 86400000) }
  },
  select: {
    actor: true,
    taskId: true,
    durationActual: true,
    evidenceUrl: true
  }
});
```

**Result**: All completed tasks in last 24h with timing data

### 4. Get All In-Progress Tasks (Summary View)
```typescript
const inProgress = await prisma.decisionLog.groupBy({
  by: ['actor', 'taskId'],
  where: { status: 'in_progress' },
  _max: { createdAt: true, progressPct: true }
});
```

**Result**: Dashboard showing what each agent is working on

### 5. Identify Stale Tasks (No Update >4h)
```typescript
const stale = await prisma.decisionLog.findMany({
  where: {
    status: { in: ['in_progress', 'pending'] },
    createdAt: { lt: new Date(Date.now() - 14400000) }
  },
  orderBy: { createdAt: 'asc' },
  distinct: ['taskId']
});
```

**Result**: Tasks with no update in >4 hours (potential issues)

---

## Comparison: Before vs After

### Before (Current State)
**Manager workflow**:
1. Read ALL 17 feedback files (thousands of lines)
2. Manually parse for status/blockers
3. Ctrl+F search for "BLOCKER" or "❌"
4. Track progress in memory
5. Takes 30-60 minutes per cycle

### After (With Enhanced Schema)
**Manager workflow**:
1. Query: `WHERE status = 'blocked'` → instant blocker list
2. Query: `WHERE status = 'completed' AND createdAt > yesterday` → completed work
3. Query: `WHERE status = 'in_progress'` → current work
4. Only read feedback files for blocked tasks (deep dive)
5. Takes 5-10 minutes per cycle

**Time Savings**: 20-50 minutes per cycle = **40-100 hours per month**

---

## Recommendations

### Phase 1: Immediate (Add to DecisionLog) ✅ RECOMMENDED
**Priority**: P0  
**Effort**: 2 hours (migration + update logDecision service)  
**Impact**: HIGH - Enables manager dashboard queries

**Add to DecisionLog**:
- `taskId` (String?)
- `status` (String?) - enum values
- `progressPct` (Int?)
- `blockerDetails` (String?)
- `blockedBy` (String?)

**Update**:
- `app/services/decisions.server.ts` - Add new fields to interface
- Create migration with new columns
- Update all agent directions to use new fields

### Phase 2: Enhancement (Duration Tracking)
**Priority**: P1  
**Effort**: 1 hour  
**Impact**: MEDIUM - Enables velocity metrics

**Add**:
- `durationEstimate` (Decimal?)
- `durationActual` (Decimal?)
- `nextAction` (String?)

### Phase 3: Manager Dashboard (UI)
**Priority**: P2  
**Effort**: 4-6 hours  
**Impact**: HIGH - Visual dashboard for CEO/Manager

**Create**:
- `/app/routes/manager.dashboard.tsx`
- Query hooks for status aggregation
- Real-time blocker alerts
- Progress charts per agent

---

## Action Items

### For Data Agent (Immediate)
1. Create migration: `20251022_enhance_decision_log.sql`
2. Add 5 new nullable columns to DecisionLog
3. Add 3 new indexes for efficient queries
4. Test RLS policies still work

### For Engineer Agent (Immediate)
1. Update `LogDecisionInput` interface in `app/services/decisions.server.ts`
2. Add validation for status enum values
3. Update TypeScript types

### For All Agents (After Schema Update)
1. Update `logDecision()` calls to include:
   - `taskId`: From direction file (e.g., 'ENG-029')
   - `status`: Current task status
   - `progressPct`: Numeric progress
   - `blockerDetails`: If blocked
   - `blockedBy`: Dependency task ID

### For Manager (After Phase 1)
1. Create query scripts in `scripts/manager/`:
   - `query-blocked-tasks.ts`
   - `query-agent-status.ts`
   - `query-completed-today.ts`
2. Test new workflow
3. Document in manager direction file

---

## Sample Updated logDecision Call

### Before (Current)
```typescript
await logDecision({
  scope: 'build',
  actor: 'engineer',
  action: 'task_completed',
  rationale: 'ENG-029: Implemented PII Card component',
  evidenceUrl: 'artifacts/engineer/2025-10-21/eng-029.md'
});
```

### After (Enhanced)
```typescript
await logDecision({
  scope: 'build',
  actor: 'engineer',
  taskId: 'ENG-029',              // NEW
  action: 'task_completed',
  status: 'completed',             // NEW
  progressPct: 100,                // NEW
  rationale: 'Implemented PII Card component with redaction',
  evidenceUrl: 'artifacts/engineer/2025-10-21/eng-029.md',
  durationActual: 4.0,            // NEW (optional)
  durationEstimate: 4.0,          // NEW (optional)
  nextAction: 'Starting ENG-030'  // NEW (optional)
});
```

### Blocked Task Example
```typescript
await logDecision({
  scope: 'build',
  actor: 'integrations',
  taskId: 'INTEGRATIONS-012',
  action: 'task_blocked',          // Action indicates blocked
  status: 'blocked',               // Status for queries
  progressPct: 60,                 // Was 60% before blocking
  blockerDetails: 'Waiting for DATA-017 vendor_master table migration',
  blockedBy: 'DATA-017',           // Dependency task
  rationale: 'Cannot sync Shopify cost data without vendor_master table',
  evidenceUrl: 'feedback/integrations/2025-10-22.md'
});
```

---

## Conclusion

**Current State**: DecisionLog captures decisions but lacks structured fields for efficient status/blocker queries.

**Problem**: Manager must read thousands of lines of feedback manually to find blocked tasks and progress.

**Solution**: Add 5-8 fields to DecisionLog for task tracking (taskId, status, progressPct, blockerDetails, blockedBy).

**Impact**: Reduce manager consolidation time from 30-60 minutes to 5-10 minutes per cycle (83% time savings).

**Effort**: 2-3 hours for schema migration + service update.

**Recommendation**: ✅ **Proceed with Phase 1 immediately** (Option A - extend DecisionLog)

---

**Next Steps**:
1. CEO approval for schema change
2. Data agent creates migration
3. Engineer updates logDecision service
4. Manager updates agent directions with new requirements
5. Agents adopt enhanced logging format

