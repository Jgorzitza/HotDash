---
epoch: 2025.10.E1
doc: docs/runbooks/manager_shutdown_checklist.md
owner: CEO
last_reviewed: 2025-10-13
expires: 2025-10-20
---

# Manager Shutdown Checklist

**Purpose**: Manager's end-of-session cleanup - prepare agents for tomorrow, clean directions, document status  
**Time**: 20-45 minutes  
**Frequency**: End of every work session  
**Critical**: Your cleanup determines whether agents start tomorrow focused or confused

---

## 🚨 PHASE 1: DIRECTION FILE CLEANUP (10-20 minutes)

**CRITICAL**: Direction files accumulate tasks over time. You must clean them so agents focus on what matters.

### Step 1: Identify Bloated Direction Files (2 minutes)

```bash
cd ~/HotDash/hot-dash

# Find oversized direction files
wc -l docs/directions/*.md | sort -n | tail -20 | tee /tmp/direction-sizes.txt

# Flag any >300 lines for cleanup
wc -l docs/directions/*.md | awk '$1 > 300 {print $2, "("$1" lines) - NEEDS CLEANUP"}'
```

**Checkpoint**: ✅ Know which directions need cleanup

---

### Step 2: Clean Each Bloated Direction File (2-5 minutes per file)

**For each direction file >300 lines OR with completed/outdated tasks**:

**2A. Read the file and identify**:
```bash
# Example: engineer.md is 900+ lines
cat docs/directions/engineer.md | grep -n "Task\|P0\|P1\|Complete\|PAUSED"
```

