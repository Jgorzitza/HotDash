# Manager Scripts - Quick Reference

## Enhanced Feedback Database System

All scripts use the enhanced `DecisionLog` schema with structured fields for efficient querying.

---

## Daily Workflow Scripts (Use These Every Day!)

### Core 3 Queries (< 10 seconds total)

#### 1. Check Blocked Tasks 🚨
```bash
npx tsx --env-file=.env scripts/manager/query-blocked-tasks.ts
```

**Shows**:
- Which agents are blocked
- What they're blocked on (dependency task ID)
- Blocker details and current progress
- How long they've been blocked

**Use Case**: First thing during consolidation to unblock agents ASAP

---

### 2. Agent Status Dashboard 👥
```bash
npx tsx --env-file=.env scripts/manager/query-agent-status.ts
```

**Shows**:
- Current task for each of 17 agents
- Status (in_progress, completed, blocked, pending)
- Progress percentage
- Next planned action
- Time since last update (warns if >4h)

**Use Case**: Get instant overview of what everyone is working on

---

#### 3. Completed Today ✅
```bash
npx tsx --env-file=.env scripts/manager/query-completed-today.ts
```

**Shows**:
- All tasks completed today grouped by agent
- Duration (actual hours spent)
- Evidence links
- Summary stats (total hours, agents active, avg time per task)

**Use Case**: Track daily progress and agent velocity

---

### Additional Queries (As Needed)

#### 4. Questions Waiting for Manager ❓ [NEW]
```bash
npx tsx --env-file=.env scripts/manager/query-questions.ts
```

**Shows**:
- Tasks blocked waiting for manager decisions
- Question details from payload (options, tradeoffs, recommendations)
- When question was asked
- Agent's recommended answer

**Use Case**: Find all questions that need your decision (blockedBy='manager-decision')

---

#### 5. Agent Self-Grades & Retrospectives 📊 [NEW]
```bash
npx tsx --env-file=.env scripts/manager/query-agent-grades.ts [agent-name]
```

**Shows**:
- Daily shutdown self-grades (5 dimensions, avg score)
- Retrospectives (did well, to change, to stop)
- Hours worked per day
- Tasks completed per day
- Performance trends

**Use Case**: Track agent performance, identify coaching opportunities

---

#### 6. Task Detail History 🔍 [NEW]
```bash
npx tsx --env-file=.env scripts/manager/query-task-details.ts ENG-029
```

**Shows**:
- Complete timeline of a specific task
- All progress updates with timestamps
- Payload metadata (commits, files, tests, MCP evidence)
- Duration tracking
- Status changes over time

**Use Case**: Deep dive into how a specific task progressed

---

## Testing & Verification Scripts

### 4. Test Enhanced Logging 🧪
```bash
npx tsx --env-file=.env scripts/manager/test-enhanced-logging.ts
```

**Tests**:
- Task completed with full details
- Task in progress
- Task blocked with dependencies
- Blocker cleared

**Use Case**: Verify schema is working after changes

---

### 5. Query All Decisions 📊
```bash
npx tsx --env-file=.env scripts/manager/query-decisions.ts
```

**Shows**:
- Last 10 manager decisions
- Full details including payload JSON
- All fields (taskId, status, progress, etc.)

**Use Case**: General inspection of decision log data

---

### 6. Upload Feedback File 📁
```bash
npx tsx --env-file=.env scripts/manager/upload-feedback.ts feedback/manager/2025-10-19.md
```

**Purpose**:
- Parse feedback markdown files
- Extract manager updates
- Upload to decision_log for querying

**Use Case**: Backfill historical feedback data

---

### 7. Simple Log Test ⚡
```bash
npx tsx --env-file=.env scripts/manager/test-simple-log.ts
```

**Purpose**: Quick connectivity test to decision_log table

---

### 8. Log Manager Work 📝
```bash
npx tsx --env-file=.env scripts/manager/log-manager-work.ts
```

**Purpose**: Example of logging multiple manager decisions with structured data

---

## Migration Scripts (One-Time Use)

### 9. Apply Schema Enhancement
```bash
npx tsx --env-file=.env scripts/manager/apply-enhance-decision-log.ts
```

**Purpose**: Apply the 20251022000001_enhance_decision_log.sql migration  
**Status**: ✅ Already applied (do not run again)

---

## Payload Metadata Standards [NEW]

Agents should include rich metadata in the `payload` field for better analytics:

