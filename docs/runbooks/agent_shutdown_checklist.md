---
epoch: 2025.10.E1
doc: docs/runbooks/agent_shutdown_checklist.md
owner: manager
last_reviewed: 2025-10-13
expires: 2025-10-20
---

# Agent Shutdown Checklist

**Purpose**: Standardized cleanup and shutdown procedure for all agents at end of work session  
**Applies To**: All 18 agents  
**Time**: 10-30 minutes (depending on cleanup needed)  
**Frequency**: End of every work session  
**CRITICAL**: Do NOT skip cleanup - violations compound and confuse other agents

---

## 🚨 PHASE 1: CLEANUP DRIFT & VIOLATIONS (5-15 minutes)

**You MUST clean up any files created in wrong locations before shutdown.**

### Step 1: Scan for Violations (1 minute)

```bash
# Run automated violation scanner (if exists)
./scripts/ops/check-my-violations.sh <your-agent> 2>/dev/null

# OR manually check:
echo "=== Checking for violations ==="

# Files in home directory (VIOLATION)
ls /home/justin/*.md 2>/dev/null | grep -i "<your-agent>\|restart\|status\|summary\|complete"

# Directories outside project (VIOLATION)
ls /home/justin/feedback/ 2>/dev/null
ls /home/justin/docs/ 2>/dev/null
ls /home/justin/data/ 2>/dev/null
ls /home/justin/<your-agent>/ 2>/dev/null

# Files in project root that shouldn't be there (VIOLATION)
ls ~/HotDash/hot-dash/*.md | grep -i "<your-agent>\|restart\|checklist\|status\|ready\|summary\|complete"

# Extra worktrees (VIOLATION)
ls ~/HotDash/ | grep -v "^hot-dash$"
```

**Expected**: All commands show NOTHING or "No such file or directory"  
**If you see files**: Proceed to cleanup steps below

---

### Step 2: Merge & Delete Violation Files (3-10 minutes)

**For each violation file found**:

**2A. Review the file**:
```bash
cat /path/to/violation-file.md
# Determine if content is valuable or redundant
```

**2B. If valuable, merge into correct location**:
```bash
# Example: You created AI_RESTART_READY.md in project root
# Merge into your feedback file:

echo "" >> feedback/<your-agent>.md
echo "## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Merged from AI_RESTART_READY.md" >> feedback/<your-agent>.md
echo "" >> feedback/<your-agent>.md
cat ~/HotDash/hot-dash/AI_RESTART_READY.md >> feedback/<your-agent>.md
echo "" >> feedback/<your-agent>.md
```

**2C. Delete the violation file**:
```bash
rm ~/HotDash/hot-dash/AI_RESTART_READY.md

# Log the cleanup
echo "**Cleanup**: Removed AI_RESTART_READY.md (merged into feedback)" >> feedback/<your-agent>.md
```

**2D. Repeat for ALL violation files**

---

### Step 3: Clean Up Extra Files You Created (2-5 minutes)

**Identify all extra files you created this session**:
```bash
# Find files modified by you in last 24 hours (if applicable)
find ~/HotDash/hot-dash -name "*.md" -mtime -1 | grep -i "<your-agent>\|your-domain"

# Common extra files to remove:
# - <AGENT>_STATUS.md
# - <AGENT>_SUMMARY.md
# - <AGENT>_COMPLETE.md
# - <AGENT>_RESTART_*.md
# - <AGENT>_PERFORMANCE_*.md
# - Untitled drafts, temp files, etc.
```

**For each extra file**:
1. Review content - is it valuable?
2. If yes: Merge into feedback/<your-agent>.md or artifacts/<your-agent>/
3. If no: Just delete
4. Log the action

**Example cleanup**:
```bash
# You created INTEGRATIONS_RESTART_CHECKLIST.md
# Content is your status - belongs in feedback

# Merge
cat INTEGRATIONS_RESTART_CHECKLIST.md >> feedback/integrations.md

# Delete
rm INTEGRATIONS_RESTART_CHECKLIST.md

# Log
echo "**Cleanup**: Removed INTEGRATIONS_RESTART_CHECKLIST.md (merged to feedback)" >> feedback/integrations.md
```

---

### Step 4: Verify Cleanup Complete (1 minute)

