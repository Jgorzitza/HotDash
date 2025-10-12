# Manager Process Improvements - Preventing Agent Confusion

**Date**: 2025-10-13  
**Context**: Last restart resulted in agents following bloated direction files with outdated tasks  
**Goal**: Ensure agents always start with clear, current priorities

---

## 🚨 WHAT WENT WRONG LAST TIME

**Problem**: Agents woke up to direction files with:
- 900+ lines with 400 tasks (engineer.md)
- 10X expansion tasks burying P0 blockers
- Completed tasks still listed
- No clear "start here" marker
- Mix of current work, future work, and historical tasks

**Result**:
- Agents worked on wrong tasks (future work instead of blockers)
- Confusion about priorities
- Wasted time reading 900 lines to find current task
- Some agents created violation files (restart status files)

---

## ✅ RECOMMENDED PROCESS CHANGES

### Change 1: **MANDATORY "START HERE NOW" Section**

**Add to EVERY direction file** at the very top after Canon:

```markdown
## ⚡ START HERE NOW (Last Updated: YYYY-MM-DD HH:MM UTC by Manager)

**READ THIS FIRST - DO NOT SCROLL DOWN UNTIL YOU'VE READ THIS SECTION**

**Your immediate priority**: [One specific task]
**Status**: [Not started / In progress / Blocked by X]
**First command to run**: 
\`\`\`bash
[Exact command]
\`\`\`

**Expected outcome**: [What success looks like]
**Evidence required**: [What to log/capture]
**Deadline**: [Specific time]
**Next task after this**: [What comes next]

---

## 🚨 DO NOT WORK ON TASKS BELOW THIS LINE UNTIL THE ABOVE IS COMPLETE

---
```

**Benefit**: Agents immediately know what to do, no hunting through 900 lines

---

### Change 2: **ACTIVE vs ARCHIVED Task Separation**

**Direction file structure**:

```markdown
## 🎯 ACTIVE TASKS (Current Work Only - Max 20 tasks)

### P0 - LAUNCH BLOCKERS (Do These First)
[Only tasks blocking production launch]

### P1 - IMPORTANT (After P0 Complete)
[Only tasks needed for launch but not blocking]

### P2 - NICE TO HAVE (If Time Permits)
[Only if everything else done]

---

## 📚 FUTURE WORK (DO NOT START - See Archive)

**Important**: The tasks below are NOT current priorities.
They are archived for future reference.

**Current archive**: artifacts/<agent>/task-archive-YYYY-MM-DD.md

**Do NOT work on these until**:
1. All P0/P1 tasks above are complete
2. Manager explicitly moves them back to ACTIVE
3. Launch is complete and stable

[Link to archive only - don't list 400 tasks here]
```

**Benefit**: Clear boundary between "do now" and "do later"

---

### Change 3: **Direction File Size Limit (Enforced)**

**Rule**: Active direction files must be <300 lines

**Manager shutdown check**:
```bash
# Flag any direction >300 lines
wc -l docs/directions/*.md | awk '$1 > 300 {print $2" NEEDS CLEANUP ("$1" lines)"}'

# Auto-fail shutdown if any are >300 lines without archiving
```

**Enforcement**: Manager cannot complete shutdown until oversized files cleaned

**Benefit**: Forces discipline, prevents bloat

---

### Change 4: **Direction File Version Stamp**

**Add to every direction file header**:

```markdown
---
epoch: 2025.10.E1
doc: docs/directions/engineer.md
owner: manager
last_reviewed: 2025-10-13
last_cleaned: 2025-10-13  # ⭐ NEW
task_count: 15  # ⭐ NEW
priority_focus: P0 Blockers  # ⭐ NEW
expires: 2025-10-20
---
```

**Benefit**: Agents can see at a glance if direction is fresh or stale

---

### Change 5: **Completed Tasks Removed Immediately**

**Current problem**: Completed tasks stay in direction file

**New rule**: When agent completes a task:
1. Agent logs completion in feedback
2. Manager removes task from direction file in next shutdown
3. Task moves to archive or completion log