**Mark for removal**:
- ✅ Completed tasks (unless they're reference/templates)
- ✅ Paused tasks (move to bottom or remove if not resuming)
- ✅ P2/P3 tasks when P0 blockers exist
- ✅ 10X expansion tasks (hundreds of future tasks burying current work)
- ✅ Outdated priorities
- ✅ Conflicting instructions

**Keep**:
- ❌ P0 blockers and current work
- ❌ P1 important tasks aligned to North Star
- ❌ Clear, actionable next steps
- ❌ MCP tool mandates
- ❌ Non-negotiables

**2B. Create clean, focused direction**:
```bash
# Back up current version
cp docs/directions/engineer.md docs/directions/engineer.md.backup-$(date +%Y-%m-%d)

# Create new focused version (manual edit or script)
# Structure:
# 1. Non-negotiables (keep)
# 2. Canon references (keep)
# 3. MCP mandate (keep)
# 4. ACTIVE TASKS (clean: P0 first, then P1, max 20 tasks)
# 5. Archive link (for removed tasks)
```

**Example cleanup for engineer.md**:
```markdown
## 🎯 ACTIVE TASKS (Execute in Priority Order)

### 🚨 P0 LAUNCH BLOCKERS (Do These First):

**Task 1: Fix Build Failure** (30 minutes)
- Issue: Import resolution error in chatwoot-approvals
- File: app/routes/chatwoot-approvals.$id.approve/route.tsx
- Fix: Change import path from ~/../../packages to correct path
- Verify: npm run build succeeds
- Evidence: Build output, commit
- Deadline: TODAY 14:00 UTC

**Task 2: Fix RLS Security** (1 hour)
- Issue: 51 tables without RLS per Supabase advisor
- Priority: Critical security risk
- Verify with: Supabase MCP get_advisors
- Evidence: advisor run showing 0 critical issues
- Deadline: TODAY 16:00 UTC

### 📋 P1 IMPORTANT (After P0 Complete):

**Task 3: Complete Approval UI** (3 hours)
- Prerequisites: Tasks 1-2 complete
- Build minimal functional UI
- Evidence: Working in Shopify Admin
- Deadline: TODAY 20:00 UTC

## 📚 FUTURE WORK (Do NOT Start Until Launch Complete)

**100+ tasks archived**: See artifacts/engineer/task-archive-YYYY-MM-DD.md

These will be re-prioritized after launch. Focus on P0/P1 only.
```

**2C. Move removed tasks to archive**:
```bash
# Create task archive
mkdir -p artifacts/engineer/

cat > artifacts/engineer/task-archive-$(date +%Y-%m-%d).md << 'EOF'
# Engineer Tasks - Archived $(date +%Y-%m-%d)

These tasks were removed from active direction to maintain focus on launch blockers.
They will be re-prioritized after launch is complete.

## Archived Tasks (200+ tasks)

[Copy the 10X expansion tasks here]

## When to Resume

After launch is complete and stable (est. Oct 15+), manager will:
1. Review this archive
2. Re-prioritize based on operator feedback
3. Add back to direction in manageable chunks (10-20 tasks at a time)
EOF
```

**Checkpoint**: ✅ Direction file clean and focused

---

### Step 3: Repeat for All Bloated Directions (10-15 minutes total)

**Priority agents to clean** (they directly affect launch):
1. Engineer (usually most bloated)
2. QA
3. Data
4. Deployment
5. Compliance

**Quick clean for others**: Remove completed tasks, keep current work

**Checkpoint**: ✅ All direction files focused on current priorities

---

## 📊 PHASE 2: ASSIGN TOMORROW'S STARTUP DIRECTION (5-10 minutes)

### Step 4: Create "Tomorrow's Priorities" for Each Agent (5-8 minutes)

**Based on blockers found and North Star alignment**:

```bash
cat > /tmp/tomorrow-assignments.md << 'EOF'
# Agent Assignments - Starting [Tomorrow's Date]

## IMMEDIATE PRIORITIES (Start with these):

**Engineer**:
- P0: Fix build failure (file: chatwoot-approvals, 30 min)
- P0: Fix RLS on 51 tables (verify with Supabase MCP, 1 hour)
- P1: Complete Approval UI (after P0, 3 hours)
- READ: docs/directions/engineer.md (cleaned, focused on P0/P1 only)

**QA**:
- P0: Verify build after Engineer fixes (30 min)
- P0: Run E2E tests when build works (1 hour)
- P1: Security audit on RLS fixes (30 min)
- READ: docs/directions/qa.md

**Data**:
- P0: Apply RLS policies to 51 tables (use Supabase MCP, 2 hours)
- P1: Verify with get_advisors (security type)
- EVIDENCE: Supabase advisor showing 0 critical issues

**Deployment, Reliability, Integrations**:
- Monitor services, support Engineer/QA as needed
- No new work until P0 blockers cleared

**All Other Agents**:
- PAUSED until launch blockers resolved
- Standing by for assignments after P0 complete

## BLOCKED/WAITING:
- Support: Waiting for Approval UI (Engineer Task 3)
- AI: Waiting for LlamaIndex query fix (Engineer)
- Enablement: Waiting for UI to record videos

## FOCUS FOR TOMORROW:
🎯 LAUNCH BLOCKERS ONLY - No feature work until these are resolved
EOF

cat /tmp/tomorrow-assignments.md
```

**Checkpoint**: ✅ Clear assignments ready for agents

---

### Step 5: Update Agent Direction Files with Tomorrow's Focus (2-5 minutes)

**For agents with P0 work, add clear start direction**:

```bash
# Example: Update engineer.md with clear "START HERE TOMORROW"
cat > /tmp/engineer-tomorrow.md << 'EOF'

---

## ⚡ START HERE TOMORROW (Updated: YYYY-MM-DD by Manager)

**FIRST THING**: Read this section, then execute Task 1 immediately.

**Your P0 blockers** (must complete before other work):
1. Fix build failure (30 min) - See Task 1 details above
2. Fix RLS security (1 hour) - See Task 2 details above

**Do NOT work on**:
- Approval UI (Task 3) until Tasks 1-2 complete
- Any P2/P3 tasks
- Future expansion tasks (archived)

**Start command**: 
\`\`\`bash
cd ~/HotDash/hot-dash
# Fix import in app/routes/chatwoot-approvals.$id.approve/route.tsx
# Change: ~/../../packages/integrations/chatwoot
# To: Correct path
npm run build  # Verify fix works
\`\`\`

**Manager checking**: 14:00 UTC (expect Task 1 complete)

EOF

# Add to top of ACTIVE TASKS section (manual edit or script)
```

**Checkpoint**: ✅ Agents have clear "start here tomorrow" direction

---

## 📝 PHASE 3: DOCUMENT & COMMIT (5-10 minutes)

### Step 6: Create Manager Summary (3-5 minutes)

```bash
cat > /tmp/manager-session-summary.md << 'EOF'
# Manager Session Summary - $(date +%Y-%m-%d)

## Session Duration
- Start: [time]
- End: [time]
- Duration: [X hours]

## Blockers Found
**P0 (Launch blocking)**: [count]
1. [Blocker 1] - Owner: [agent], Deadline: [time]
2. [Blocker 2] - Owner: [agent], Deadline: [time]

**P1 (Important)**: [count]
1. [Issue 1] - Owner: [agent]

## Agent Status
- **Active**: [count] agents ([list])
- **Blocked**: [count] agents ([list])
- **Idle**: [count] agents ([list])

## Direction Files Cleaned
- [agent].md - Reduced from [X] to [Y] lines
- [agent].md - Archived 100+ future tasks
- Focus: P0 blockers only until launch

## Assignments for Tomorrow
- See: /tmp/tomorrow-assignments.md
- Updated: [count] direction files with "START HERE TOMORROW"
- Priority: Launch blockers first

## North Star Alignment
- ✅ Aligned: [% of work on 5 tiles / blockers]
- ⚠️ Drift: [% of work on future/non-critical]
- Action: Refocused [agents] on blockers

## Project Health
- Build: [✅ Working / ❌ Broken]
- TypeScript: [X errors]
- Tests: [X/Y passing]
- Services: [count healthy / count down]
- Launch readiness: [%]

## Next Session Priorities
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

EOF

cat /tmp/manager-session-summary.md
```

**Checkpoint**: ✅ Session documented

---

### Step 7: Update Manager Status Summary (2 minutes)

**Update top of feedback/manager.md**:

```markdown
## CURRENT STATUS (Updated: YYYY-MM-DD HH:MM UTC)

**Focus**: Coordinate 18 agents for Hot Rod AN launch Oct 13-15
**Active blockers**: [count] P0, [count] P1
**Agent status**: [X active, Y blocked, Z idle]
**Today's priority**: [Main focus]
**Next session starts with**: Review agent feedback for overnight work, verify blocker resolutions

### Current Blockers (P0)
1. Build failure - Owner: Engineer, Deadline: TODAY 14:00 UTC
2. RLS security - Owner: Data, Deadline: TODAY 16:00 UTC

### Agent Assignments (Active)
- Engineer: P0 blockers (build + RLS)
- QA: Standing by for testing
- Data: RLS fixes
- Others: Paused or monitoring

### Direction Files Cleaned Today
- engineer.md: 900+ lines → 250 lines (archived 10X expansion)
- qa.md: 400 lines → 180 lines (removed completed tasks)
- Focus: P0 blockers only

### Archived History
**Full session logs**: artifacts/manager/feedback-archive-YYYY-MM-DD.md
```

**Checkpoint**: ✅ Status summary current

---

### Step 8: Log Session End (1 minute)

```bash
cat >> feedback/manager.md << EOF

---

## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Manager Session Ended

**Duration**: [X hours]
**Blockers identified**: [count] P0, [count] P1
**Blockers assigned**: ✅ All assigned to owners with deadlines
**Direction files cleaned**: [count] files ([total lines removed])
**Agents refocused**: [count] agents redirected to P0 work
**Tomorrow's assignments**: ✅ Created and added to direction files

**Shutdown checklist**: ✅ Complete
- Direction files cleaned ✅
- Tomorrow's priorities assigned ✅
- Session documented ✅
- All work committed ✅

**Next session**: Review agent overnight work, verify blocker resolutions, adjust priorities

EOF
```

**Checkpoint**: ✅ Session end logged

---

## 💾 PHASE 4: COMMIT & VERIFY (3-5 minutes)

### Step 9: Commit Direction File Changes (2 minutes)

```bash
# Stage cleaned direction files
git add docs/directions/*.md

# Stage archived tasks
git add artifacts/*/task-archive-*.md

# Stage manager feedback
git add feedback/manager.md

# Review changes
git status
git diff --cached --stat

# Commit with clear message
git commit -m "feat(manager): session complete - direction cleanup and assignments

Manager Session: $(date +%Y-%m-%d)
Duration: [X hours]

DIRECTION FILES CLEANED (Removed bloat, focused on P0):
- engineer.md: 900 → 250 lines (archived 650 lines of 10X expansion)
- qa.md: 400 → 180 lines (removed completed tasks)
- data.md: 500 → 220 lines (archived future work)
- [list others]

ARCHIVED TASKS:
- artifacts/engineer/task-archive-$(date +%Y-%m-%d).md (650 lines)
- artifacts/qa/task-archive-$(date +%Y-%m-%d).md (220 lines)
- [list others]

FOCUS RESTORED:
- All direction files now lead with P0 blockers
- 10X expansion tasks archived (not deleted)
- Future work clearly separated from current work
- 'START HERE TOMORROW' added to critical agents

BLOCKERS IDENTIFIED:
- [count] P0 blockers assigned with deadlines
- [count] P1 issues noted
- [count] idle agents given direction

AGENT ASSIGNMENTS FOR TOMORROW:
- Engineer: Fix build (30m), Fix RLS (1h), Approval UI (3h)
- QA: Test build, run E2E, verify RLS
- Data: Apply RLS policies (2h)
- Others: Paused or monitoring until P0 clear

NORTH STAR ALIGNMENT:
- Refocused [count] agents from future work to blockers
- Prioritized: Blockers > Features
- Prioritized: Working product > Documentation

Evidence: feedback/manager.md, /tmp/tomorrow-assignments.md"

# Verify commit
git log -1 --stat
```

**Checkpoint**: ✅ Direction cleanup committed

---

### Step 10: Archive Manager Feedback if Needed (2-3 minutes)

```bash
# Check manager feedback size
wc -l feedback/manager.md

# If >800 lines, archive
if [ $(wc -l < feedback/manager.md) -gt 800 ]; then
  mkdir -p artifacts/manager
  
  # Archive full history
  cp feedback/manager.md artifacts/manager/feedback-archive-$(date +%Y-%m-%d-%H%M).md
  
  # Create clean version with summary + recent work
  # (Manual edit or script - keep CURRENT STATUS + last 300 lines)
  
  echo "✅ Archived manager feedback to: artifacts/manager/feedback-archive-$(date +%Y-%m-%d-%H%M).md"
fi
```

**Checkpoint**: ✅ Manager feedback clean

---

## 📊 PHASE 2: FINAL VERIFICATION (5-10 minutes)

### Step 11: Verify All Agents Have Direction (3 minutes)

```bash
# Check each agent has clear direction for tomorrow
for agent in engineer qa data ai deployment reliability integrations chatwoot designer enablement support marketing product compliance localization git-cleanup engineer-helper qa-helper; do
  
  # Check direction file exists
  if [ ! -f "docs/directions/$agent.md" ]; then
    echo "❌ MISSING: docs/directions/$agent.md"
  else
    # Check it has ACTIVE TASKS
    if grep -q "ACTIVE TASKS\|Current Sprint\|P0" docs/directions/$agent.md; then
      echo "✅ $agent: Has active tasks"
    else
      echo "⚠️  $agent: No clear active tasks (needs direction)"
    fi
  fi
done | tee /tmp/direction-verification.txt

cat /tmp/direction-verification.txt
```

**Fix any ⚠️ or ❌**:
- Missing direction: Create basic direction file
- No active tasks: Add clear current task or mark as "PAUSED"

**Checkpoint**: ✅ All 18 agents have clear direction

---

### Step 12: Verify Blocker Assignments (2 minutes)

```bash
# Review your blocker list
cat /tmp/p0-blockers.md

# For each blocker, verify:
# 1. Owner assigned? (Which agent must fix)
# 2. Deadline set? (When it must be done)
# 3. In agent's direction? (Agent knows about it)
# 4. Logged in manager feedback? (Audit trail)

# Check
grep -i "blocker" feedback/manager.md | tail -10
```

**All blockers must have**:
- ✅ Owner (specific agent)
- ✅ Deadline (specific time)
- ✅ In agent's direction file (as P0 Task)
- ✅ Logged in manager feedback

**Checkpoint**: ✅ No orphaned blockers

---

### Step 13: Verify No Agents are Idle Without Reason (2 minutes)

```bash
# Check for idle agents
grep -i "idle\|standing by\|waiting\|blocked" /tmp/agent-activity.txt

# For each idle/blocked agent, verify:
# 1. Is the blocker real? (Check dependency status)
# 2. Is there other work they can do? (Check direction file)
# 3. Should they be paused? (Mark clearly in direction)
```

**Fix idle agents**:
- If truly blocked: OK, note in manager feedback
- If waiting but could do other work: Assign work in direction
- If no work: Mark as "PAUSED - Resume after [condition]"

**Checkpoint**: ✅ No idle agents without clear reason

---

### Step 14: Create Tomorrow's Manager Plan (2-3 minutes)

```bash
cat > /tmp/manager-tomorrow.md << 'EOF'
# Manager Plan - Tomorrow $(date -d tomorrow +%Y-%m-%d)

## First Thing (15 minutes):
1. Run manager_startup_checklist.md
2. Check if P0 blockers resolved overnight:
   - Engineer: Build fixed? (verify: npm run build)
   - Data: RLS applied? (verify: Supabase MCP get_advisors)
3. Review agent feedback for overnight work

## If P0 Resolved (Morning):
- Unblock waiting agents (Support, AI, Enablement)
- Shift focus to P1 tasks
- Monitor E2E testing (QA)

## If P0 NOT Resolved (Morning):
- Escalate to CEO
- Delay launch decision
- Reassign work if needed

## Throughout Day:
- Monitor agent progress (check feedback every 2 hours)
- Remove blockers as they arise (<15 min response)
- Verify evidence for completed work
- Keep agents focused (redirect if drift detected)

## End of Day:
- Run manager_shutdown_checklist.md
- Clean direction files if bloated
- Assign next day's priorities
EOF

cat /tmp/manager-tomorrow.md
```

**Checkpoint**: ✅ Tomorrow's plan clear

---

## 💾 PHASE 3: FINAL COMMIT & HANDOFF (3-5 minutes)

### Step 15: Commit Manager Work (2 minutes)

```bash
# Stage all manager work
git add feedback/manager.md
git add artifacts/manager/
git add /tmp/*.md  # Move to artifacts first if keeping

# Move temporary files to artifacts
mkdir -p artifacts/manager/session-$(date +%Y-%m-%d)/
cp /tmp/p0-blockers.md artifacts/manager/session-$(date +%Y-%m-%d)/
cp /tmp/tomorrow-assignments.md artifacts/manager/session-$(date +%Y-%m-%d)/
cp /tmp/manager-tomorrow.md artifacts/manager/session-$(date +%Y-%m-%d)/
git add artifacts/manager/session-$(date +%Y-%m-%d)/

# Commit
git commit -m "feat(manager): shutdown complete - ready for tomorrow

Manager session: $(date +%Y-%m-%d)

Direction cleanup:
- [count] files cleaned ([total] lines removed)
- Tasks archived: artifacts/*/task-archive-$(date +%Y-%m-%d).md
- Focus: P0 blockers only

Blockers assigned:
- [count] P0 blockers with owners and deadlines
- [count] P1 issues noted
- [count] idle agents redirected

Tomorrow's plan:
- P0 verification first
- Unblock agents when ready
- Monitor progress, prevent drift

Evidence: artifacts/manager/session-$(date +%Y-%m-%d)/"
```

**Checkpoint**: ✅ Manager work committed

---

### Step 16: Final Verification (1-2 minutes)

```bash
echo "=== Manager Shutdown Verification ==="

# All direction files focused
wc -l docs/directions/*.md | awk '$1 > 400 {print "⚠️  "$2" still large:"$1" lines"}'
# Expected: Nothing or only a few

# All agents have direction
ls docs/directions/*.md | wc -l
# Expected: 18+ files

# Blocker assignments logged
grep "BLOCKER.*Owner:" feedback/manager.md | tail -5
# Expected: See your blocker assignments

# No uncommitted changes
git status -s
# Expected: Empty or minimal

# Tomorrow's assignments exist
ls artifacts/manager/session-$(date +%Y-%m-%d)/tomorrow-assignments.md
# Expected: File exists

echo "✅ Verification complete"
```

**Checkpoint**: ✅ All checks pass

---

## ✅ SHUTDOWN COMPLETE

Your manager work is complete:
- ✅ Direction files cleaned (bloat removed, focus restored)
- ✅ P0 blockers identified and assigned
- ✅ Tomorrow's priorities clear for all agents
- ✅ Idle agents redirected or paused
- ✅ Session documented with evidence
- ✅ All work committed

**Agents will start tomorrow with**:
- Clean, focused direction files
- Clear "START HERE TOMORROW" sections
- P0 blockers at the top
- No confusion from outdated tasks

---

## 🎯 MANAGER SELF-CHECK

Before you confirm shutdown:

1. ✅ Did I identify all P0 blockers?
2. ✅ Did I assign each blocker to an owner with deadline?
3. ✅ Did I clean bloated direction files?
4. ✅ Did I archive removed tasks (not delete them)?
5. ✅ Did I add "START HERE TOMORROW" to critical agents?
6. ✅ Did I verify no agents are idle without reason?
7. ✅ Did I maintain North Star alignment?
8. ✅ Did I prioritize blockers over features?
9. ✅ Did I document my session?
10. ✅ Did I commit all changes?

**All ✅**: Ready to shutdown  
**Any ❌**: Complete that step

---

## 📋 CRITICAL PRINCIPLES (Your Responsibility)

**As Manager, You Must**:
1. **Keep directions focused** - <300 lines, P0 first, clear priorities
2. **Block feature work** - When blockers exist, pause non-critical work
3. **Prevent task bloat** - Archive 10X expansions, surface only current work
4. **Verify agent claims** - "Complete" requires evidence verification
5. **Assign work strategically** - Blockers first, then North Star alignment
6. **No idle agents** - Everyone has current, productive work or is paused with reason
7. **Clean audit trail** - Your feedback shows what you coordinated and why

**You Are The Filter**:
- Between CEO vision (North Star) and agent execution
- Between urgent (blockers) and important (features)
- Between chaos (bloat) and clarity (focus)

**Your shutdown determines whether agents wake up confused or productive.**

---

## ⚡ QUICK SHUTDOWN (Experienced Manager)

**If directions are clean and few changes**:
```bash
cd ~/HotDash/hot-dash

# Quick direction check
wc -l docs/directions/*.md | sort -n | tail -10

# Update status summary in feedback/manager.md (manual)

# Log session end
echo "## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Manager session complete, [X] blockers assigned, directions cleaned" >> feedback/manager.md

# Commit
git add docs/directions/*.md feedback/manager.md artifacts/manager/
git commit -m "feat(manager): session complete - [summary]"
```

**Time**: 10-15 minutes

---

**Created**: 2025-10-13  
**Owner**: CEO  
**Purpose**: Ensure manager maintains focused, blocker-first agent direction  
**Location**: docs/runbooks/manager_shutdown_checklist.md  
**Critical**: Direction cleanup is YOUR job - agents need clear, focused tasks