**Run final verification**:
```bash
echo "=== Cleanup verification ==="

# Should all return NOTHING:
ls /home/justin/*.md 2>/dev/null | wc -l  # Expected: 0
ls /home/justin/feedback/ 2>/dev/null && echo "❌ VIOLATION" || echo "✅ Clean"
ls /home/justin/docs/ 2>/dev/null && echo "❌ VIOLATION" || echo "✅ Clean"

# Project root should have minimal .md files
ls ~/HotDash/hot-dash/*.md | grep -v "README.md\|CONTRIBUTING.md\|CHANGELOG.md" | wc -l
# Expected: 0 (only standard project files allowed in root)

echo "=== Cleanup verification complete ==="
```

**Checkpoint**: ✅ No violations, workspace clean

---

## 📋 PHASE 2: ARCHIVE FEEDBACK (3-5 minutes if needed)

### Step 5: Check Feedback File Size (30 seconds)

```bash
wc -l feedback/<your-agent>.md
# If >500 lines: Archive required
# If <500 lines: Skip to Step 7
```

---

### Step 6: Archive & Summarize (if >500 lines) (3-5 minutes)

**6A. Create archive**:
```bash
mkdir -p artifacts/<your-agent>

# Save full history
cp feedback/<your-agent>.md artifacts/<your-agent>/feedback-archive-$(date +%Y-%m-%d-%H%M).md

echo "✅ Archived to: artifacts/<your-agent>/feedback-archive-$(date +%Y-%m-%d-%H%M).md"
```

**6B. Create current status summary**:
```bash
# Create new feedback file with CURRENT STATUS at top
cat > feedback/<your-agent>.md << 'EOF'
---
agent: <your-agent>
started: YYYY-MM-DD
---

# <Your-Agent> — Feedback Log

## CURRENT STATUS (Updated: YYYY-MM-DD HH:MM UTC)

**Working on**: Task X from docs/directions/<your-agent>.md  
**Progress**: [Not started / 25% / 50% / 75% / Complete / Blocked]  
**Blockers**: [None / Waiting for Agent Y to complete Task Z]  
**Next session starts with**: [Specific action - exact command or task description]  
**Last updated**: YYYY-MM-DD HH:MM UTC

### Recent Completions (Last 7 Days)
- Task A: ✅ Complete (YYYY-MM-DD) - Evidence: path/to/artifact
- Task B: ✅ Complete (YYYY-MM-DD) - Evidence: path/to/artifact
- Task C: ⏳ In Progress (50%) - Will resume next session

### Archived History
**Full session logs**: artifacts/<your-agent>/feedback-archive-YYYY-MM-DD-HHMM.md

---

## Session Log (Recent Work)

EOF
```

**6C. Append recent work** (last 200 lines from archive):
```bash
tail -200 artifacts/<your-agent>/feedback-archive-$(date +%Y-%m-%d)*.md >> feedback/<your-agent>.md
```

**6D. Verify new size**:
```bash
wc -l feedback/<your-agent>.md
# Should be ~250 lines (summary + recent work)
```

**Checkpoint**: ✅ Feedback file clean, history preserved

---

## 📊 PHASE 3: DOCUMENT SESSION (2-3 minutes)

### Step 7: Create Evidence Bundle (if tasks completed) (2 minutes)

**If you completed tasks this session**:
```bash
# Create evidence folder for completed work
mkdir -p artifacts/<your-agent>/session-$(date +%Y-%m-%d)/

# Copy evidence files
cp [screenshots] artifacts/<your-agent>/session-$(date +%Y-%m-%d)/
cp [log outputs] artifacts/<your-agent>/session-$(date +%Y-%m-%d)/
cp [test results] artifacts/<your-agent>/session-$(date +%Y-%m-%d)/

# Create evidence index
cat > artifacts/<your-agent>/session-$(date +%Y-%m-%d)/EVIDENCE.md << EOF
# Evidence Bundle - $(date +%Y-%m-%d)

**Agent**: <your-agent>
**Session**: $(date +%Y-%m-%d)

## Tasks Completed
- Task X: [description]
- Task Y: [description]

## Evidence Files
- screenshot-1.png - [what it shows]
- output.log - [command output from Task X]
- test-results.json - [test pass/fail results]

## Review
All evidence for tasks completed this session.
For detailed log, see feedback/<your-agent>.md
EOF

echo "✅ Evidence bundle: artifacts/<your-agent>/session-$(date +%Y-%m-%d)/"
```

**Checkpoint**: ✅ Evidence organized and discoverable

---

### Step 8: Log Session End (1 minute)