**Implementation**:
```markdown
## Recently Completed (Last 3 days)
- Task 5: GA Integration ✅ (2025-10-12) - Evidence: feedback/engineer.md
- Task 7: Agent SDK Deploy ✅ (2025-10-13) - Evidence: artifacts/engineer/

**Full completion history**: artifacts/<agent>/completions-log.md
```

**Benefit**: Direction only shows CURRENT work, not history

---

### Change 6: **Automated Direction Bloat Alert**

**Create script**: `scripts/ops/check-direction-bloat.sh`

```bash
#!/bin/bash
# Alert if direction files too large

for file in docs/directions/*.md; do
  lines=$(wc -l < "$file")
  agent=$(basename "$file" .md)
  
  if [ $lines -gt 300 ]; then
    echo "⚠️  $agent.md: $lines lines (MAX: 300) - CLEANUP REQUIRED"
  fi
  
  # Check for "START HERE NOW" section
  if ! grep -q "START HERE NOW" "$file"; then
    echo "❌ $agent.md: Missing 'START HERE NOW' section"
  fi
  
  # Check last cleaned date
  last_cleaned=$(grep "last_cleaned:" "$file" | cut -d: -f2 | tr -d ' ')
  if [ -z "$last_cleaned" ]; then
    echo "⚠️  $agent.md: No last_cleaned date"
  fi
done
```

**Run during**: Manager startup (alerts you) and shutdown (prevents completion)

**Benefit**: Catches bloat before it becomes a problem

---

### Change 7: **Agent "Current Task" Marker File**

**Create**: `.current-task/<agent>` files

```bash
# Engineer creates this when starting a task
mkdir -p .current-task
echo "Task 1: Fix build failure - Started: 2025-10-13 14:00 UTC" > .current-task/engineer

# Manager can quickly see who's working on what
ls -la .current-task/
cat .current-task/*
```

**Benefit**: At-a-glance view of all agent current work

---

### Change 8: **Daily Direction Refresh Requirement**

**Rule**: Manager MUST clean at least 3 direction files per day

**Track in manager feedback**:
```markdown
## Daily Direction Cleanup Log

**2025-10-13**:
- engineer.md: Cleaned (900 → 240 lines, archived 10X expansion)
- qa.md: Cleaned (420 → 180 lines, removed completed tasks)
- data.md: Cleaned (500 → 210 lines, archived future work)
```

**Benefit**: Prevents accumulation, keeps files perpetually fresh

---

### Change 9: **"Pause Line" in Direction Files**

**Add visual separator**:

```markdown
## 🎯 ACTIVE TASKS (Current Work Only)

[P0, P1, P2 tasks here - max 20 tasks]

---

## ⛔ PAUSE LINE - DO NOT CROSS UNTIL ACTIVE TASKS COMPLETE

Everything below this line is FUTURE WORK or ARCHIVED.

**If you're reading this far, STOP and check with manager.**

You should be working on ACTIVE TASKS above, not these.

---

## 📚 ARCHIVED TASKS (For Reference Only)

[Link to archive, don't list 400 tasks]
```

**Benefit**: Explicit visual stop sign prevents agents from wandering into old tasks

---

### Change 10: **Pre-Restart Direction Snapshot**

**Before agents restart, manager creates**:

```bash
# Snapshot current direction files
mkdir -p artifacts/manager/direction-snapshots/$(date +%Y-%m-%d)/

cp docs/directions/*.md artifacts/manager/direction-snapshots/$(date +%Y-%m-%d)/

# Create index
cat > artifacts/manager/direction-snapshots/$(date +%Y-%m-%d)/INDEX.md << EOF
# Direction Snapshot - $(date +%Y-%m-%d)

**Purpose**: Preserve direction state before restart/cleanup
**Why**: Allows comparing "before" and "after" to verify cleanup

**Files**: 18 agent direction files as of $(date +%Y-%m-%d)

**Use if**: Agent claims "but my direction said X" - you can verify
EOF
```

**Benefit**: Audit trail, can prove what direction was given

---

## 🎯 RECOMMENDED STARTUP CHANGES

### Add to Step 4 (Blocker Scan):

