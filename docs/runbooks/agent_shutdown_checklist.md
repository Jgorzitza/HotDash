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

## 🎯 HOW TO USE THIS CHECKLIST

**When it's time to shutdown**:
1. Replace `<your-agent>` in all commands with your actual agent name
2. Execute each step in order
3. Confirm shutdown ready at the end

**When CEO says**: "Provide manager feedback"
**You do**: Follow Step 5 (Log Session End) and Step 6 (Performance Review) → Write to `feedback/<your-agent>.md` ONLY

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

## 📊 PHASE 3: PERFORMANCE REVIEW (3-5 minutes)

### Step 6: Review Your Performance (3-5 minutes)

**Before shutdown, reflect on today's work and document for improvement**:

```bash
cat >> feedback/<your-agent>.md << 'EOF'

---

## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Performance Review

### What I Did Well Today (1-2 items)
1. [Specific accomplishment - be honest about what went well]
2. [Another strength from today]

### What I Screwed Up (1 item - be brutally honest)
1. [Specific mistake, wrong decision, or poor execution]
   - Why it happened: [Root cause]
   - How to prevent: [What to do differently]

### Process Improvements for Next Startup (1-2 items)
1. [Change to implement tomorrow - specific action]
2. [Another improvement to try]

### North Star Alignment
**Score**: [1-10, where 10 = perfect alignment]
**Reasoning**: [How did today's work support operator value and 5 tiles?]
**Drift detected**: [None / Yes - worked on X which doesn't support tiles]
**Course correction**: [If drifted, what to focus on tomorrow]

**North Star Check**:
- Did my work support the 5 tiles? [Yes/No - which tiles?]
- Did I deliver operator value TODAY? [Yes/No - what value?]
- Did I use MCP tools (not training data)? [Yes/No - examples]
- Did I provide evidence for all work? [Yes/No - where?]
- Did I work on blockers vs nice-to-haves? [Blockers first? Yes/No]

EOF
```

**Why this matters**:
- Honest self-assessment improves performance
- Manager learns what's working/not working
- Catches drift early
- Builds culture of continuous improvement

**Checkpoint**: ✅ Performance reviewed and documented

---

## 💾 PHASE 4: COMMIT & VERIFY (2-5 minutes)

### Step 7: Commit Work (2 minutes)

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

---

## 📚 RELATED PROCESS DOCUMENTS

**For context and procedures**:
- 🧹 **Startup Checklist**: `docs/runbooks/agent_startup_checklist.md` - Run at session start
- 📝 **Feedback Process**: `docs/policies/agentfeedbackprocess.md` - How to log work properly
- 🎯 **Direction Governance**: `docs/directions/README.md` - How to read your direction
- 📍 **North Star**: `docs/NORTH_STAR.md` - What to align to
- 📋 **Git Protocol**: `docs/git_protocol.md` - How to commit evidence

**Your specific direction**: `docs/directions/<your-agent>.md`

---

**Created**: 2025-10-13  
**Owner**: Manager  
**Protected**: CODEOWNERS (cannot be deleted without CEO approval)  
**Location**: docs/runbooks/agent_shutdown_checklist.md