```bash
cat >> feedback/<your-agent>.md << EOF

---

## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Session Ended

**Duration**: [X hours]
**Tasks completed**: [List task IDs/names]
**Tasks in progress**: [None / Task X at 50%]
**Blockers encountered**: [None / Blocked by Agent Y on Task Z]
**Evidence created**: artifacts/<your-agent>/session-$(date +%Y-%m-%d)/
**Files modified**: [Key files you changed]

**Next session starts with**: [Specific action]
- Command: [\`exact command to run\`]
- Task: [Task X from direction file]
- Expected outcome: [What success looks like]

**Shutdown checklist**: ✅ Complete - Violations cleaned, feedback archived, evidence bundled

EOF
```

**Checkpoint**: ✅ Complete session record

---

## 💾 PHASE 4: COMMIT & VERIFY (2-3 minutes)

### Step 9: Commit All Work (2 minutes)

```bash
# Stage your changes
git add feedback/<your-agent>.md
git add artifacts/<your-agent>/
git add [any other files you modified]

# Review what you're committing
git status
git diff --cached --stat

# Commit with clear message
git commit -m "feat(<your-agent>): session complete - [brief summary]

Tasks completed:
- Task X: [what you did]
- Task Y: [what you did]

Blockers:
- [None / Blocker: Waiting for Z]

Evidence: artifacts/<your-agent>/session-$(date +%Y-%m-%d)/
Feedback: See feedback/<your-agent>.md for details"

# Verify commit
git log -1 --oneline
```

**Checkpoint**: ✅ All work committed

---

### Step 10: Final Verification (1 minute)

**Run cleanup verification**:
```bash
echo "=== Final Cleanup Verification ==="

# No files outside project
ls /home/justin/*.md 2>/dev/null | wc -l
# Expected: 0

ls /home/justin/feedback/ 2>/dev/null && echo "❌ VIOLATION DETECTED" || echo "✅ Clean"
ls /home/justin/docs/ 2>/dev/null && echo "❌ VIOLATION DETECTED" || echo "✅ Clean"

# No violation files in project root
ls ~/HotDash/hot-dash/*_RESTART_*.md ~/HotDash/hot-dash/*_STATUS_*.md ~/HotDash/hot-dash/*_SUMMARY_*.md ~/HotDash/hot-dash/*_COMPLETE_*.md 2>/dev/null | wc -l
# Expected: 0

# Feedback file reasonable size
wc -l feedback/<your-agent>.md
# Expected: <500 lines

# Git clean
git status -s | wc -l
# Expected: 0 (all committed)

echo "✅ Cleanup verification complete"
```

**Checkpoint**: ✅ No violations, everything clean and committed

---

## 🎯 SHUTDOWN COMPLETE

Your workspace is clean and ready for next session (or other agents to work without confusion).

---

## 📋 SELF-CHECK QUESTIONS

Before you confirm shutdown, verify:

1. ✅ Did I create any files outside `~/HotDash/hot-dash/`? → Merged and deleted
2. ✅ Did I create any status/restart/summary files? → Merged and deleted  
3. ✅ Is my feedback file <500 lines? → Archived if needed
4. ✅ Did I log all work with evidence? → Session end logged
5. ✅ Did I commit everything? → Git status clean
6. ✅ Did I note blockers for manager? → Clearly logged
7. ✅ Does my status summary reflect current state? → Updated today
8. ✅ Do I know what to do next session? → "Next session starts with" documented

**All ✅**: You're ready to shutdown  
**Any ❌**: Complete that step before shutdown

---

## 🚨 COMMON VIOLATIONS & HOW TO FIX

### Violation 1: Files in `/home/justin/`

**Examples found in audit**:
- `AI_RESTART_READY.md`
- `DESIGNER_RESTART_READY.md`
- `INTEGRATIONS_RESTART_CHECKLIST.md`
- `QA_PRE_RESTART_STATUS.md`
- `CEO_RESTART_READY.md`
- `RESTART_CHECKPOINT_RELIABILITY.md`
- `ENGINEER_HELPER_RESTART_CHECKLIST.md`

**Fix**:
```bash
# For each file:
cd ~/HotDash/hot-dash

# Merge into feedback
cat /home/justin/AI_RESTART_READY.md >> feedback/ai.md

# Delete violation
rm /home/justin/AI_RESTART_READY.md

# Log cleanup
echo "## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Cleanup: Merged AI_RESTART_READY.md, removed violation" >> feedback/ai.md
```

---

