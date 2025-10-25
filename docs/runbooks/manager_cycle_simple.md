# Manager Cycle — Simple Task List (End-to-End)

**Purpose**: Execute one complete manager coordination cycle
**Duration**: 30-60 minutes per cycle (was 2-3 hours with markdown reading)
**Time Savings**: 1.5-2.5 hours via database queries
**Frequency**: Daily (or when CEO requests direction update)

---

## 🚨 CRITICAL: DATABASE-FIRST + MCP-GATED APPROACH

**Single Source of Truth**: decision_log table in database
**Validation Gate**: All code/integration decisions must pass MCP enforcement

**ALWAYS:**
- ✅ Query decision_log FIRST before making any assumptions
- ✅ Trust database over markdown files or artifacts
- ✅ Verify task completion status in decision_log
- ✅ Check for blockers in decision_log
- ✅ Review agent progress in decision_log
 - ✅ Apply MCP validation where applicable before approving changes

**NEVER:**
- ❌ Assume tasks incomplete without checking decision_log
- ❌ Assign already-completed work
- ❌ Rely solely on artifacts/ directory for status
- ❌ Skip database verification
 - ❌ Approve PRs without MCP evidence/validation (see CRITICAL_MCP_ENFORCEMENT)

**Why This Matters:**
- Agents log ALL work to decision_log (100% compliance)
- Agents may not create artifacts/ directories immediately
- Database is real-time, artifacts may lag
- Assigning completed work wastes agent time
 - MCP validation prevents training-data mistakes and reversions (security & API changes)

**Lesson Learned (2025-10-24):**
- Manager assigned BLOCKER-003, BLOCKER-005, SQL fixes
- All were already complete in decision_log
- Agents had logged everything correctly
- Manager did NOT check database first
- **Result**: Wasted time, incorrect assignments
  
Additionally, PRs without MCP evidence and validation almost reversed working production fixes (see docs/runbooks/CRITICAL_MCP_ENFORCEMENT.md). Always require: evidence JSONL, codebase retrieval, and validator passes.

**Golden Rule**: When in doubt, query decision_log!

---

## ASSUMPTIONS (Pre-Set — Don't Rehash)

- Dev agents: Interactive only (Manager-invoked)
- Live app agents: On-demand + nightly jobs (inventory reconcile 02:00 America/Los_Angeles)
- Canonical domain: `fm8vte-ex.myshopify.com`
- GA4 property: 339826228
- PII Card: Operator-only (city/region/country, postal prefix, masked email/phone, last-4 order ID, last tracking event, line items)

---

## 1) QUERY STATUS (< 1 min) [DATABASE-DRIVEN - CRITICAL]

**Objective**: Get instant snapshot of all 17 agents from decision_log (replaces 30min feedback reading)

**🚨 CRITICAL**: ALWAYS query decision_log FIRST - it is the single source of truth. Do NOT assume task status without checking database.

**Steps**:

```bash
cd ~/HotDash/hot-dash

# Create output directory
mkdir -p artifacts/manager/$(date +%Y-%m-%d)
DATE=$(date +%Y-%m-%d)

# Query 1: Completed work (< 1 sec) - CHECK THIS FIRST!
echo "🔍 CRITICAL: Querying completed work from decision_log..."
npx tsx --env-file=.env scripts/manager/query-completed-today.ts > artifacts/manager/$DATE/completed.txt
echo "✅ Found completed work - review BEFORE assigning tasks"

# Query 2: Blocked tasks (< 1 sec)
echo "Querying blocked tasks..."
npx tsx --env-file=.env scripts/manager/query-blocked-tasks.ts > artifacts/manager/$DATE/blocked-tasks.txt

# Query 3: Agent status (< 1 sec)
echo "Querying agent status..."
npx tsx --env-file=.env scripts/manager/query-agent-status.ts > artifacts/manager/$DATE/agent-status.txt

echo ""
echo "✅ Status queries complete (< 10 seconds total)"
echo "📊 Results:"
echo "   ⚠️  REVIEW FIRST: artifacts/manager/$DATE/completed.txt"
echo "   Blocked: artifacts/manager/$DATE/blocked-tasks.txt"
echo "   Status: artifacts/manager/$DATE/agent-status.txt"
echo ""
echo "🚨 CRITICAL: Review completed.txt BEFORE assigning any tasks!"
echo "   Agents log ALL work to decision_log (100% compliance)"
echo "   Do NOT assume tasks incomplete without checking database"
```