### Task Completion Payload
```typescript
payload: {
  commits: ['abc123f', 'def456g'],
  files: [{ path: 'app/components/X.tsx', lines: 245, type: 'created' }],
  tests: { overall: '22/22 passing' },
  mcpEvidence: { calls: 3, tools: ['context7', 'shopify-dev'] },
  linesChanged: { added: 425, deleted: 15 }
}
```

### Shutdown Payload (with Self-Grading)
```typescript
payload: {
  selfGrade: { progress: 5, evidence: 4, alignment: 5, toolDiscipline: 5, communication: 4, average: 4.6 },
  retrospective: {
    didWell: ['MCP first', 'Good tests'],
    toChange: ['Ask sooner'],
    toStop: 'Guessing'
  },
  tasksCompleted: ['ENG-029'],
  hoursWorked: 6.5
}
```

**Manager Benefit**: Query analytics on test coverage, MCP usage, agent performance

---

## Enhanced LogDecision Usage

### Basic Usage (Minimal - Works But Not Recommended)
```typescript
await logDecision({
  scope: 'build',
  actor: 'engineer',
  action: 'task_completed',
  rationale: 'Finished the thing'
});
```

### Enhanced Usage (NEW - Queryable!)
```typescript
await logDecision({
  scope: 'build',
  actor: 'engineer',
  taskId: 'ENG-029',           // ENABLES: query by task
  status: 'completed',         // ENABLES: filter by status
  progressPct: 100,            // ENABLES: track velocity
  action: 'task_completed',
  rationale: 'Implemented PII Card component with redaction',
  evidenceUrl: 'artifacts/engineer/2025-10-22/eng-029.md',
  durationActual: 3.5,         // ENABLES: time tracking
  durationEstimate: 4.0,       // ENABLES: compare estimate vs actual
  nextAction: 'Starting ENG-030'  // ENABLES: planning visibility
});
```

### Blocked Task Example
```typescript
await logDecision({
  scope: 'build',
  actor: 'integrations',
  taskId: 'INTEGRATIONS-013',
  status: 'blocked',            // Shows in blocked tasks query
  progressPct: 40,
  blockerDetails: 'Waiting for DATA-017 vendor_master table migration',
  blockedBy: 'DATA-017',        // Track dependency
  rationale: 'Cannot sync Shopify cost data without vendor table',
  evidenceUrl: 'feedback/integrations/2025-10-22.md'
});
```

---

## Status Field Values

Use these standard values for the `status` field:

- **`pending`** - Task assigned but not started
- **`in_progress`** - Currently working on it
- **`completed`** - Task finished
- **`blocked`** - Waiting on dependency (use with `blockerDetails` and `blockedBy`)
- **`cancelled`** - Task no longer needed

---

## Time Savings

### Old Workflow ❌
- Open 17 feedback files
- Search for status/blockers manually
- Parse text for progress
- **Time**: 30-60 minutes per consolidation

### New Workflow ✅
- Run 3 scripts (blocked, status, completed)
- Only read feedback for blocked tasks
- **Time**: 5-10 minutes per consolidation

**Savings**: 20-50 minutes per cycle × 3/day = **1-2.5 hours/day**

---

## Troubleshooting

### "Column does not exist" Error
```bash
# Regenerate Prisma client
cd ~/HotDash/hot-dash
npx prisma generate
```

### Schema Out of Sync
```bash
# Check what columns exist
npx tsx --env-file=.env -e "import prisma from './app/db.server'; (async () => { const cols = await prisma.\$queryRaw\`SELECT column_name FROM information_schema.columns WHERE table_name = 'DecisionLog'\`; console.log(cols); await prisma.\$disconnect(); })();"
```

### Migration Failed
- Check `supabase/migrations/20251022000001_enhance_decision_log.sql`
- Verify database connection with `npm run verify:db`
- Try running migration manually from Supabase console

---

## Documentation

- **Detailed Analysis**: `~/HotDash/hot-dash/FEEDBACK_DB_SCHEMA_ANALYSIS.md` (4,500 words)
- **Executive Summary**: `~/FEEDBACK_DB_SOLUTION.md`
- **Implementation Report**: `~/IMPLEMENTATION_COMPLETE.md`
- **Test Results**: Run any test script to see current status

---

**Last Updated**: 2025-10-22  
**Status**: ✅ All systems operational  
**Maintained By**: Manager + Data Agent