### Violation 2: Directories Outside Project

**Examples found in audit**:
- `/home/justin/feedback/` (6 files)
- `/home/justin/docs/` (13 files)
- `/home/justin/data/` (4 subdirs)
- `/home/justin/chatwoot/`

**Fix**:
```bash
# Archive entire directory
cd /home/justin
tar -czf ~/HotDash/hot-dash/artifacts/<your-agent>/violations-$(date +%Y-%m-%d).tar.gz feedback/ docs/ data/ chatwoot/ 2>/dev/null

# Delete violations
rm -rf /home/justin/feedback/ /home/justin/docs/ /home/justin/data/ /home/justin/chatwoot/

# Log cleanup
echo "## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Cleanup: Archived violation directories, removed" >> feedback/<your-agent>.md
```

---

### Violation 3: Oversized Feedback File (>500 lines)

**Fix**: Follow Step 6 from Phase 2 (Archive & Summarize)

---

### Violation 4: Duplicate/Extra Documentation

**Examples**:
- Multiple versions of same runbook
- Draft documents never finished
- Abandoned work
- Old screenshots/artifacts not organized

**Fix**:
```bash
# Find duplicates
find docs/<your-domain>/ -name "*draft*" -o -name "*old*" -o -name "*backup*"

# Review each:
# - If valuable: Rename properly, move to correct location
# - If outdated: Delete
# - If duplicate: Keep latest, delete others

# Example:
rm docs/design/approval-queue-ui-DRAFT-v2.md  # Outdated draft
rm docs/design/approval-queue-ui-OLD.md  # Old version
# Keep only: docs/design/approval-queue-ui.md (current)
```

---

## 📊 PHASE 2: UPDATE STATUS SUMMARY (2-3 minutes)

### Step 11: Update "CURRENT STATUS" Section (2 minutes)

**Edit the top of your feedback file to reflect END of this session**:

```markdown
## CURRENT STATUS (Updated: YYYY-MM-DD HH:MM UTC)

**Working on**: Task X from docs/directions/<your-agent>.md  
**Progress**: [Not started / 25% / 50% / 75% / Complete / Blocked]  
**Blockers**: [None / Waiting for Agent Y to complete Task Z]  
**Next session starts with**: [SPECIFIC ACTION]  
**Last updated**: YYYY-MM-DD HH:MM UTC

### Recent Completions (Last 7 Days)
- Task A: ✅ Complete (YYYY-MM-DD) - Evidence: artifacts/<agent>/session-YYYY-MM-DD/
- Task B: ✅ Complete (YYYY-MM-DD) - Evidence: artifacts/<agent>/session-YYYY-MM-DD/
- Task C: ⏳ In Progress (75%) - Resume: [specific next step]

### Archived History
**Full session logs**: artifacts/<your-agent>/feedback-archive-YYYY-MM-DD-HHMM.md
```

**CRITICAL - "Next session starts with" must be SPECIFIC**:
❌ BAD: "Continue working on Task 6"  
✅ GOOD: "Run `npm run build` to verify Task 6 fix, then test approval UI"

**Checkpoint**: ✅ Status summary is current and actionable

---

## 💾 PHASE 3: COMMIT & DOCUMENT (2-3 minutes)

### Step 12: Commit All Changes (2 minutes)

```bash
# Stage everything
git add feedback/<your-agent>.md
git add artifacts/<your-agent>/
git add [any files you modified]

# Review changes
git status
git diff --cached --stat

# Commit with comprehensive message
git commit -m "feat(<your-agent>): session complete - [brief summary]

Session: $(date +%Y-%m-%d)
Duration: [X hours]

Tasks completed:
- Task X: [description] - Evidence: artifacts/<agent>/session-$(date +%Y-%m-%d)/
- Task Y: [description]

Tasks in progress:
- Task Z: 50% complete - Next: [specific action]

Blockers:
- [None / Waiting for Agent A to complete Task B]

Cleanup performed:
- Merged [file1, file2] into feedback
- Removed violations: [list files deleted]
- Archived feedback: [if applicable]

Evidence: artifacts/<your-agent>/session-$(date +%Y-%m-%d)/
Feedback: Updated status summary, archived history"

# Verify commit
git log -1 --stat
```

**Checkpoint**: ✅ Complete session committed with evidence

---

### Step 13: Update Dependency Status (1 minute)

