# Manager Cycle — Simple Task List (End-to-End)

**Purpose**: Execute one complete manager coordination cycle  
**Duration**: 2-3 hours per cycle  
**Frequency**: Daily (or when CEO requests direction update)

---

## ASSUMPTIONS (Pre-Set — Don't Rehash)

- Dev agents: Interactive only (Manager-invoked)
- Live app agents: On-demand + nightly jobs (inventory reconcile 02:00 America/Los_Angeles)
- Canonical domain: `fm8vte-ex.myshopify.com`
- GA4 property: 339826228
- PII Card: Operator-only (city/region/country, postal prefix, masked email/phone, last-4 order ID, last tracking event, line items)

---

## 1) COLLECT (30 min)

**Objective**: Pull ALL agent feedback since last cycle (no sampling)

**Steps**:

```bash
cd ~/HotDash/hot-dash

# Create output directory
mkdir -p artifacts/manager/$(date +%Y-%m-%d)

# Collect all agent feedback (last 24 hours)
DATE=$(date +%Y-%m-%d)

for agent in ads ai-customer ai-knowledge analytics content data designer devops engineer integrations inventory manager pilot product qa seo support; do
  echo "=== $agent ===" >> artifacts/manager/$DATE/feedback_raw.md
  
  if [ -f "feedback/$agent/$DATE.md" ]; then
    cat "feedback/$agent/$DATE.md" >> artifacts/manager/$DATE/feedback_raw.md
  else
    echo "No feedback for $DATE" >> artifacts/manager/$DATE/feedback_raw.md
  fi
  
  echo "" >> artifacts/manager/$DATE/feedback_raw.md
done

echo "✅ Feedback collected: artifacts/manager/$DATE/feedback_raw.md"
wc -l artifacts/manager/$DATE/feedback_raw.md
```

**Output**: `artifacts/manager/<DATE>/feedback_raw.md` (all agent feedback, unprocessed)

**Acceptance**: File exists, contains feedback from all 17 agents

---

## 2) CONSOLIDATE (45 min)

**Objective**: Merge into ONE short report; remove duplicates; tag by lane

**Lanes**:
- customer-front, accounts, storefront
- inventory, analytics, seo-perf, risk, content
- devops, integrations, data, designer, product, support, ads, ai-knowledge, qa

**Steps**:

```bash
DATE=$(date +%Y-%m-%d)

# Create consolidated report header
cat > artifacts/manager/$DATE/feedback_consolidated.md << 'EOF'
# Feedback Consolidated — [DATE]

**Cycle**: [YYYY-MM-DD cycle number]  
**Agents**: 17  
**Status**: [X] complete, [Y] in progress, [Z] blocked

---

## COMPLETED THIS CYCLE

**Lane: Customer-Front + CX**
- [List completed tasks with evidence]

**Lane: Inventory**
- [List completed tasks with evidence]

**Lane: Analytics**
- [List completed tasks with evidence]

**Lane: SEO/Performance**
- [List completed tasks with evidence]

**Lane: Content**
- [List completed tasks with evidence]

**Lane: DevOps**
- [List completed tasks with evidence]

**Lane: Integrations**
- [List completed tasks with evidence]

**Lane: Data**
- [List completed tasks with evidence]

**Lane: Designer**
- [List completed tasks with evidence]

**Lane: Product**
- [List completed tasks with evidence]

**Lane: Support**
- [List completed tasks with evidence]

**Lane: Ads**
- [List completed tasks with evidence]

**Lane: AI-Knowledge**
- [List completed tasks with evidence]

**Lane: QA**
- [List completed tasks with evidence]

---

## IN PROGRESS

[List by lane with % complete and ETAs]

---

## BLOCKERS

[List by lane with blocker type, owner, ETA]

---

## NEXT TASKS (Top 10)

[Ranked by Revenue × Confidence × Ease]

EOF

# Replace [DATE] with actual date
sed -i "s/\[DATE\]/$DATE/g" artifacts/manager/$DATE/feedback_consolidated.md

echo "✅ Template created: artifacts/manager/$DATE/feedback_consolidated.md"
echo "📝 NOW: Read feedback_raw.md and fill in consolidated report"
echo "    - Extract COMPLETED tasks with evidence"
echo "    - Extract IN PROGRESS with % and ETA"
echo "    - Extract BLOCKERS with owner"
echo "    - Remove duplicates"
echo "    - Tag by lane"
```