**Enhanced blocker scan with categorization**:
```bash
# Create categorized blocker report
cat > /tmp/blocker-report.md << 'EOF'
# Blocker Report - $(date +%Y-%m-%d)

## 🔴 P0 - LAUNCH BLOCKING
[Issues that prevent deployment]

## 🟡 P1 - SERIOUS
[Issues that should be fixed soon]

## 🟢 P2 - MINOR  
[Issues that can wait]

## ✅ FALSE ALARMS
[Things that looked like blockers but aren't]
EOF

# Then categorize each blocker found
```

**Benefit**: Prioritized blocker list, not just a dump

---

### Add to Step 7 (Idle Agents):

**Check agent activity timestamps**:
```bash
# More precise activity check
for agent in engineer qa data ai deployment reliability integrations chatwoot designer enablement support marketing product compliance localization git-cleanup engineer-helper qa-helper; do
  if [ -f "feedback/$agent.md" ]; then
    last_entry=$(tail -200 feedback/$agent.md | grep "^## 2025" | tail -1 | cut -d' ' -f2)
    echo "$agent: Last activity $last_entry"
  else
    echo "$agent: ❌ NO FEEDBACK FILE"
  fi
done | column -t | tee /tmp/agent-activity-times.txt

# Flag agents with no activity in 24 hours
```

**Benefit**: Precise idle detection with timestamps

---

## 🎯 RECOMMENDED SHUTDOWN CHANGES

### Add to Step 2 (Direction Cleanup):

**Template for cleaned direction files**:

```markdown
---
epoch: 2025.10.E1
doc: docs/directions/engineer.md
owner: manager
last_reviewed: 2025-10-13
last_cleaned: 2025-10-13  ⭐ UPDATED BY MANAGER
task_count: 15  ⭐ COUNTED BY MANAGER
priority_focus: P0 Blockers  ⭐ SET BY MANAGER
expires: 2025-10-20
---

# Engineer — Direction

## 🔒 NON-NEGOTIABLES
[6 iron rules]

## Canon
[References]

## 🚨 MCP MANDATE
[MCP requirements]

## ⚡ START HERE NOW (Updated: YYYY-MM-DD HH:MM UTC by Manager)

**FIRST THING TOMORROW**: [Specific action]

[Clear priority, command, expected outcome]

---

## 🎯 ACTIVE TASKS (Max 20 tasks, P0 first)

### P0 - LAUNCH BLOCKERS (3 tasks)
### P1 - IMPORTANT (5 tasks)
### P2 - NICE TO HAVE (2 tasks)

---

## ⛔ PAUSE LINE - DO NOT CROSS

Everything below is archived or future work.

**Archived tasks**: artifacts/engineer/task-archive-YYYY-MM-DD.md (650 tasks)

**When to resume archived work**:
1. After launch is complete (Oct 15+)
2. After manager re-prioritizes based on operator feedback
3. When manager explicitly moves tasks back to ACTIVE
```

**Benefit**: Consistent structure, easy to scan, impossible to miss priorities

---

### Add to Step 5 (Assign Tomorrow's Direction):

**Priority Decision Matrix**:

```markdown
## Manager Priority Decision Matrix

**For EVERY task an agent might work on, ask**:

1. **Does it fix a blocker?** 
   - YES → P0 (do immediately)
   - NO → Continue to Q2

2. **Does it enable another agent's P0 work?**
   - YES → P0 (dependency blocker)
   - NO → Continue to Q3

3. **Is it needed for production launch?**
   - YES → P1 (important)
   - NO → Continue to Q4

4. **Does it directly support one of the 5 tiles?**
   - YES → P1 (North Star aligned)
   - NO → Continue to Q5

5. **Is the product currently working without it?**
   - YES (working) → P2 or Archive (nice-to-have)
   - NO (broken) → Back to Q1 (it's a blocker!)

**Default if uncertain**: P2 or ask CEO

**Archive if**:
- Future feature
- Optimization for non-existent load
- "Wouldn't it be cool if..."
- Any task >2 weeks out
```

**Benefit**: Consistent prioritization, prevents drift

---

