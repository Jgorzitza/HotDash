---
epoch: 2025.10.E1
doc: docs/runbooks/agent_shutdown_checklist.md
owner: manager
last_reviewed: 2025-10-13
expires: 2025-10-20
---

# Agent Shutdown Checklist

**Purpose**: Cleanup and shutdown procedure for all agents at end of work session  
**Applies To**: All 18 agents  
**Time**: 10-30 minutes (depending on cleanup needed)  
**Frequency**: End of every work session  
**CRITICAL**: Clean up violations so other agents don't get confused

---

## 🚨 PHASE 1: CLEANUP VIOLATIONS (5-15 minutes)

### Step 1: Scan for Violations (1 minute)

```bash
echo "=== Checking for violations ==="

# Files in home directory (VIOLATION)
ls /home/justin/*.md 2>/dev/null | grep -i "<your-agent>\|restart\|status\|summary\|complete"

# Directories outside project (VIOLATION)
ls /home/justin/feedback/ /home/justin/docs/ /home/justin/data/ /home/justin/<your-agent>/ 2>/dev/null

# Files in project root (VIOLATION)
ls ~/HotDash/hot-dash/*.md 2>/dev/null | grep -i "<your-agent>\|restart\|checklist\|status\|ready\|summary\|complete" | grep -v "README.md\|CONTRIBUTING.md"

# Extra worktrees (VIOLATION)
ls ~/HotDash/ 2>/dev/null | grep -v "^hot-dash$"
```

**Expected**: All commands show NOTHING  
**If violations found**: Proceed to Step 2

---

### Step 2: Merge & Delete Violations (3-10 minutes)

**For EACH violation file found**:

```bash
# Example: You created AI_RESTART_READY.md

# Merge into feedback
echo "" >> feedback/<your-agent>.md
echo "## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Merged AI_RESTART_READY.md" >> feedback/<your-agent>.md
cat ~/HotDash/hot-dash/AI_RESTART_READY.md >> feedback/<your-agent>.md

# Delete violation
rm ~/HotDash/hot-dash/AI_RESTART_READY.md

# Log cleanup
echo "**Cleanup**: Removed AI_RESTART_READY.md (content merged)" >> feedback/<your-agent>.md
```

**Repeat for ALL violations found in Step 1**

**Checkpoint**: ✅ No files outside project, no extra files in root

---

### Step 3: Archive Feedback if >500 Lines (3-5 minutes)

```bash
# Check size
lines=$(wc -l < feedback/<your-agent>.md)

if [ $lines -gt 500 ]; then
  # Archive full history
  mkdir -p artifacts/<your-agent>
  cp feedback/<your-agent>.md artifacts/<your-agent>/feedback-archive-$(date +%Y-%m-%d-%H%M).md
  
  # Create clean version (keep summary + last 200 lines)
  tail -200 feedback/<your-agent>.md > /tmp/<your-agent>-recent.md
  
  # Rebuild with fresh summary + recent work
  cat > feedback/<your-agent>.md << 'EOF'
---
agent: <your-agent>
started: YYYY-MM-DD
---

# <Your-Agent> — Feedback Log

## CURRENT STATUS (Updated: $(date +%Y-%m-%d\ %H:%M) UTC)

**Working on**: [Current task]
**Progress**: [Status]  
**Blockers**: [None/List]
**Next session starts with**: [Specific command to run]
**Last updated**: $(date +%Y-%m-%d\ %H:%M) UTC

### Archived History
**Full logs**: artifacts/<your-agent>/feedback-archive-$(date +%Y-%m-%d-%H%M).md

---

EOF
  
  # Append recent work
  cat /tmp/<your-agent>-recent.md >> feedback/<your-agent>.md
  
  echo "✅ Archived feedback to artifacts/<your-agent>/"
fi
```

**Checkpoint**: ✅ Feedback file <500 lines

---

## 📊 PHASE 2: DOCUMENT SESSION (2-3 minutes)

### Step 4: Update Status Summary (1 minute)

**Edit top of feedback/<your-agent>.md to reflect current state**:
- Update "Working on" - what task you're on now
- Update "Progress" - completion percentage or status
- Update "Blockers" - what's stopping you (if anything)
- Update "Next session starts with" - SPECIFIC command or action
- Update "Last updated" - today's date/time

---

### Step 5: Log Session End (1 minute)

```bash
cat >> feedback/<your-agent>.md << EOF

---

## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Session Ended

**Duration**: [X hours]
**Tasks completed**: [List]
**Tasks in progress**: [None / Task X at 50%]
**Blockers**: [None / Waiting for Y]
**Evidence**: artifacts/<your-agent>/session-$(date +%Y-%m-%d)/
**Files modified**: [Key files]
**Next session starts with**: [Exact action - command or task]

**Shutdown complete**: Violations cleaned ✅, Feedback updated ✅

EOF
```

**Checkpoint**: ✅ Session documented

---

## 💾 PHASE 3: COMMIT & VERIFY (2-5 minutes)

### Step 6: Commit Work (2 minutes)

```bash
git add feedback/<your-agent>.md artifacts/<your-agent>/
git add [other files you modified]

git commit -m "feat(<your-agent>): session complete - [summary]

Tasks: [what you did]
Blockers: [None / List]
Evidence: artifacts/<your-agent>/"

git log -1 --oneline
```

**Checkpoint**: ✅ Work committed

---

### Step 7: Final Verification (1 minute)

```bash
# Verify cleanup
ls /home/justin/*.md 2>/dev/null | wc -l  # Must be 0
ls ~/HotDash/hot-dash/*_STATUS_*.md 2>/dev/null | wc -l  # Must be 0
wc -l feedback/<your-agent>.md  # Should be <500
git status -s  # Should be empty

echo "✅ Shutdown verification complete"
```

**Checkpoint**: ✅ Clean workspace, ready for next session

---

## ⚡ QUICK SHUTDOWN

**If no violations and feedback <500 lines**:
```bash
cd ~/HotDash/hot-dash
ls /home/justin/*.md 2>/dev/null | wc -l  # Quick check
# Update status summary in feedback/<your-agent>.md (manual)
echo "## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Session ended" >> feedback/<your-agent>.md
git add -A && git commit -m "feat(<your-agent>): session complete"
```

**Time**: 3-5 minutes

---

**Created**: 2025-10-13  
**Owner**: Manager  
**Location**: docs/runbooks/agent_shutdown_checklist.md