**Output**: 3 query result files (instant status of all agents)

**Time**: < 10 seconds (vs 30 minutes reading markdown files)

**Acceptance**:

- ✅ All 3 queries run successfully
- ✅ **Completed work reviewed FIRST** (decision_log is source of truth)
- ✅ Blocked tasks identified
- ✅ Agent status shows current work
- ✅ No assumptions made without database verification

**⚠️ LESSON LEARNED (2025-10-24):**
- Manager assigned already-completed tasks (BLOCKER-003, BLOCKER-005, SQL fixes)
- Agents had logged ALL work to decision_log correctly (100% compliance)
- Manager did NOT check decision_log before assigning
- **ALWAYS query decision_log FIRST - trust the database!**

---

## 2) CONSOLIDATE (10 min) [DATABASE-DRIVEN - NEW]

**Objective**: Review query results and identify actions (replaces 45min manual consolidation)

**Lanes**:

- customer-front, accounts, storefront
- inventory, analytics, seo-perf, risk, content
- devops, integrations, data, designer, product, support, ads, ai-knowledge, qa

**Steps**:

```bash
DATE=$(date +%Y-%m-%d)

# Review query outputs and create summary
cat > artifacts/manager/$DATE/status-summary.md << 'EOF'
# Agent Status Summary — [DATE]

**Generated**: Database queries (< 10 seconds)
**Method**: query-blocked-tasks.ts, query-agent-status.ts, query-completed-today.ts
**Agents**: 17

---

## BLOCKERS (Auto-Generated)

[Paste output from blocked-tasks.txt]

---

## COMPLETED TODAY (Auto-Generated)

[Paste output from completed.txt]

---

## IN PROGRESS (Auto-Generated)

[Extract from agent-status.txt - look for 🔵 in_progress status]

---

## ACTION ITEMS

From query results:
- Unblock: [List dependencies from blockedBy field]
- Review: [Agents with progress <50% and >4h stale]
- Coordinate: [Task dependencies]

---

## NEXT TASKS (From Direction Files)

[Manager determines from current progress and priorities]

EOF

# Replace [DATE] with actual date
sed -i "s/\[DATE\]/$DATE/g" artifacts/manager/$DATE/status-summary.md

# Paste query results into summary
sed -i "/\[Paste output from blocked-tasks.txt\]/r artifacts/manager/$DATE/blocked-tasks.txt" artifacts/manager/$DATE/status-summary.md
sed -i "/\[Paste output from completed.txt\]/r artifacts/manager/$DATE/completed.txt" artifacts/manager/$DATE/status-summary.md

echo "✅ Summary created: artifacts/manager/$DATE/status-summary.md"
echo "⏱️  Time: < 1 minute (vs 45 minutes before)"
echo ""
echo "📝 Review the summary and:"
echo "    - Identify blockers to unblock"
echo "    - Check agents with stale progress (>4h)"
echo "    - Only read markdown files for blocked agents (deep dive)"
```

**Output**: `artifacts/manager/<DATE>/status-summary.md` (auto-generated from database)

**Time**: < 1 minute (vs 45 minutes manual consolidation)

**Acceptance**: All blockers identified, completed work summarized, in-progress tracked

---

## 3) CONFLICT CHECK (15 min) — ⚠️ STOP IF ANY

**Objective**: Compare against North Star + Growth Engine pack; PAUSE if conflicts found

**Steps**:

```bash
DATE=$(date +%Y-%m-%d)

# Check for new features not in pack or conflicts with North Star
echo "🔍 Checking for conflicts..."

# Questions to answer:
# 1. Any new features built that conflict with North Star vision?
# 2. Any features from Growth Engine pack missing or delayed?
# 3. Any security model violations (PII handling, ABAC, Dev MCP ban)?
# 4. Any evidence requirements not followed (MCP JSONL, heartbeat)?

# If YES to any → Create conflict report
cat > artifacts/manager/$DATE/design_conflicts.md << 'EOF'
# Design Conflict Report — [DATE]

**Status**: ⚠️ CONFLICTS FOUND — CEO Approval Required Before Proceeding

---

## CONFLICT 1: [Title]

**Where**: [File/feature]
**Issue**: [What conflicts with North Star or pack]
**Impact**: [P0/P1/P2]
**Options**:
- A) [Option 1]
- B) [Option 2]

**Recommendation**: [Manager's recommendation]

---

[Repeat for each conflict]

---

## CEO DECISION REQUIRED

Please approve approach for each conflict before I proceed with direction updates.

EOF

# If conflicts found:
echo "⚠️ CONFLICTS FOUND - Saved to artifacts/manager/$DATE/design_conflicts.md"
echo "🛑 PAUSING - Do NOT proceed to step 4 until CEO approves"

# If no conflicts:
echo "✅ No conflicts found - Safe to proceed"
rm artifacts/manager/$DATE/design_conflicts.md 2>/dev/null
```

**Output**: `artifacts/manager/<DATE>/design_conflicts.md` (only if conflicts exist)

**⚠️ STOP RULE**: If conflicts exist, PAUSE here and present to CEO. Do NOT proceed to steps 4-7 until CEO confirms.

**Acceptance**: Either no conflicts (file deleted) OR conflict report created and CEO approval obtained

---

## 4) ASSIGN & UPDATE DIRECTION (5–10 min) [DATABASE-DRIVEN]

Objective: Assign/resize tasks via database (no markdown edits). Record Allowed paths and DoD.

Steps:

```bash
# Single task (env vars inline or exported beforehand)
AGENT=engineer TASK_ID=ENG-NEW TITLE="<title>" DESC="<direction>" \
  CRITERIA="Works|Tests pass" PATHS="app/**|scripts/**" PRIORITY=P1 HOURS=3 \
  npx tsx --env-file=.env scripts/manager/assign-task.ts

# Mark blockers/constraints without changing status to "completed"
TASK_ID=ENG-NEW REASON="blocked by XYZ" ENV=dev DB=production \
  npx tsx --env-file=.env scripts/manager/mark-task-blocked.ts
```

Acceptance:
- ✅ Tasks exist in DB with owner, DoD, Allowed paths
- ✅ Dependencies noted; blockers marked where needed
- ✅ No markdown direction files edited

Safety:
- Use Allowed paths to constrain diffs
- For production-only ops, include constraints in payload (no destructive ops)
- Require MCP evidence/validation on PRs touching Shopify/Polaris/libraries

---

## 5) MCP ENFORCEMENT GATE (2–3 min)

Before approving/merging any PRs born from this cycle, verify:
- ✅ Evidence JSONL present in artifacts/<agent>/<date>/mcp
- ✅ Codebase retrieval + file reads used
- ✅ Validator used where applicable:
  - Shopify GraphQL → validate_graphql_codeblocks
  - Polaris components → validate_component_codeblocks
  - Libraries (Prisma/Router/TS) → Context7 docs pulled
- ❌ Reject if red-flag phrases appear or evidence is missing

Reference: docs/runbooks/CRITICAL_MCP_ENFORCEMENT.md

---

## 6) LOG & MONITOR (throughout day)

Run quick status checks every 1–2 hours:

```bash
npx tsx --env-file=.env scripts/manager/query-agent-status.ts
npx tsx --env-file=.env scripts/manager/query-blocked-tasks.ts
```

When notified of completion, get details:

```bash
npx tsx --env-file=.env scripts/manager/query-task-details.ts <TASK-ID>
```

If blocker cleared: update dependent agents’ next tasks immediately (DB updates only).

Acceptance:
- ✅ Status/blocked updates visible in DB
- ✅ Direction changes reflected without touching markdown


## 4) MARK DONE & CLEAN PLAN (10 min) [DATABASE-DRIVEN]

**Objective**: Mark completed tasks in database based on decision_log queries

**🚨 CRITICAL**: Use decision_log as source of truth, NOT markdown files or assumptions

**Steps**:

```bash
DATE=$(date +%Y-%m-%d)

# Step 1: Review completed work from decision_log
echo "📋 Reviewing completed work from decision_log..."
cat artifacts/manager/$DATE/completed.txt

# Step 2: Identify tasks to mark complete
echo ""
echo "🔍 Identifying tasks to mark complete in database..."

# Step 3: Mark tasks complete in database
# Create script to update task_assignment table
cat > scripts/manager/mark-completed-$DATE.ts << 'EOF'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const completedTasks = [
  // Add task IDs from completed.txt
  // Example: { taskId: 'BLOCKER-003', agent: 'engineer' }
];

async function markCompleted() {
  for (const task of completedTasks) {
    await prisma.taskAssignment.updateMany({
      where: { taskId: task.taskId },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });
    console.log(`✅ ${task.taskId} marked complete`);
  }
  await prisma.$disconnect();
}

markCompleted();
EOF

# Run the script
npx tsx --env-file=.env scripts/manager/mark-completed-$DATE.ts

echo "✅ All completed tasks marked in database"
```

**Manual Step**:

1. **Review** `artifacts/manager/$DATE/completed.txt` (from decision_log)
2. **Extract** task IDs that show status='completed' or action contains 'complete'
3. **Update** task_assignment table to mark tasks as completed
4. **Verify** no tasks marked complete without decision_log evidence

**⚠️ DO NOT:**
- Assume tasks incomplete without checking decision_log
- Mark tasks complete based on markdown files only
- Skip database verification

**Acceptance**:
- ✅ All completed tasks from decision_log marked in task_assignment table
- ✅ No tasks marked complete without decision_log evidence
- ✅ Database is single source of truth

---

## 5) BLOCKERS FIRST (30 min) [DATABASE-DRIVEN]

**Objective**: Verify each blocker (5/5 checks); CHECK decision_log for resolution; PRESENT to CEO for assignment

**🚨 CRITICAL**: Check decision_log BEFORE verifying blockers - they may already be resolved!

**Pre-Verification Step**:

```bash
DATE=$(date +%Y-%m-%d)

# Check if blockers already resolved in decision_log
echo "🔍 Checking decision_log for blocker resolutions..."
npx tsx --env-file=.env -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const blockers = await prisma.decisionLog.findMany({
  where: {
    createdAt: { gte: new Date('$DATE 00:00:00') },
    OR: [
      { taskId: { contains: 'BLOCKER' } },
      { action: { contains: 'blocker' } },
      { rationale: { contains: 'BLOCKER' } }
    ]
  },
  orderBy: { createdAt: 'desc' }
});

console.log('Blocker-related decisions today:', blockers.length);
for (const b of blockers) {
  console.log(\`\${b.taskId}: \${b.action} (status: \${b.status})\`);
}

await prisma.\$disconnect();
"

echo "✅ Check complete - review output before proceeding"
```

**5-Point Blocker Verification** (ONLY for unresolved blockers):

For each blocker NOT resolved in decision_log, verify:

1. ✅ **Access**: Do we have credentials/permissions? (Check vault, env vars)
2. ✅ **Flags**: Are feature flags/env vars set correctly?
3. ✅ **Runbook**: Is there a runbook for this operation?
4. ✅ **Workaround**: Can we proceed with alternative approach?
5. ✅ **Repro**: Can blocker be reproduced with minimal steps?

**Document Blockers** (ONLY unresolved ones):

```bash
DATE=$(date +%Y-%m-%d)

cat > artifacts/manager/$DATE/blockers_for_ceo.md << 'EOF'
# Blockers for CEO Assignment — [DATE]

## BLOCKER-001: [Title]
**Type**: [Credentials | Network | Dependency | Technical]
**Impact**: [What's blocked]
**ETA**: [Estimated hours to clear]
**Verification** (5/5):
- ✅ Access: [Yes/No - details]
- ✅ Flags: [Yes/No - details]
- ✅ Runbook: [Yes/No - create if missing]
- ✅ Workaround: [Yes/No - describe]
- ✅ Repro: [Yes/No - steps]

**Recommended Actions**:
- Step 1: [Specific action]
- Step 2: [Specific action]
- Evidence: [Where logged]

**Recommended Owner**: [Agent name]
**Priority**: P0/P1/P2

---

[Repeat for each blocker]

EOF

echo "✅ Blockers documented: artifacts/manager/$DATE/blockers_for_ceo.md"
```