**If other agents depend on your work**:
```bash
# Update shared dependency tracker (if it exists)
# OR clearly log in your feedback what you completed

echo "" >> feedback/<your-agent>.md
echo "**FOR OTHER AGENTS**: Status of dependencies" >> feedback/<your-agent>.md
echo "- Task X (Engineer needs this): ✅ COMPLETE" >> feedback/<your-agent>.md
echo "- Task Y (QA needs this): ⏳ IN PROGRESS (50%)" >> feedback/<your-agent>.md
echo "- Task Z (Deployment needs this): ❌ BLOCKED (waiting for A)" >> feedback/<your-agent>.md
echo "" >> feedback/<your-agent>.md
```

**Benefit**: Other agents can quickly check if they're unblocked

---

## ✅ FINAL STEPS

### Step 14: Log Shutdown Complete (30 seconds)

```bash
echo "**Shutdown complete**: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> feedback/<your-agent>.md
echo "- Violations cleaned: ✅" >> feedback/<your-agent>.md
echo "- Feedback archived: ✅ [or N/A if <500 lines]" >> feedback/<your-agent>.md
echo "- Evidence bundled: ✅" >> feedback/<your-agent>.md
echo "- Status summary updated: ✅" >> feedback/<your-agent>.md
echo "- All work committed: ✅" >> feedback/<your-agent>.md
echo "- Ready for next session: ✅" >> feedback/<your-agent>.md
echo "" >> feedback/<your-agent>.md
```

---

### Step 15: Final Commit (if needed) (30 seconds)

```bash
# If you added shutdown log, commit it
git add feedback/<your-agent>.md
git commit -m "chore(<your-agent>): shutdown complete - workspace clean"
```

---

## 🎯 SHUTDOWN COMPLETE ✅

Your workspace is clean:
- ✅ No violations (files in wrong locations removed)
- ✅ Feedback file clean and summarized (<500 lines)
- ✅ Evidence organized in bundles
- ✅ Status summary current
- ✅ All work committed
- ✅ Clear instructions for next session
- ✅ Dependencies status communicated

**Other agents can now work without being confused by your files.**

---

## ⚡ QUICK SHUTDOWN (Experienced Agents)

**If no violations and feedback <500 lines**:
```bash
cd ~/HotDash/hot-dash

# Quick violation check
ls /home/justin/*.md 2>/dev/null | wc -l  # Must be 0
ls ~/HotDash/hot-dash/*_STATUS_*.md 2>/dev/null | wc -l  # Must be 0

# Update status summary at top of feedback file (manual edit)

# Log session end
echo "## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Session ended, X tasks complete, evidence in artifacts/<agent>/session-$(date +%Y-%m-%d)/" >> feedback/<your-agent>.md

# Commit
git add -A
git commit -m "feat(<your-agent>): session complete - [summary]"

# Done
```

**Time**: 3-5 minutes

---

## 🚨 MANAGER IMPROVEMENT SUGGESTIONS (IMPLEMENTED)

### ✅ Implemented in This Checklist:

1. **Automated Violation Scanner** (Step 1)
   - Script: `./scripts/ops/check-my-violations.sh <agent>`
   - Output: List of files to clean up
   - Saves manual searching

2. **Evidence Bundle** (Step 7)
   - Organized: `artifacts/<agent>/session-YYYY-MM-DD/`
   - Indexed: `EVIDENCE.md` in each bundle
   - Easy for manager/QA to review

3. **"Next Session Starts With"** (Required in status summary)
   - MUST be specific (exact command or action)
   - Prevents confusion on restart
   - Immediate productivity

4. **Dependency Status Update** (Step 13)
   - Communicate what you completed that others need
   - Reduces "are you done yet?" questions
   - Enables parallel work

5. **Feedback Archive at >500 Lines** (Step 6)
   - Prevents oversized feedback files
   - Preserves history
   - Keeps current feedback readable

---

## 📊 METRICS (For Manager to Track)

**Per Agent**:
- Violations found per shutdown
- Feedback file size trend
- Evidence bundle quality
- Time to shutdown (target: <15 min)

**Across Team**:
- Total violations per day (target: 0)
- Agents with clean shutdown (target: 18/18)
- Average feedback file size (target: <400 lines)

---

**Created**: 2025-10-13  
**Owner**: Manager  
**Purpose**: Prevent workspace pollution, maintain clean feedback, enable easy restarts  
**Location**: docs/runbooks/agent_shutdown_checklist.md  
**Critical**: Skipping cleanup creates technical debt that confuses all agents