## 🚨 CRITICAL ADDITIONS TO CHECKLISTS

### Startup Addition: **"Stale Direction" Alert**

**Add to Step 9** (after reviewing direction files):

```bash
# Check if direction files are stale (not cleaned recently)
for agent in engineer qa data ai deployment reliability integrations chatwoot; do
  last_cleaned=$(grep "last_cleaned:" docs/directions/$agent.md | cut -d: -f2 | tr -d ' ')
  
  if [ -z "$last_cleaned" ]; then
    echo "⚠️  $agent.md: Never cleaned - CLEANUP REQUIRED TODAY"
  else
    days_old=$(( ( $(date +%s) - $(date -d "$last_cleaned" +%s) ) / 86400 ))
    if [ $days_old -gt 7 ]; then
      echo "⚠️  $agent.md: Last cleaned $days_old days ago - CLEANUP RECOMMENDED"
    fi
  fi
done
```

**Rule**: If direction not cleaned in 7 days, clean it during shutdown

**Benefit**: Prevents stale direction accumulation

---

### Shutdown Addition: **Direction File Quality Gates**

**Add to Step 3** (after cleaning directions):

**BEFORE saving cleaned direction, verify**:

```bash
# Quality checks for cleaned direction file
check_direction_quality() {
  local file=$1
  local agent=$(basename "$file" .md)
  
  echo "=== Quality check: $agent.md ==="
  
  # Check 1: Size
  lines=$(wc -l < "$file")
  if [ $lines -gt 300 ]; then
    echo "❌ FAIL: $lines lines (max 300)"
    return 1
  fi
  
  # Check 2: Has START HERE NOW
  if ! grep -q "START HERE NOW" "$file"; then
    echo "❌ FAIL: Missing 'START HERE NOW' section"
    return 1
  fi
  
  # Check 3: Has PAUSE LINE
  if ! grep -q "PAUSE LINE\|DO NOT CROSS" "$file"; then
    echo "⚠️  WARN: No pause line (recommended)"
  fi
  
  # Check 4: P0 tasks exist (if agent has work)
  if grep -q "ACTIVE TASKS" "$file"; then
    if ! grep -q "P0" "$file"; then
      echo "⚠️  WARN: Active tasks but no P0 priority"
    fi
  fi
  
  # Check 5: Last cleaned date is today
  if ! grep -q "last_cleaned: $(date +%Y-%m-%d)" "$file"; then
    echo "⚠️  WARN: last_cleaned date not updated to today"
  fi
  
  # Check 6: Task count matches header
  stated_count=$(grep "task_count:" "$file" | grep -o '[0-9]*')
  actual_count=$(grep -c "^### Task\|^\*\*Task" "$file")
  if [ "$stated_count" != "$actual_count" ]; then
    echo "⚠️  WARN: task_count header ($stated_count) doesn't match actual ($actual_count)"
  fi
  
  echo "✅ PASS: Quality checks passed"
  return 0
}

# Run for each cleaned file
for file in docs/directions/engineer.md docs/directions/qa.md; do
  check_direction_quality "$file" || echo "FIX REQUIRED before committing"
done
```

**Benefit**: Automated quality enforcement

---

### Shutdown Addition: **Agent Direction Summary Email**

**Create digest for CEO** (optional):

```bash
cat > /tmp/agent-readiness-report.md << 'EOF'
# Agent Readiness Report - $(date +%Y-%m-%d)

**For**: CEO
**From**: Manager
**Purpose**: Summary of agent status going into tomorrow

## Ready to Work (Clear Direction)
1. Engineer: P0 blocker (build fix, RLS fix) - 2 hours work
2. QA: P0 testing - waiting for Engineer
3. Data: P0 RLS policies - 2 hours work

## Blocked (Waiting on Dependencies)
1. Support: Waiting for Engineer Task 3 (Approval UI)
2. AI: Waiting for Engineer (LlamaIndex fix)

## Idle (No Current Work)
1. Marketing: All P0 tasks complete, standing by
2. Designer: All specs delivered, standing by

## Paused (Explicitly)
1. Git-Cleanup: Paused until Oct 16 per direction

## Direction Files Cleaned Today
- engineer.md: 900 → 240 lines (archived 660 lines)
- qa.md: 420 → 175 lines (archived 245 lines)
- Focus: P0 blockers only

## Tomorrow's Critical Path
1. Engineer fixes build (14:00 UTC)
2. Engineer fixes RLS (16:00 UTC)  
3. QA tests build (16:30 UTC)
4. Engineer builds Approval UI (20:00 UTC)
5. QA tests E2E (22:00 UTC)

**Launch readiness**: 75% → 90% if critical path executes

EOF
```