**Manual Step**:

1. Run 5-point verification for each blocker
2. Document in `blockers_for_ceo.md`
3. **PRESENT to CEO** (in conversation, not in direction files)
4. CEO assigns blockers to team
5. **PROCEED to Step 6** (assign remaining work AS IF blockers handled)

**Key Change**: Manager does NOT assign blockers to agents. CEO assigns them separately. This enables parallel execution: team clears blockers while Manager assigns new direction.

**Acceptance**: All blockers verified (5/5) and presented to CEO

---

## 6) ASSIGN WORK (60 min) — NO IDLE AGENTS

**Objective**: Reprioritize by Revenue × Confidence × Ease; ensure every lane has tasks

**Ranking Formula**:

```
Score = Expected_Revenue × Confidence × Ease
```

**Task Sizing**: 30-120 minutes per task (no multi-day tasks)

**Steps**:

```bash
DATE=$(date +%Y-%m-%d)

# Create lane assignment JSON
cat > reports/manager/lanes/$DATE.json << 'EOF'
{
  "cycle_date": "YYYY-MM-DD",
  "total_agents": 17,
  "idle_agents": 0,
  "lanes": {
    "customer-front": {
      "agent": "ai-customer",
      "tasks": [
        {
          "id": "AI-CUSTOMER-XXX",
          "title": "Task title",
          "duration_min": 120,
          "priority": "P0",
          "score": 850,
          "dependencies": []
        }
      ]
    },
    "inventory": {
      "agent": "inventory",
      "tasks": [...]
    },
    "analytics": {
      "agent": "analytics",
      "tasks": [...]
    }
    // ... all 17 agents
  }
}
EOF

echo "✅ Lane assignments: reports/manager/lanes/$DATE.json"
```

**Manual Step**: For each agent:

1. Review their current work from `feedback_consolidated.md`
2. Assign next tasks (prioritized by score)
3. Ensure NO IDLE (even maintenance work counts)
4. Update their direction file with:
   - Next task ID
   - Objective (1-2 sentences)
   - Steps (3-5 bullet points)
   - Acceptance criteria
   - Duration estimate (30-120 min)
   - Dependencies (if any)

**Validation**: Every agent has ≥1 assigned task

**Acceptance**: All 17 agents have active work, no STANDBY/IDLE status

---

## 7) SUMMARY OUT (15 min)

**Objective**: Post ONE Cycle Summary (shipped, blockers cleared, Top-10 next)

**Steps**:

```bash
DATE=$(date +%Y-%m-%d)

cat > reports/manager/$DATE-cycle-summary.md << 'EOF'
# Manager Cycle Summary — [DATE]

**Cycle**: [NUMBER]
**Duration**: [START] → [END]

---

## ✅ SHIPPED THIS CYCLE

1. [Feature/task] (Agent: [name], Evidence: [link])
2. [Feature/task] (Agent: [name], Evidence: [link])
...

**Total**: [X] features shipped

---

## 🔓 BLOCKERS CLEARED

1. [Blocker] → Cleared by [agent] ([ETA met/missed])
2. [Blocker] → Cleared by [agent] ([ETA met/missed])
...

**Total**: [Y] blockers cleared

---

## 🎯 TOP 10 NEXT (Ranked by Score)

1. [Task] (Agent: [name], Score: [XXX], Duration: [Xh])
2. [Task] (Agent: [name], Score: [XXX], Duration: [Xh])
...

**Total Work Assigned**: [Z] hours across 17 agents

---

## ⚠️ CONFLICTS (If Any)

[List conflicts requiring CEO approval, OR state "None"]

---

**Next Cycle**: [DATE + 1 day or when requested]

EOF

echo "✅ Cycle summary: reports/manager/$DATE-cycle-summary.md"
```

**Post Summary**: Copy summary to `feedback/manager/<DATE>.md` (append)

**Acceptance**: One-page summary posted, no extra chatter

---

## CYCLE COMPLETE CHECKLIST