**Manual Step**: Read `feedback_raw.md` and populate the consolidated template

**Output**: `artifacts/manager/<DATE>/feedback_consolidated.md` (one-page summary, no duplicates)

**Acceptance**: ≤5 pages, all lanes covered, duplicates removed

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

## 4) MARK DONE & CLEAN PLAN (30 min)

**Objective**: Check off completed tasks with evidence; remove duplicates; update statuses

**Steps**:

For each agent direction file (`docs/directions/<agent>.md`):

```bash
# Read current direction
AGENT="engineer"  # Replace for each agent

# Check feedback_consolidated.md for completed tasks
# Example: If feedback shows "ENG-029: PII redaction utility COMPLETE ✅"

# Update direction file:
# 1. Add ✅ to completed task
# 2. Move to "COMPLETED" section
# 3. Update status line
# 4. Keep acceptance criteria (don't delete until validated)
```

**Manual Step**: For each agent:
1. Read their completed work from `feedback_consolidated.md`
2. Update their direction file:
   - ✅ Mark completed tasks
   - Keep acceptance criteria
   - Update status line (e.g., "Phase 9: 2/3 complete")
3. Do NOT delete tasks until fully validated by QA/Designer

**Acceptance**: All completed tasks marked ✅ with evidence links

---

## 5) BLOCKERS FIRST (45 min)

**Objective**: Verify each blocker (5/5 checks); convert to BLOCKER-CLEAR tasks with owners & ETAs

**5-Point Blocker Verification**:

For each blocker, verify:
1. ✅ **Access**: Do we have credentials/permissions? (Check vault, env vars)
2. ✅ **Flags**: Are feature flags/env vars set correctly?
3. ✅ **Runbook**: Is there a runbook for this operation?
4. ✅ **Workaround**: Can we proceed with alternative approach?
5. ✅ **Repro**: Can blocker be reproduced with minimal steps?

**Convert to Tasks**:

```bash
DATE=$(date +%Y-%m-%d)

cat > artifacts/manager/$DATE/blockers_cleared.md << 'EOF'
# Blockers Cleared — [DATE]

## BLOCKER-001: [Title]
**Owner**: [Agent name]  
**ETA**: [Hours to clear]  
**Type**: [Credentials | Network | Dependency | Technical]  
**Verification** (5/5):
- ✅ Access: [Yes/No - details]
- ✅ Flags: [Yes/No - details]
- ✅ Runbook: [Yes/No - create if missing]
- ✅ Workaround: [Yes/No - describe]
- ✅ Repro: [Yes/No - steps]

**Action**:
- Step 1: [Specific action]
- Step 2: [Specific action]
- Evidence: [Where logged]

**Assign To**: [Agent] + [Support agent if needed]  
**Priority**: P0 (blocking other work)

---

[Repeat for each blocker]

EOF

echo "✅ Blockers documented: artifacts/manager/$DATE/blockers_cleared.md"
```

**Manual Step**: For each blocker:
1. Run 5-point verification
2. Create BLOCKER-CLEAR task
3. Assign to agent with ETA
4. Put at TOP of their direction file (P0 priority)

**Acceptance**: All blockers have BLOCKER-CLEAR tasks with owners & ETAs

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

| Step | Duration | Cumulative |
|------|----------|------------|
| 1. Collect | 30 min | 30 min |
| 2. Consolidate | 45 min | 1h 15min |
| 3. Conflict Check | 15 min | 1h 30min |
| 4. Mark Done | 30 min | 2h |
| 5. Blockers | 45 min | 2h 45min |
| 6. Assign Work | 60 min | 3h 45min |
| 7. Summary | 15 min | 4h |

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