**Benefit**: CEO knows team status at a glance

---

## 🎯 PROCESS ENFORCEMENT RECOMMENDATIONS

### Recommendation 1: **Daily Direction Cleanup Rule**

**Mandate**: Manager must clean at least 3 direction files per day

**Track in manager feedback**:
```markdown
## Daily Direction Cleanup Scorecard

**Week of Oct 13**:
- Monday: 5 files cleaned (engineer, qa, data, deployment, compliance)
- Tuesday: 3 files cleaned (ai, integrations, reliability)
- Wednesday: 2 files cleaned (support, marketing)
- Thursday: [planned]
- Friday: [planned]

**Goal**: All 18 files cleaned weekly (rotate through them)
```

---

### Recommendation 2: **"Max 20 Active Tasks" Rule**

**Enforce**: No agent direction can have >20 tasks in ACTIVE section

**If agent needs more**:
1. Complete current tasks first
2. Or manager re-prioritizes: moves some to archive, promotes others

**Rationale**: 20 tasks = 40-100 hours of work = plenty of backlog

---

### Recommendation 3: **Weekly "Fresh Start" Reset**

**Every Monday morning**:
1. Manager reviews ALL 18 direction files
2. Removes completed tasks from previous week
3. Archives all P2/P3 tasks
4. Re-prioritizes based on current blockers
5. All agents get clean, focused direction for the week

**Benefit**: Prevents accumulation, weekly clarity

---

## 📊 METRICS TO TRACK

**Manager should track**:
1. **Direction file sizes** (trend over time)
2. **Tasks per agent** (active vs archived)
3. **Cleanup frequency** (how often you clean each file)
4. **Agent confusion incidents** (times agents worked on wrong task)
5. **Bloat prevention** (how quickly you catch oversized files)

**Target metrics**:
- Direction files: <250 lines average
- Active tasks: <15 per agent
- Cleanup cycle: Every file cleaned weekly
- Agent confusion: 0 incidents
- Bloat detection: Same day

---

## ✅ IMPLEMENTATION PRIORITY

**Implement immediately** (today):
1. ✅ "START HERE NOW" section in all direction files
2. ✅ PAUSE LINE separating active from archived
3. ✅ Direction file size check in shutdown
4. ✅ Update last_cleaned dates

**Implement this week**:
5. ⏳ Automated bloat alert script
6. ⏳ Direction quality gates
7. ⏳ .current-task marker files

**Implement next week**:
8. ⏳ Weekly fresh start process
9. ⏳ Priority decision matrix training
10. ⏳ Agent readiness reports

---

## 🎯 SUMMARY: PREVENTING CONFUSION

**Root cause of last restart confusion**:
- Direction files bloated (900 lines)
- No clear "start here"
- Completed tasks still listed
- Future work mixed with current work
- No visual separation

**Solution** (implemented in checklists):
- ✅ Mandatory "START HERE NOW" section
- ✅ Direction file size limit (<300 lines)
- ✅ PAUSE LINE visual separator
- ✅ Archive process (tasks not deleted, just moved)
- ✅ Manager must clean files during shutdown
- ✅ Quality gates prevent oversized files
- ✅ Version stamps show freshness

**Agents will now**:
- Start with clear "do this first" instruction
- See P0 blockers immediately (not buried)
- Know when to stop reading (PAUSE LINE)
- Work on current priorities (not old tasks)

---

**Created**: 2025-10-13  
**Owner**: Manager  
**Purpose**: Prevent agent confusion from bloated/stale direction files  
**Next**: Implement in your shutdown checklist updates