- [ ] Step 1: Feedback collected (all 17 agents, no sampling)
- [ ] Step 2: Consolidated report created (≤5 pages, duplicates removed)
- [ ] Step 3: Conflict check complete (✅ no conflicts OR ⚠️ CEO approval obtained)
- [ ] Step 4: Completed tasks marked ✅ in direction files
- [ ] Step 5: All blockers have BLOCKER-CLEAR tasks with owners & ETAs
- [ ] Step 6: All 17 agents have assigned work (NO IDLE/STANDBY)
- [ ] Step 7: Cycle summary posted (one page, evidence included)

---

## OUTPUTS (Per Cycle)

**Required Files**:

1. `artifacts/manager/<DATE>/feedback_raw.md` (all agent feedback)
2. `artifacts/manager/<DATE>/feedback_consolidated.md` (one-page summary)
3. `artifacts/manager/<DATE>/design_conflicts.md` (ONLY if conflicts found)
4. `artifacts/manager/<DATE>/blockers_cleared.md` (blocker verification + tasks)
5. `reports/manager/lanes/<DATE>.json` (lane assignments)
6. `reports/manager/<DATE>-cycle-summary.md` (final summary)

**Updated Files**:

- `docs/directions/<agent>.md` (all 17 agents) — updated with next tasks, marked completed work
- `feedback/manager/<DATE>.md` — cycle summary appended

---

## STOP RULES

**STOP and present to CEO if**:

1. ⚠️ Design conflicts found (Step 3)
2. ⚠️ Critical blocker cannot be cleared within 24 hours (Step 5)
3. ⚠️ >3 agents have same blocker (systemic issue)
4. ⚠️ Any agent has been idle >4 hours (protocol violation)

**Do NOT proceed past that step until CEO confirms approach.**

---

## TIME BUDGET

| Step              | Duration | Cumulative |
| ----------------- | -------- | ---------- |
| 1. Collect        | 30 min   | 30 min     |
| 2. Consolidate    | 45 min   | 1h 15min   |
| 3. Conflict Check | 15 min   | 1h 30min   |
| 4. Mark Done      | 30 min   | 2h         |
| 5. Blockers       | 45 min   | 2h 45min   |
| 6. Assign Work    | 60 min   | 3h 45min   |
| 7. Summary        | 15 min   | 4h         |

**Total**: ~4 hours per cycle (can parallelize Step 4 & 5 to save 30 min)

---

## EXAMPLES

### Example: Blocker Verification (5/5)

**Blocker**: "DATA-006 indexes cannot be applied (network issue)"

**Verification**:

1. ✅ **Access**: Supabase credentials in vault/occ/supabase/ ✅ YES
2. ✅ **Flags**: DATABASE_URL env var set ✅ YES (but IPv6 unreachable in WSL2)
3. ✅ **Runbook**: Migration application runbook exists ✅ YES (docs/runbooks/database-migration-application.md)
4. ✅ **Workaround**: Can apply via Dashboard SQL Editor or IPv4 pooler ✅ YES
5. ✅ **Repro**: `psql "$DATABASE_URL" -c "SELECT 1"` fails with network unreachable ✅ YES

**BLOCKER-CLEAR Task**: "Apply DATA-006 via Supabase Dashboard SQL Editor (Manager, 30 min, P0)"

---

### Example: Task Assignment (No Idle)

**Agent**: Designer  
**Last Status**: "Phase 7-8 validation complete, awaiting Engineer Phase 9"  
**Risk**: Goes IDLE if Engineer delayed

**Assigned Task**: "DES-018: Review Phase 1-8 accessibility compliance report, create remediation checklist (2h, P2)"

**Why**: Keeps Designer active with productive maintenance work while waiting for dependencies

---

## NOTES

**Don't Rehash Assumptions**: No need to re-explain PII Card, domains, schedules each cycle  
**Evidence Required**: Every completed task needs evidence link (commit, artifact, test result)  
**No Idle Rule**: EVERY agent gets assigned work, even if it's maintenance/documentation  
**Conflict = STOP**: Don't proceed if Step 3 finds conflicts — CEO must approve first

---

**Next**: Execute this cycle, then repeat daily or when CEO requests direction update.
